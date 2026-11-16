/**
 * Pure Edge/Server/Client RBAC Route & Role Matrix
 */

export type AdminRole = 'admin' | 'manager' | 'designer';

export const ALL_ADMIN_ROLES: AdminRole[] = ['admin', 'manager', 'designer'];
export const OPS_ADMIN_ROLES: AdminRole[] = ['admin', 'manager'];
export const CONTENT_ADMIN_ROLES: AdminRole[] = ['admin', 'manager', 'designer'];
export const OWNER_ADMIN_ROLES: AdminRole[] = ['admin'];

const OWNER_ONLY_PREFIXES = ['/admin/users', '/admin/settings'];
const DESIGNER_ALLOWED_PREFIXES = [
  '/admin/content',
  '/admin/looks',
  '/admin/categories',
  '/admin/products/categories',
  '/admin/products/collections',
];

export function isAdminRole(role?: string | null): role is AdminRole {
  return role === 'admin' || role === 'manager' || role === 'designer';
}

export function canAccessAdminPath(role: string | null | undefined, pathname: string): boolean {
  if (!isAdminRole(role)) return false;
  if (role === 'admin') return true;

  const cleanPath = pathname.split('?')[0] || '/admin';

  if (OWNER_ONLY_PREFIXES.some((prefix) => cleanPath === prefix || cleanPath.startsWith(prefix + '/'))) {
    return false;
  }

  if (role === 'manager') {
    return true;
  }

  // role === 'designer'
  if (cleanPath === '/admin' || cleanPath === '/admin/products') {
    return true;
  }
  return DESIGNER_ALLOWED_PREFIXES.some(
    (prefix) => cleanPath === prefix || cleanPath.startsWith(prefix + '/')
  );
}
