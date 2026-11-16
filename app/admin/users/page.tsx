'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { RefreshCw, UserPlus, Search, Shield, ExternalLink } from 'lucide-react';
import {
  getCustomers,
  updateCustomerRole,
  inviteAdminUser,
  type CustomerProfile,
} from '@/lib/actions/admin-customers';

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'staff', label: 'Staff' },
  { value: 'ops', label: 'Ops Admin' },
  { value: 'content', label: 'Content Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

const TIER_FILTERS = ['All', 'platinum', 'gold', 'silver', 'bronze'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRole, setActiveRole] = useState('all');
  const [activeTier, setActiveTier] = useState('All');
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'staff' | 'ops' | 'content'>('staff');
  const [inviting, setInviting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getCustomers();
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setUsers(res.customers);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load user profiles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRoleId(userId);
    try {
      const res = await updateCustomerRole(userId, newRole);
      if (!res.success) {
        toast.error(res.error || 'Could not update role.');
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`Updated user role to ${newRole}.`);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await inviteAdminUser({
        email: inviteEmail,
        fullName: inviteName,
        role: inviteRole,
      });
      if (!res.success) {
        toast.error(res.error || 'Could not send invitation.');
        return;
      }
      toast.success(`Invitation / role granted for ${inviteEmail}`);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('staff');
      setInviteOpen(false);
      loadUsers();
    } finally {
      setInviting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (user.full_name || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q) ||
      (user.phone || '').toLowerCase().includes(q);
    const matchesRole = activeRole === 'all' || user.role === activeRole;
    const matchesTier =
      activeTier === 'All' || (user.loyalty_tier || 'bronze').toLowerCase() === activeTier;
    return matchesSearch && matchesRole && matchesTier;
  });

  const stats = {
    total: users.length,
    staffAndAdmins: users.filter((u) =>
      ['owner', 'admin', 'staff', 'ops', 'content'].includes(u.role)
    ).length,
    customers: users.filter((u) => u.role === 'customer').length,
    platinum: users.filter((u) => (u.loyalty_tier || '').toLowerCase() === 'platinum').length,
    gold: users.filter((u) => (u.loyalty_tier || '').toLowerCase() === 'gold').length,
    revenue: users.reduce((sum, u) => sum + (u.total_spent || 0), 0),
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">
            Users &amp; Team Roles
          </h1>
          <p className="text-[var(--color-slate)] mt-1">
            Manage registered profiles, RBAC permissions, and staff invitations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Team Member
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Accounts', value: stats.total, color: undefined },
          { label: 'Admin & Staff', value: stats.staffAndAdmins, color: 'var(--color-gold)' },
          { label: 'Customers', value: stats.customers, color: 'var(--color-success)' },
          { label: 'Platinum Tier', value: stats.platinum, color: 'var(--color-ink)' },
          { label: 'Gold Tier', value: stats.gold, color: '#B45309' },
          {
            label: 'Total Order GMV',
            value: `₹${Math.round(stats.revenue).toLocaleString('en-IN')}`,
            color: 'var(--color-ink)',
          },
        ].map((stat) => (
          <Card key={stat.label} variant="elevated" padding="lg">
            <p className="text-xs text-[var(--color-slate)] mb-1">{stat.label}</p>
            <p
              className="text-2xl font-bold text-[var(--color-ink)] tabular-nums"
              style={stat.color ? { color: stat.color } : undefined}
            >
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800"
        >
          {errorMsg}
        </div>
      )}

      <Card variant="elevated" padding="none">
        <CardHeader className="border-b border-[var(--color-whisper)] p-5">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[var(--color-mist)] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={activeRole} onValueChange={setActiveRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={activeTier} onValueChange={setActiveTier}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Loyalty Tier" />
                </SelectTrigger>
                <SelectContent>
                  {TIER_FILTERS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === 'All' ? 'All Tiers' : t.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>RBAC Role</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Spent (INR)</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-[var(--color-slate)]">
                    Loading profiles from Supabase...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-[var(--color-slate)]">
                    No matching user profiles found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={u.avatar_url || undefined}
                          name={u.full_name || u.email}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/customers/${u.id}`}
                            className="font-medium text-sm text-[var(--color-ink)] hover:text-[var(--color-gold)] inline-flex items-center gap-1"
                          >
                            <span>{u.full_name || 'Unnamed User'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <p className="text-xs text-[var(--color-slate)] font-mono truncate max-w-[180px]">
                            {u.id.slice(0, 8)}…
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-[var(--color-ink)]">{u.email}</p>
                      <p className="text-xs text-[var(--color-slate)]">{u.phone || '—'}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                        <Select
                          value={u.role}
                          onValueChange={(val) => handleRoleChange(u.id, val)}
                          disabled={updatingRoleId === u.id}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {u.loyalty_tier || 'bronze'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {u.order_count || 0}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">
                      ₹{Math.round(u.total_spent || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right text-xs text-[var(--color-slate)]">
                      {new Date(u.created_at).toLocaleDateString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[var(--color-whisper)] max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">
              Invite or Promote Team Member
            </h3>
            <p className="text-xs text-[var(--color-slate)]">
              Owner privilege required. Sends a Supabase Auth invite email or promotes an existing profile.
            </p>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="input-label">Email Address *</label>
                <Input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="team@yourdomain.com"
                />
              </div>
              <div>
                <label className="input-label">Full Name *</label>
                <Input
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Staff Name"
                />
              </div>
              <div>
                <label className="input-label">Assigned Admin Role</label>
                <Select
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as 'admin' | 'staff' | 'ops' | 'content')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="ops">Ops Admin (Orders, Shipments, Returns)</SelectItem>
                    <SelectItem value="content">Content Admin (CMS &amp; Looks)</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)} disabled={inviting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={inviting}>
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
