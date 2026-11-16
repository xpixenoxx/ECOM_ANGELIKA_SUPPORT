import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockGetUser = vi.fn();
const mockProfileMaybeSingle = vi.fn();
const mockAuditInsert = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockProfileMaybeSingle,
    })),
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    __isServiceRole: true,
    from: vi.fn((table: string) => {
      if (table === 'admin_audit_log') {
        return { insert: mockAuditInsert };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: mockProfileMaybeSingle,
      };
    }),
  },
}));

import {
  requireAdminRole,
  getAdminClient,
  requireAdminApi,
  ALL_ADMIN_ROLES,
  OPS_ADMIN_ROLES,
  OWNER_ADMIN_ROLES,
} from '@/lib/supabase/admin-auth';
import { canAccessAdminPath } from '@/lib/supabase/rbac';
import { verifySameOrigin } from '@/lib/utils/csrf';
import { validateImageBuffer } from '@/lib/utils/file-validation';

describe('Admin RBAC, Fail-Closed Auth, CSRF & Upload Validation', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env['NEXT_PUBLIC_SUPABASE_URL'] = 'https://testproject.supabase.co';
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_anon_key';
    process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_service_role_key';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('fails closed when unauthenticated EVEN IF SUPABASE_SERVICE_ROLE_KEY is set', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const auth = await requireAdminRole(OPS_ADMIN_ROLES);
    expect(auth.authorized).toBe(false);
    expect(auth.status).toBe(401);

    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const clientCtx = await getAdminClient(OPS_ADMIN_ROLES);
    expect(clientCtx.isAdmin).toBe(false);
    expect((clientCtx.supabase as any).__isServiceRole).toBeUndefined();
  });

  it('rejects customer role with 403 and never yields supabaseAdmin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1', email: 'shopper@example.com' } }, error: null });
    mockProfileMaybeSingle.mockResolvedValue({ data: { role: 'customer', email: 'shopper@example.com' }, error: null });

    const auth = await requireAdminRole(ALL_ADMIN_ROLES);
    expect(auth.authorized).toBe(false);
    expect(auth.status).toBe(403);

    const clientCtx = await getAdminClient(ALL_ADMIN_ROLES);
    expect(clientCtx.isAdmin).toBe(false);
    expect((clientCtx.supabase as any).__isServiceRole).toBeUndefined();
  });

  it('enforces role boundaries: designer blocked from OPS, manager blocked from OWNER', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-des', email: 'designer@angelika.com' } }, error: null });
    mockProfileMaybeSingle.mockResolvedValue({ data: { role: 'designer', email: 'designer@angelika.com' }, error: null });

    expect((await requireAdminRole(OPS_ADMIN_ROLES)).authorized).toBe(false);
    expect((await requireAdminRole(ALL_ADMIN_ROLES)).authorized).toBe(true);

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-mgr', email: 'manager@angelika.com' } }, error: null });
    mockProfileMaybeSingle.mockResolvedValue({ data: { role: 'manager', email: 'manager@angelika.com' }, error: null });

    expect((await requireAdminRole(OWNER_ADMIN_ROLES)).authorized).toBe(false);
    expect((await requireAdminRole(OPS_ADMIN_ROLES)).authorized).toBe(true);
  });

  it('grants supabaseAdmin when authorized admin verifies', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-adm', email: 'admin@angelika.com' } }, error: null });
    mockProfileMaybeSingle.mockResolvedValue({ data: { role: 'admin', email: 'admin@angelika.com' }, error: null });

    const ctx = await getAdminClient(OWNER_ADMIN_ROLES);
    expect(ctx.isAdmin).toBe(true);
    expect(ctx.userId).toBe('u-adm');
    expect((ctx.supabase as any).__isServiceRole).toBe(true);
  });

  it('enforces RBAC route path matrix accurately', () => {
    expect(canAccessAdminPath('admin', '/admin/users')).toBe(true);
    expect(canAccessAdminPath('admin', '/admin/settings/payments')).toBe(true);

    expect(canAccessAdminPath('manager', '/admin/orders')).toBe(true);
    expect(canAccessAdminPath('manager', '/admin/products')).toBe(true);
    expect(canAccessAdminPath('manager', '/admin/users')).toBe(false);
    expect(canAccessAdminPath('manager', '/admin/settings/payments')).toBe(false);

    expect(canAccessAdminPath('designer', '/admin/content')).toBe(true);
    expect(canAccessAdminPath('designer', '/admin/looks/new')).toBe(true);
    expect(canAccessAdminPath('designer', '/admin/orders')).toBe(false);
    expect(canAccessAdminPath('designer', '/admin/customers')).toBe(false);

    expect(canAccessAdminPath('customer', '/admin')).toBe(false);
  });

  it('blocks cross-site CSRF origins while permitting same-origin requests', async () => {
    const crossOriginReq = new Request('https://angelikafashions.com/api/admin/content', {
      method: 'POST',
      headers: {
        host: 'angelikafashions.com',
        origin: 'https://evil-attacker.com',
      },
    });
    expect(verifySameOrigin(crossOriginReq).ok).toBe(false);

    const apiGuard = await requireAdminApi(crossOriginReq, OPS_ADMIN_ROLES);
    expect(apiGuard.ok).toBe(false);
    if (!apiGuard.ok) {
      expect(apiGuard.response.status).toBe(403);
    }

    const sameOriginReq = new Request('https://angelikafashions.com/api/admin/content', {
      method: 'POST',
      headers: {
        host: 'angelikafashions.com',
        origin: 'https://angelikafashions.com',
      },
    });
    expect(verifySameOrigin(sameOriginReq).ok).toBe(true);
  });

  it('validates image magic bytes and rejects SVG stored XSS uploads', () => {
    const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 73, 72, 68, 82]);
    expect(validateImageBuffer(pngMagic)).toMatchObject({ valid: true, detectedType: 'png', extension: '.png' });

    const jpgMagic = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 0, 0]);
    expect(validateImageBuffer(jpgMagic)).toMatchObject({ valid: true, detectedType: 'jpeg', extension: '.jpg' });

    const svgXss = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    expect(validateImageBuffer(svgXss).valid).toBe(false);

    const fakeExecutable = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00');
    expect(validateImageBuffer(fakeExecutable).valid).toBe(false);
  });
});
