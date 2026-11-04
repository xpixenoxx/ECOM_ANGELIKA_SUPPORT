'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils/cn';

const mockUsers = [
  { id: 'usr-1', name: 'Vidhya R.', email: 'vidhya@angelikafashions.com', phone: '9876543210', avatar: '/images/avatar-vidhya.jpg', role: 'Admin', status: 'Active', orders: 24, totalSpent: 89450, joined: '2024-01-15', lastActive: '2026-01-20', tier: 'Platinum' },
  { id: 'usr-2', name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543211', avatar: '/images/avatar-1.jpg', role: 'Customer', status: 'Active', orders: 12, totalSpent: 45600, joined: '2024-06-20', lastActive: '2026-01-18', tier: 'Gold' },
  { id: 'usr-3', name: 'Ananya Reddy', email: 'ananya@example.com', phone: '9876543212', avatar: '/images/avatar-2.jpg', role: 'Customer', status: 'Active', orders: 8, totalSpent: 32100, joined: '2024-09-10', lastActive: '2026-01-20', tier: 'Gold' },
  { id: 'usr-4', name: 'Meera Nair', email: 'meera@example.com', phone: '9876543213', avatar: '/images/avatar-3.jpg', role: 'Customer', status: 'Active', orders: 5, totalSpent: 18900, joined: '2025-01-05', lastActive: '2026-01-15', tier: 'Silver' },
  { id: 'usr-5', name: 'Kavya Patel', email: 'kavya@example.com', phone: '9876543214', avatar: '/images/avatar-4.jpg', role: 'Customer', status: 'Active', orders: 15, totalSpent: 67800, joined: '2024-03-22', lastActive: '2026-01-19', tier: 'Platinum' },
  { id: 'usr-6', name: 'Riya Singh', email: 'riya@example.com', phone: '9876543215', avatar: '/images/avatar-5.jpg', role: 'Customer', status: 'Inactive', orders: 2, totalSpent: 5600, joined: '2025-11-12', lastActive: '2025-12-01', tier: 'Bronze' },
  { id: 'usr-7', name: 'Sneha Gupta', email: 'sneha@example.com', phone: '9876543216', avatar: '/images/avatar-6.jpg', role: 'Customer', status: 'Active', orders: 7, totalSpent: 24500, joined: '2025-04-18', lastActive: '2026-01-20', tier: 'Silver' },
  { id: 'usr-8', name: 'Aditi Joshi', email: 'aditi@example.com', phone: '9876543217', avatar: '/images/avatar-7.jpg', role: 'Customer', status: 'Active', orders: 3, totalSpent: 11200, joined: '2025-08-30', lastActive: '2026-01-17', tier: 'Bronze' },
  { id: 'usr-9', name: 'Pooja Verma', email: 'pooja@example.com', phone: '9876543218', avatar: '/images/avatar-8.jpg', role: 'Customer', status: 'Active', orders: 18, totalSpent: 78900, joined: '2024-02-14', lastActive: '2026-01-20', tier: 'Platinum' },
  { id: 'usr-10', name: 'Team Member', email: 'team@angelikafashions.com', phone: '9876543219', avatar: '/images/avatar-team.jpg', role: 'Staff', status: 'Active', orders: 0, totalSpent: 0, joined: '2024-05-01', lastActive: '2026-01-20', tier: '—' },
];

const roles = ['All', 'Admin', 'Staff', 'Customer'];
const statuses = ['All', 'Active', 'Inactive', 'Banned'];
const tiers = ['All', 'Platinum', 'Gold', 'Silver', 'Bronze'];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRole, setActiveRole] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [activeTier, setActiveTier] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('list');
  const itemsPerPage = 10;

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchesRole = activeRole === 'All' || user.role === activeRole;
    const matchesStatus = activeStatus === 'All' || user.status === activeStatus;
    const matchesTier = activeTier === 'All' || user.tier === activeTier;
    return matchesSearch && matchesRole && matchesStatus && matchesTier;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'Active').length,
    inactive: mockUsers.filter(u => u.status === 'Inactive').length,
    platinum: mockUsers.filter(u => u.tier === 'Platinum').length,
    gold: mockUsers.filter(u => u.tier === 'Gold').length,
    revenue: mockUsers.reduce((sum, u) => sum + u.totalSpent, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">Customers</h1>
          <p className="text-[var(--color-slate)] mt-1">Manage customer accounts and loyalty</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: 'Total Customers', value: stats.total, icon: '👥' },
          { label: 'Active', value: stats.active, icon: '✅', color: 'var(--color-success)' },
          { label: 'Inactive', value: stats.inactive, icon: '😴', color: 'var(--color-slate)' },
          { label: 'Platinum', value: stats.platinum, icon: '💎', color: 'var(--color-gold)' },
          { label: 'Gold', value: stats.gold, icon: '🥇', color: '#FFD700' },
          { label: 'Lifetime Revenue', value: `₹${(stats.revenue / 100000).toFixed(1)}L`, icon: '💰', color: 'var(--color-gold)' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
            <Card variant="elevated" padding="lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--color-slate)] mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-[var(--color-ink)] tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--color-gold-light)] flex items-center justify-center text-2xl">{stat.icon}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="list" onValueChange={setActiveTab} className="mb-6">
        <TabsList className="flex gap-2">
          <TabsTrigger value="list">All Customers</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list">
          {/* Filters */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <Input type="search" placeholder="Search customers..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="pl-12" aria-label="Search customers" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={activeRole} onValueChange={(v) => { setActiveRole(v); setPage(1); }} className="w-[140px]"><SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
              <Select value={activeStatus} onValueChange={(v) => { setActiveStatus(v); setPage(1); }} className="w-[140px]"><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
              <Select value={activeTier} onValueChange={(v) => { setActiveTier(v); setPage(1); }} className="w-[140px]"><SelectTrigger><SelectValue placeholder="Tier" /></SelectTrigger><SelectContent>{tiers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            className="overflow-hidden border border-[var(--color-whisper)] rounded-[var(--radius-xl)] bg-[var(--color-white)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><input type="checkbox" checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0} onChange={(e) => { if (e.target.checked) setSelectedUsers(paginatedUsers.map(u => u.id)); else setSelectedUsers([]); }} aria-label="Select all" className="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--color-whisper)] text-[var(--color-gold)]" /></TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Tier</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">Total Spent</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user, index) => (
                  <TableRow key={user.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                    <TableCell className="w-12"><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={(e) => { if (e.target.checked) setSelectedUsers([...selectedUsers, user.id]); else setSelectedUsers(selectedUsers.filter(id => id !== user.id)); }} aria-label={`Select ${user.name}`} className="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--color-whisper)] text-[var(--color-gold)]" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} name={user.name} size="sm" />
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{user.name}</p>
                          <p className="text-xs text-[var(--color-slate)]">{user.role} • Joined {new Date(user.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <a href={`mailto:${user.email}`} className="text-[var(--color-ink)] hover:underline block">{user.email}</a>
                        <a href={`tel:${user.phone}`} className="text-[var(--color-slate)] hover:underline">{user.phone}</a>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={user.tier === 'Platinum' ? 'gold' : user.tier === 'Gold' ? 'warning' : user.tier === 'Silver' ? 'outline' : user.tier === 'Bronze' ? 'default' : 'outline'}>
                        {user.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono font-medium">{user.orders}</TableCell>
                    <TableCell className="text-right hidden lg:table-cell font-medium text-[var(--color-ink)]">₹{user.totalSpent.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.status === 'Active' ? 'success' : 'default'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell><span className="text-sm text-[var(--color-slate)]">{new Date(user.lastActive).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span></TableCell>
                    <TableCell className="w-24">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="p-1.5" onClick={() => {}} aria-label={`View ${user.name}`}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></Button>
                        <Button variant="ghost" size="sm" className="p-1.5" onClick={() => {}} aria-label={`Edit ${user.name}`}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {paginatedUsers.length === 0 && (
              <div className="p-12 text-center">
                <svg className="h-12 w-12 mx-auto text-[var(--color-mist)] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <h3 className="text-[var(--font-display)] text-lg text-[var(--color-ink)] mb-1">No customers found</h3>
                <p className="text-[var(--color-slate)]">Try adjusting your filters.</p>
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.nav className="flex items-center justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} aria-label="Pagination">
              <p className="text-sm text-[var(--color-slate)]">Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(page * itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> customers</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => { let pageNum; if (totalPages <= 5) pageNum = i + 1; else if (page <= 3) pageNum = i + 1; else if (page >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = page - 2 + i; return <Button key={pageNum} variant={page === pageNum ? 'primary' : 'ghost'} size="sm" className="w-10 h-10" onClick={() => setPage(pageNum)} aria-label={`Page ${pageNum}`} aria-current={page === pageNum ? 'page' : undefined}>{pageNum}</Button>; })}
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></Button>
              </div>
            </motion.nav>
          )}
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant="elevated" padding="lg">
              <CardHeader><CardTitle className="text-[var(--font-display)] text-lg">Customer Segments</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'VIP', criteria: 'Lifetime spend ₹50,000+', count: 120, revenue: '₹12.4L', color: 'var(--color-gold)' },
                    { name: 'Loyal', criteria: 'Lifetime spend ₹10,000-50,000', count: 890, revenue: '₹34.2L', color: '#FFD700' },
                    { name: 'Regular', criteria: 'Lifetime spend ₹1,000-10,000', count: 3450, revenue: '₹67.8L', color: 'var(--color-success)' },
                    { name: 'New', criteria: 'Lifetime spend < ₹1,000', count: 8000, revenue: '₹18.9L', color: 'var(--color-info)' },
                  ].map((segment, i) => (
                    <motion.div key={segment.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 border border-[var(--color-whisper)] rounded-[var(--radius-xl)]">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-[var(--font-display)] text-lg font-medium text-[var(--color-ink)]">{segment.name}</h3>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: segment.color }}>{segment.name.charAt(0)}</div>
                      </div>
                      <p className="text-sm text-[var(--color-slate)] mb-4">{segment.criteria}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-2xl font-bold text-[var(--color-ink)]">{segment.count.toLocaleString()}</p><p className="text-xs text-[var(--color-slate)]">Customers</p></div>
                        <div className="text-right"><p className="text-2xl font-bold text-[var(--color-gold)]">{segment.revenue}</p><p className="text-xs text-[var(--color-slate)]">Revenue</p></div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('list')}>View Customers</Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>            </Card>

            <Card variant="elevated" padding="lg" className="mt-6">
              <CardHeader><CardTitle className="text-[var(--font-display)] text-lg">Segment Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Button variant="outline" onClick={() => {}}><svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>Email Segment</Button>
                  <Button variant="outline" onClick={() => {}}><svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.48-1.653-1.653-.173-.173-.447-.298-.644-.075-.198.199-.867.868-.967 1.164-.199.297-.247.496-.15.67.098.272.816.99 1.065 1.28.148.198.298.347.496.471.198.198.471.297.67.149l.767-.693c.272-.248.495-.373.57-.373.148 0 .297.149.372.373.149.423.448 1.272.94 1.988.463.68 1.255 1.165 1.475 1.288.198.124.272.223.397.198.149-.025.422-.248.57-.471.148-.223.172-.57.074-.766-.124-.198-.522-.692-1.018-1.307-.448-.57-1.14-1.294-1.717-1.815-.547-.5-.838-.766-.966-.866-.128-.099-.273-.099-.423 0-.15.074-.322.223-.495.372-.173.149-.347.198-.52.198-.174 0-.347-.099-.52-.247-.173-.148-.322-.247-.495-.247-.199 0-.372.098-.52.247l-.645.618c-.15.148-.173.297-.024.471.1.1.247.223.372.322.15.1.323.149.496.149.199 0 .397-.05.546-.149.148-.099.247-.248.296-.423.048-.173 0-.397-.024-.57-.024-.173-.024-.347-.074-.52-.149zM20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>WhatsApp Broadcast</Button>
                  <Button variant="primary" onClick={() => {}}><svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M2 12l7.15-2.86M2 22l7.15-7.15M22 12l-7.15-2.86M22 22l-7.15-7.15"/></svg>Export CSV</Button>
                </div>
              </CardContent>            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}