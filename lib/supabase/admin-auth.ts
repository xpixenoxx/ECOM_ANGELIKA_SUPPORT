import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { hasValidServiceRoleKey, hasValidSupabaseConfig, isLocalDevBypassAllowed } from '@/lib/env';
import { verifySameOrigin } from '@/lib/utils/csrf';
import type { Json } from '@/types/database';
import {
  AdminRole,
  ALL_ADMIN_ROLES,
  OPS_ADMIN_ROLES,
  CONTENT_ADMIN_ROLES,
  OWNER_ADMIN_ROLES,
  isAdminRole,
} from './rbac';

export {
  ALL_ADMIN_ROLES,
  OPS_ADMIN_ROLES,
  CONTENT_ADMIN_ROLES,
  OWNER_ADMIN_ROLES,
  isAdminRole,
  type AdminRole,
};

export interface AdminAuthContext {
  authorized: boolean;
  userId: string | null;
  role: AdminRole | null;
  email: string | null;
  isBypass?: boolean;
  error?: string;
  status: number;
}

/**
 * Fail-closed Admin Role Verification.
 * Never trusts SUPABASE_SERVICE_ROLE_KEY presence as authorization.
 */
export async function requireAdminRole(
  allowedRoles: AdminRole[] = OPS_ADMIN_ROLES
): Promise<AdminAuthContext> {
  if (!hasValidSupabaseConfig()) {
    if (isLocalDevBypassAllowed()) {
      return {
        authorized: true,
        userId: null,
        role: 'admin',
        email: 'dev-bypass@localhost',
        isBypass: true,
        status: 200,
      };
    }
    return {
      authorized: false,
      userId: null,
      role: null,
      email: null,
      error: 'Authentication service is not configured',
      status: 401,
    };
  }

  try {
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user ?? null;

    if (authError || !user) {
      if (isLocalDevBypassAllowed()) {
        return {
          authorized: true,
          userId: null,
          role: 'admin',
          email: 'dev-bypass@localhost',
          isBypass: true,
          status: 200,
        };
      }
      return {
        authorized: false,
        userId: null,
        role: null,
        email: null,
        error: 'Authentication required',
        status: 401,
      };
    }

    const reader = hasValidServiceRoleKey() ? supabaseAdmin : supabase;
    const { data: profile, error: profileError } = await reader
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return {
        authorized: false,
        userId: user.id,
        role: null,
        email: user.email ?? null,
        error: 'Admin profile not found',
        status: 403,
      };
    }

    const roleValue = profile.role as string | null;
    if (!isAdminRole(roleValue) || !allowedRoles.includes(roleValue)) {
      return {
        authorized: false,
        userId: user.id,
        role: isAdminRole(roleValue) ? roleValue : null,
        email: profile.email || user.email || null,
        error: 'Forbidden: insufficient permissions',
        status: 403,
      };
    }

    return {
      authorized: true,
      userId: user.id,
      role: roleValue,
      email: profile.email || user.email || null,
      status: 200,
    };
  } catch (err) {
    console.error('[requireAdminRole] auth check failed:', err);
    return {
      authorized: false,
      userId: null,
      role: null,
      email: null,
      error: 'Authentication failed',
      status: 401,
    };
  }
}

/**
 * Returns `supabaseAdmin` ONLY after verifying the active session has one of `allowedRoles`.
 * Unauthorized callers never receive the service-role client.
 */
export async function getAdminClient(allowedRoles: AdminRole[] = OPS_ADMIN_ROLES) {
  const auth = await requireAdminRole(allowedRoles);
  if (!auth.authorized) {
    return {
      supabase: createClient(),
      isAdmin: false,
      userId: auth.userId,
      role: auth.role,
      error: auth.error || 'Unauthorized',
      status: auth.status,
    };
  }

  return {
    supabase: supabaseAdmin,
    isAdmin: true,
    userId: auth.userId,
    role: auth.role,
    error: undefined,
    status: 200,
  };
}

/**
 * Route-handler guard combining same-origin CSRF validation and RBAC role check.
 */
export async function requireAdminApi(
  request: Request,
  allowedRoles: AdminRole[] = OPS_ADMIN_ROLES
): Promise<
  | { ok: true; auth: AdminAuthContext }
  | { ok: false; response: NextResponse }
> {
  const originCheck = verifySameOrigin(request);
  if (!originCheck.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: originCheck.reason || 'Forbidden cross-origin request' },
        { status: 403 }
      ),
    };
  }

  const auth = await requireAdminRole(allowedRoles);
  if (!auth.authorized) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.status }
      ),
    };
  }

  return { ok: true, auth };
}

/**
 * Records an immutable audit entry in `public.admin_audit_log`.
 */
export async function logAdminAction(params: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeState?: unknown;
  afterState?: unknown;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!hasValidServiceRoleKey()) {
    return;
  }

  try {
    let resolvedActorId = params.actorId ?? null;
    if (!resolvedActorId) {
      try {
        const client = createClient();
        const { data } = await client.auth.getUser();
        resolvedActorId = data?.user?.id ?? null;
      } catch {
        resolvedActorId = null;
      }
    }

    const { error } = await supabaseAdmin.from('admin_audit_log').insert({
      actor_id: resolvedActorId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      before_state: (params.beforeState ?? null) as Json | null,
      after_state: (params.afterState ?? null) as Json | null,
      metadata: (params.metadata ?? {}) as Json,
    });

    if (error) {
      console.error('[logAdminAction] insert failed:', error.message);
    }
  } catch (err) {
    console.error('[logAdminAction] unexpected error:', err);
  }
}
