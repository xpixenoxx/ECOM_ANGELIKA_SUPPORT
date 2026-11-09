'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from '@/components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils/cn';
import {
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  User,
  Coins,
  Gift,
  Percent,
  Truck,
  History,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { LoyaltyStats, LoyaltyTransaction, LoyaltyTier, LoyaltyEarningRule, LoyaltyRedemptionRule, LoyaltyTransactionType } from '@/lib/actions/loyalty-types';

interface LoyaltyClientProps {
  initialStats: LoyaltyStats;
  initialTransactions: LoyaltyTransaction[];
  initialTotal: number;
  tiers: LoyaltyTier[];
  earningRules: LoyaltyEarningRule[];
  redemptionRules: LoyaltyRedemptionRule[];
}

const TRANSACTION_TYPE_LABELS: Record<LoyaltyTransactionType, string> = {
  earn_purchase: 'Purchase',
  earn_signup: 'Signup Bonus',
  earn_review: 'Review',
  earn_referral: 'Referral',
  earn_birthday: 'Birthday',
  earn_social: 'Social Share',
  earn_manual: 'Manual Add',
  redeem_discount: 'Discount Redeemed',
  redeem_shipping: 'Free Shipping',
  redeem_gift: 'Gift Redeemed',
  expire: 'Expired',
  adjust: 'Adjustment',
};

const TRANSACTION_TYPE_COLORS: Record<LoyaltyTransactionType, string> = {
  earn_purchase: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  earn_signup: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  earn_review: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  earn_referral: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  earn_birthday: 'bg-[var(--color-purple-bg)] text-[var(--color-purple)]',
  earn_social: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  earn_manual: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  redeem_discount: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
  redeem_shipping: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
  redeem_gift: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
  expire: 'bg-[var(--color-slate-bg)] text-[var(--color-slate)]',
  adjust: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
};

const TRANSACTION_TYPES: { value: LoyaltyTransactionType; label: string }[] = [
  { value: 'earn_purchase', label: 'Earn - Purchase' },
  { value: 'earn_signup', label: 'Earn - Signup Bonus' },
  { value: 'earn_review', label: 'Earn - Review' },
  { value: 'earn_referral', label: 'Earn - Referral' },
  { value: 'earn_birthday', label: 'Earn - Birthday' },
  { value: 'earn_social', label: 'Earn - Social Share' },
  { value: 'earn_manual', label: 'Earn - Manual Add' },
  { value: 'redeem_discount', label: 'Redeem - Discount' },
  { value: 'redeem_shipping', label: 'Redeem - Free Shipping' },
  { value: 'redeem_gift', label: 'Redeem - Gift' },
  { value: 'expire', label: 'Expired' },
  { value: 'adjust', label: 'Adjustment' },
];

export default function LoyaltyClient({
  initialStats,
  initialTransactions,
  initialTotal,
  tiers,
  earningRules,
  redemptionRules,
}: LoyaltyClientProps) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'tiers' | 'earning' | 'redemption'>('overview');
  const [transactions, setTransactions] = useState(initialTransactions);
  const [totalTransactions, setTotalTransactions] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    dateFrom: '',
    dateTo: '',
  });
  const [pointsDialog, setPointsDialog] = useState<{
    open: boolean;
    mode: 'add' | 'deduct';
    userId: string;
    userName: string;
  }>({ open: false, mode: 'add', userId: '', userName: '' });
  const [pointsForm, setPointsForm] = useState({
    points: '',
    type: 'earn_manual' as LoyaltyTransactionType,
    description: '',
    expiresAt: '',
  });

  const totalPages = Math.ceil(totalTransactions / pageSize);

  const fetchTransactions = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'transactions',
        page: page.toString(),
        limit: pageSize.toString(),
      });
      if (filters.type) params.set('type', filters.type);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);

      const res = await fetch(`/api/admin/loyalty?${params}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        setTotalTransactions(data.total || 0);
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      addToast({ title: 'Error', type: 'error', message: 'Failed to fetch transactions' });
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageSize, addToast]);

  const handleAddPoints = async () => {
    if (!pointsDialog.userId || !pointsForm.points || !pointsForm.description) {
      addToast({ title: 'Validation Error', type: 'error', message: 'Please fill all required fields' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: pointsDialog.mode === 'add' ? 'add-points' : 'deduct-points',
          userId: pointsDialog.userId,
          points: parseInt(pointsForm.points),
          type: pointsForm.type,
          description: pointsForm.description,
          expiresAt: pointsForm.expiresAt || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast({ title: 'Success', type: 'success', message: pointsDialog.mode === 'add' ? 'Points added successfully' : 'Points deducted successfully' });
        setPointsDialog({ open: false, mode: 'add', userId: '', userName: '' });
        setPointsForm({ points: '', type: 'earn_manual', description: '', expiresAt: '' });
        fetchTransactions(currentPage);
      } else {
        addToast({ title: 'Error', type: 'error', message: data.error || 'Failed to process' });
      }
    } catch (error) {
      console.error('Add points error:', error);
      addToast({ title: 'Error', type: 'error', message: 'Failed to process points' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPoints = (points: number) => {
    return points >= 0 ? `+${points.toLocaleString()}` : `${points.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">Loyalty Program</h1>
          <p className="text-[var(--color-slate)] mt-1">Manage loyalty points, tiers, and rewards</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-6">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="earning">Earning Rules</TabsTrigger>
          <TabsTrigger value="redemption">Redemption Rules</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {[
              { label: 'Total Members', value: initialStats.totalMembers.toLocaleString(), icon: Users, color: 'var(--color-info)' },
              { label: 'Active Members', value: initialStats.activeMembers.toLocaleString(), icon: User, color: 'var(--color-success)' },
              { label: 'Points Issued', value: initialStats.totalPointsIssued.toLocaleString(), icon: Coins, color: 'var(--color-gold)' },
              { label: 'Points Redeemed', value: initialStats.totalPointsRedeemed.toLocaleString(), icon: Gift, color: 'var(--color-purple)' },
              { label: 'Avg Points/Member', value: initialStats.avgPointsPerMember.toLocaleString(), icon: TrendingUp, color: 'var(--color-teal)' },
              { label: 'Expiring Soon', value: initialStats.pointsExpiringSoon.toLocaleString(), icon: History, color: 'var(--color-warning)' },
            ].map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
                <Card variant="elevated" padding="lg" className="h-full">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-slate)] mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-[var(--color-ink)] tabular-nums">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--color-gold-light)] flex items-center justify-center text-2xl">
                      <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Tier Distribution */}
          <motion.div
            className="grid lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tiers.map((tier) => {
                    const count = initialStats.tierDistribution[tier.name] || 0;
                    const percentage = initialStats.totalMembers > 0 ? (count / initialStats.totalMembers) * 100 : 0;
                    return (
                      <div key={tier.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{tier.icon}</span>
                            <span className="font-medium text-[var(--color-ink)]">{tier.label}</span>
                          </div>
                          <span className="font-mono font-bold text-[var(--color-ink)]">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-[var(--color-whisper)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: tier.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[var(--font-display)] text-lg">Recent Transactions</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-[var(--color-whisper)]">
                  {initialStats.recentTransactions.length > 0 ? (
                    initialStats.recentTransactions.map((tx) => (
                      <div key={tx.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn('px-2 py-1 text-xs font-medium rounded-full', TRANSACTION_TYPE_COLORS[tx.type as LoyaltyTransactionType] || '')}>
                            {TRANSACTION_TYPE_LABELS[tx.type as LoyaltyTransactionType] || tx.type}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-ink)]">{tx.profiles?.full_name || tx.profiles?.email || 'Unknown'}</p>
                            <p className="text-sm text-[var(--color-slate)]">{tx.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={cn('font-mono font-bold', tx.points >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]')}>
                            {formatPoints(tx.points)}
                          </span>
                          <span className="text-sm text-[var(--color-slate)]">{formatDate(tx.created_at)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-[var(--color-slate)]">No recent transactions</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card variant="elevated" padding="none">
            <CardHeader className="p-6 border-b border-[var(--color-whisper)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">All Transactions</h2>
                  <p className="text-[var(--color-slate)]">View and manage loyalty point transactions</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-mist)]" />
                    <Input
                      placeholder="Search user..."
                      value={filters.search}
                      onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filters.type} onValueChange={(v) => setFilters(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {TRANSACTION_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                    placeholder="From"
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                    placeholder="To"
                    className="w-40"
                  />
                  <Button variant="outline" onClick={() => setFilters({ search: '', type: '', dateFrom: '', dateTo: '' })}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Clear
                  </Button>
                  <Button variant="primary" onClick={() => setPointsDialog({ open: true, mode: 'add', userId: '', userName: 'Select User' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adjust Points
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-6 h-6 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
                            <span className="text-[var(--color-slate)]">Loading...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center">
                                <span className="text-[var(--font-display)] text-[var(--color-gold)] font-bold text-sm">
                                  {tx.profiles?.full_name?.charAt(0) || tx.profiles?.email?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-[var(--color-ink)]">{tx.profiles?.full_name || 'Unknown'}</p>
                                <p className="text-sm text-[var(--color-slate)]">{tx.profiles?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('gap-1', TRANSACTION_TYPE_COLORS[tx.type as LoyaltyTransactionType] || '')}>
                              {TRANSACTION_TYPE_LABELS[tx.type as LoyaltyTransactionType] || tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn('font-mono font-bold', tx.points >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]')}>
                            {formatPoints(tx.points)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{tx.description}</TableCell>
                          <TableCell>{tx.order_id ? tx.order_id.slice(-8).toUpperCase() : '-'}</TableCell>
                          <TableCell>{tx.expires_at ? formatDate(tx.expires_at) : '-'}</TableCell>
                          <TableCell className="text-right text-[var(--color-slate)]">{formatDate(tx.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-[var(--color-slate)]">No transactions found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={7} className="py-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--color-slate)]">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalTransactions)} of {totalTransactions}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="px-3 text-sm font-medium text-[var(--color-ink)]">
                              Page {currentPage} of {totalPages || 1}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoading}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers">
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle className="text-[var(--font-display)] text-lg">Loyalty Tiers</CardTitle>
              <p className="text-[var(--color-slate)]">Configure tier thresholds and benefits</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tiers.map((tier) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 border border-[var(--color-whisper)] rounded-[var(--radius-xl)] hover:shadow-[var(--shadow-md)] transition-shadow relative overflow-hidden"
                    style={{ borderTop: `4px solid ${tier.color}` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{tier.icon}</span>
                      <Badge className="text-xs" style={{ backgroundColor: `${tier.color}20`, color: tier.color }}>
                        {tier.label}
                      </Badge>
                    </div>
                    <h3 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)] mb-2">{tier.label}</h3>
                    <p className="text-sm text-[var(--color-slate)] mb-4">
                      {tier.maxPoints
                        ? `${tier.minPoints.toLocaleString()} - ${tier.maxPoints.toLocaleString()} points`
                        : `${tier.minPoints.toLocaleString()}+ points`}
                    </p>
                    <div className="space-y-2 mb-4">
                      {tier.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-slate)]">
                          <svg className="h-4 w-4 text-[var(--color-success)] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {benefit}
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-[var(--color-whisper)]">
                      <span className="text-xs text-[var(--color-mist)]">Members: {initialStats.tierDistribution[tier.name] || 0}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earning Rules Tab */}
        <TabsContent value="earning">
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle className="text-[var(--font-display)] text-lg">Earning Rules</CardTitle>
              <p className="text-[var(--color-slate)]">Configure how customers earn loyalty points</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earningRules.map((rule) => (
                  <div key={rule.id} className="p-4 border border-[var(--color-whisper)] rounded-[var(--radius-lg)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-[var(--font-display)] text-base font-medium text-[var(--color-ink)]">{rule.name}</h4>
                        <Badge variant={rule.isActive ? 'success' : 'default'}>{rule.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      <p className="text-sm text-[var(--color-slate)]">{rule.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--color-slate)]">
                        <span>{rule.pointsPerAmount} point{rule.pointsPerAmount !== 1 ? 's' : ''} per ₹{rule.amount}</span>
                        <span>Multiplier: {rule.multiplier}x</span>
                        <span>Applies to: {rule.appliesTo}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redemption Rules Tab */}
        <TabsContent value="redemption">
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle className="text-[var(--font-display)] text-lg">Redemption Rules</CardTitle>
              <p className="text-[var(--color-slate)]">Configure rewards customers can redeem points for</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {redemptionRules.map((rule) => (
                  <div key={rule.id} className="p-4 border border-[var(--color-whisper)] rounded-[var(--radius-lg)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-[var(--font-display)] text-base font-medium text-[var(--color-ink)]">{rule.name}</h4>
                        <Badge variant={rule.isActive ? 'success' : 'default'}>{rule.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      <p className="text-sm text-[var(--color-slate)]">{rule.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--color-slate)]">
                        <span className="font-medium text-[var(--color-error)]">{rule.pointsRequired.toLocaleString()} points</span>
                        {rule.rewardType === 'discount_fixed' && (
                          <span>₹{rule.rewardValue} off</span>
                        )}
                        {rule.rewardType === 'discount_percent' && (
                          <span>{rule.rewardValue}% off</span>
                        )}
                        {rule.rewardType === 'free_shipping' && (
                          <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Free Shipping</span>
                        )}
                        {rule.rewardType === 'gift' && (
                          <span className="flex items-center gap-1"><Gift className="h-4 w-4" /> Gift</span>
                        )}
                        {rule.minOrderAmount && <span>Min order: ₹{rule.minOrderAmount}</span>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Adjust Points Modal */}
      <Modal
        isOpen={pointsDialog.open}
        onClose={() => setPointsDialog({ open: false, mode: 'add', userId: '', userName: '' })}
        title={pointsDialog.mode === 'add' ? 'Add Points' : 'Deduct Points'}
        description={`Adjust loyalty points for ${pointsDialog.userName}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Points</label>
            <Input
              type="number"
              min="1"
              value={pointsForm.points}
              onChange={(e) => setPointsForm(f => ({ ...f, points: e.target.value }))}
              placeholder="Enter points"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Transaction Type</label>
            <Select value={pointsForm.type} onValueChange={(v) => setPointsForm(f => ({ ...f, type: v as LoyaltyTransactionType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Description</label>
            <Input
              value={pointsForm.description}
              onChange={(e) => setPointsForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Reason for adjustment"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Expires At (optional)</label>
            <Input
              type="date"
              value={pointsForm.expiresAt}
              onChange={(e) => setPointsForm(f => ({ ...f, expiresAt: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setPointsDialog({ open: false, mode: 'add', userId: '', userName: '' })}>Cancel</Button>
          <Button onClick={handleAddPoints} disabled={isLoading}>
            {isLoading ? 'Processing...' : pointsDialog.mode === 'add' ? 'Add Points' : 'Deduct Points'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}