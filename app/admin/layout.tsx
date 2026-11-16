import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { ALL_ADMIN_ROLES, requireAdminRole } from '@/lib/supabase/admin-auth';
import { AdminShell } from './_components/AdminShell';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await requireAdminRole(ALL_ADMIN_ROLES);

  if (!auth.authorized || !auth.role) {
    if (auth.status === 401) {
      redirect('/login?redirect=/admin');
    }
    redirect('/');
  }

  return (
    <AdminShell initialRole={auth.role} initialEmail={auth.email}>
      {children}
    </AdminShell>
  );
}
