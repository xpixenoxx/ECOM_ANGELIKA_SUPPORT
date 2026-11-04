'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  RefreshCw,
  Search,
  Filter,
  Eye,
  Truck,
  RotateCcw,
  CreditCard,
  Package,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { ReturnWithDetails, ReturnStatus, ReturnFilters, ReturnType, ReturnReason } from '@/lib/actions/returns-types';

interface ReturnsClientProps {
  initialStats: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    completedRequests: number;
    rejectedRequests: number;
    totalRefundAmount: number;
    avgProcessingDays: number;
    returnRate: number;
    recentReturns: ReturnWithDetails[];
  };
  initialReturns: ReturnWithDetails[];
  initialTotal: number;
  statuses: ReturnStatus[];
  types: { value: ReturnType; label: string; icon: string }[];
  reasons: { value: ReturnReason; label: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  more_info_needed: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  approved: 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]',
  picked_up: 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]',
  received: 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]',
  inspected: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  refunded: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  exchanged: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  rejected: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
  cancelled: 'bg-[var(--color-slate-bg)] text-[var(--color-slate)]',
};

const TYPE_ICONS: Record<ReturnType, string> = {
  return: '↩️',
  exchange: '🔄',
};

const REASON_LABELS: Record<ReturnReason, string> = {
  wrong_size: 'Wrong Size',
  wrong_color: 'Wrong Color',
  not_as_described: 'Not as Described',
  damaged: 'Damaged/Defective',
  quality_issue: 'Quality Issue',
  changed_mind: 'Changed Mind',
  late_delivery: 'Late Delivery',
  other: 'Other',
};

export default function ReturnsClient({
  initialStats,
  initialReturns,
  initialTotal,
  statuses,
  types,
  reasons,
}: ReturnsClientProps) {
  const { addToast } = useToast();
  const [returns, setReturns] = useState(initialReturns);
  const [totalReturns, setTotalReturns] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<ReturnFilters>({
    status: '',
    type: '',
    reason: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; return: ReturnWithDetails | null }>({ open: false, return: null });
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'status' | 'pickup' | 'refund' | 'exchange' | null;
    return: ReturnWithDetails | null;
  }>({ open: false, action: null, return: null });
  const [actionForm, setActionForm] = useState({
    status: '',
    adminNotes: '',
    courierPartner: '',
    pickupAddress: {
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
    scheduledAt: '',
    refundAmount: '',
    paymentMethod: 'original' as 'original' | 'wallet' | 'bank_transfer',
    exchangeVariantId: '',
  });

  const totalPages = Math.ceil(totalReturns / pageSize);

  const fetchReturns = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });
      if (filters.status) params.set('status', filters.status);
      if (filters.type) params.set('type', filters.type);
      if (filters.reason) params.set('reason', filters.reason);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/admin/returns?${params}`);
      const data = await res.json();
      if (data.success) {
        setReturns(data.returns || []);
        setTotalReturns(data.total || 0);
      }
    } catch (error) {
      console.error('Fetch returns error:', error);
      addToast({ type: 'error', message: 'Failed to fetch returns' });
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageSize, addToast]);

  const handleAction = async () => {
    if (!actionDialog.return || !actionDialog.action) return;

    const returnId = actionDialog.return.id;
    let result: { success: boolean; error?: string };

    setIsLoading(true);
    try {
      switch (actionDialog.action) {
        case 'status': {
          const res = await fetch('/api/admin/returns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update-status',
              id: returnId,
              status: actionForm.status,
              adminNotes: actionForm.adminNotes,
            }),
          });
          result = await res.json();
          break;
        }
        case 'pickup': {
          const res = await fetch('/api/admin/returns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'schedule-pickup',
              returnId,
              courierPartner: actionForm.courierPartner,
              pickupAddress: actionForm.pickupAddress,
              scheduledAt: actionForm.scheduledAt,
            }),
          });
          result = await res.json();
          break;
        }
        case 'refund': {
          const res = await fetch('/api/admin/returns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'process-refund',
              returnId,
              refundAmount: parseFloat(actionForm.refundAmount),
              paymentMethod: actionForm.paymentMethod,
              notes: actionForm.adminNotes,
            }),
          });
          result = await res.json();
          break;
        }
        case 'exchange': {
          const res = await fetch('/api/admin/returns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'process-exchange',
              returnId,
              exchangeVariantId: actionForm.exchangeVariantId,
              notes: actionForm.adminNotes,
            }),
          });
          result = await res.json();
          break;
        }
        default:
          result = { success: false, error: 'Invalid action' };
      }

      if (result.success) {
        addToast({ type: 'success', message: 'Action completed successfully' });
        setActionDialog({ open: false, action: null, return: null });
        fetchReturns(currentPage);
      } else {
        addToast({ type: 'error', message: result.error || 'Action failed' });
      }
    } catch (error) {
      console.error('Action error:', error);
      addToast({ type: 'error', message: 'Action failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const openActionDialog = (action: 'status' | 'pickup' | 'refund' | 'exchange', returnData: ReturnWithDetails) => {
    setActionDialog({ open: true, action, return: returnData });
    setActionForm({
      status: '',
      adminNotes: '',
      courierPartner: '',
      pickupAddress: {
        name: returnData.user?.full_name || '',
        phone: returnData.user?.phone || '',
        address: returnData.order?.shipping_address?.address || '',
        city: returnData.order?.shipping_address?.city || '',
        state: returnData.order?.shipping_address?.state || '',
        pincode: returnData.order?.shipping_address?.pincode || '',
      },
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      refundAmount: returnData.order_item?.unit_price?.toString() || '',
      paymentMethod: 'original',
      exchangeVariantId: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
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

  const getStatusConfig = (status: string) => {
    return statuses.find(s => s.value === status);
  };

  const getAllowedActions = (returnData: ReturnWithDetails) => {
    const statusConfig = getStatusConfig(returnData.status);
    if (!statusConfig) return [];

    const actions: string[] = [];
    if (statusConfig.allowedActions.includes('approve') || statusConfig.allowedActions.includes('schedule_pickup')) {
      actions.push('status');
    }
    if (statusConfig.allowedActions.includes('schedule_pickup')) {
      actions.push('pickup');
    }
    if (statusConfig.allowedActions.includes('process_refund')) {
      actions.push('refund');
    }
    if (statusConfig.allowedActions.includes('process_exchange') && returnData.type === 'exchange') {
      actions.push('exchange');
    }
    return actions;
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
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">Returns & Exchanges</h1>
          <p className="text-[var(--color-slate)] mt-1">Manage return and exchange requests</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {[
          { label: 'Total Requests', value: initialStats.totalRequests, icon: RotateCcw, color: 'var(--color-info)' },
          { label: 'Pending', value: initialStats.pendingRequests, icon: Clock, color: 'var(--color-warning)' },
          { label: 'Approved', value: initialStats.approvedRequests, icon: CheckCircle, color: 'var(--color-primary)' },
          { label: 'Completed', value: initialStats.completedRequests, icon: Package, color: 'var(--color-success)' },
          { label: 'Rejected', value: initialStats.rejectedRequests, icon: XCircle, color: 'var(--color-error)' },
          { label: 'Total Refunds', value: formatCurrency(initialStats.totalRefundAmount), icon: DollarSign, color: 'var(--color-gold)' },
          { label: 'Avg. Days', value: `${initialStats.avgProcessingDays}d`, icon: TrendingUp, color: 'var(--color-teal)' },
          { label: 'Return Rate', value: `${initialStats.returnRate}%`, icon: Users, color: 'var(--color-purple)' },
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

      {/* Returns Table */}
      <Card variant="elevated" padding="none">
        <CardHeader className="p-6 border-b border-[var(--color-whisper)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-[var(--font-display)] text-xl font-medium text-[var(--color-ink)]">All Requests</h2>
              <p className="text-[var(--color-slate)]">View and process return/exchange requests</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-mist)]" />
                <Input
                  placeholder="Search order, customer..."
                  value={filters.search}
                  onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  {statuses.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(v) => setFilters(f => ({ ...f, type: v as ReturnType }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {types.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.reason} onValueChange={(v) => setFilters(f => ({ ...f, reason: v as ReturnReason }))}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Reasons</SelectItem>
                  {reasons.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
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
              <Button variant="outline" onClick={() => setFilters({ status: '', type: '', reason: '', dateFrom: '', dateTo: '', search: '' })}>
                <RefreshCw className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[var(--color-slate)]">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : returns.length > 0 ? (
                  returns.map((ret) => (
                    <TableRow key={ret.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{ret.order?.order_number}</p>
                          <p className="text-sm text-[var(--color-slate)]">{formatDate(ret.order?.created_at || ret.created_at)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{ret.user?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-[var(--color-slate)]">{ret.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('gap-1', ret.type === 'exchange' ? 'bg-[var(--color-purple-bg)] text-[var(--color-purple)]' : '')}>
                          {TYPE_ICONS[ret.type]} {ret.type.charAt(0).toUpperCase() + ret.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={ret.order_item?.product?.images?.[0]?.url || '/placeholder.jpg'}
                            alt={ret.order_item?.product?.name}
                            className="w-12 h-16 object-cover rounded-[var(--radius-md)]"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--color-ink)] truncate max-w-xs">{ret.order_item?.product_name}</p>
                            <p className="text-sm text-[var(--color-slate)]">
                              {ret.order_item?.variant?.size && `Size: ${ret.order_item.variant.size}`}
                              {ret.order_item?.variant?.color && ` • ${ret.order_item.variant.color.name}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {REASON_LABELS[ret.reason as ReturnReason] || ret.reason}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('gap-1', STATUS_COLORS[ret.status] || '')}>
                          {statuses.find(s => s.value === ret.status)?.label || ret.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-medium text-[var(--color-ink)]">
                        {formatCurrency(ret.order_item?.unit_price * (ret.order_item?.quantity || 1))}
                      </TableCell>
                      <TableCell className="text-[var(--color-slate)]">{formatDate(ret.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setDetailDialog({ open: true, return: ret })}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {getAllowedActions(ret).includes('status') && (
                            <Button variant="ghost" size="sm" onClick={() => openActionDialog('status', ret)}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          {getAllowedActions(ret).includes('pickup') && (
                            <Button variant="ghost" size="sm" onClick={() => openActionDialog('pickup', ret)}>
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                          {getAllowedActions(ret).includes('refund') && (
                            <Button variant="ghost" size="sm" onClick={() => openActionDialog('refund', ret)}>
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                          {getAllowedActions(ret).includes('exchange') && (
                            <Button variant="ghost" size="sm" onClick={() => openActionDialog('exchange', ret)}>
                              <Package className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-[var(--color-slate)]">No return requests found</TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={9} className="py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-slate)]">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalReturns)} of {totalReturns}
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

      {/* Detail Modal */}
      <Modal
        isOpen={detailDialog.open}
        onClose={() => setDetailDialog(d => ({ ...d, open: false }))}
        title="Return Details"
        description={`Order: ${detailDialog.return?.order?.order_number}`}
        size="xl"
      >
        {detailDialog.return && (
          <>
              <div className="space-y-6 py-4">
                {/* Customer Info */}
                <div className="grid sm:grid-cols-3 gap-4 p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)]">
                  <div>
                    <p className="text-sm text-[var(--color-slate)]">Customer</p>
                    <p className="font-medium">{detailDialog.return.user?.full_name}</p>
                    <p className="text-sm text-[var(--color-slate)]">{detailDialog.return.user?.email}</p>
                    <p className="text-sm text-[var(--color-slate)]">{detailDialog.return.user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-slate)]">Order</p>
                    <p className="font-medium">{detailDialog.return.order?.order_number}</p>
                    <p className="text-sm text-[var(--color-slate)]">{formatDate(detailDialog.return.order?.created_at || '')}</p>
                    <p className="text-sm text-[var(--color-slate)]">Total: {formatCurrency(detailDialog.return.order?.total_amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-slate)]">Request</p>
                    <p className="font-medium capitalize">{detailDialog.return.type}</p>
                    <p className="text-sm text-[var(--color-slate)]">Reason: {REASON_LABELS[detailDialog.return.reason as ReturnReason] || detailDialog.return.reason}</p>
                    <Badge className={cn('mt-2', STATUS_COLORS[detailDialog.return.status] || '')}>
                      {statuses.find(s => s.value === detailDialog.return.status)?.label || detailDialog.return.status}
                    </Badge>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex gap-4 p-4 border border-[var(--color-whisper)] rounded-[var(--radius-lg)]">
                  <img
                    src={detailDialog.return.order_item?.product?.images?.[0]?.url || '/placeholder.jpg'}
                    alt={detailDialog.return.order_item?.product?.name}
                    className="w-24 h-32 object-cover rounded-[var(--radius-md)]"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--color-ink)]">{detailDialog.return.order_item?.product_name}</h4>
                    <p className="text-sm text-[var(--color-slate)]">Qty: {detailDialog.return.order_item?.quantity}</p>
                    <p className="text-sm text-[var(--color-slate)]">Price: {formatCurrency(detailDialog.return.order_item?.unit_price || 0)}</p>
                    {detailDialog.return.order_item?.variant && (
                      <p className="text-sm text-[var(--color-slate)]">
                        Size: {detailDialog.return.order_item.variant.size}
                        {detailDialog.return.order_item.variant.color && ` • Color: ${detailDialog.return.order_item.variant.color.name}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-ink)]">{formatCurrency(detailDialog.return.refund_amount || 0)}</p>
                    <p className="text-sm text-[var(--color-slate)]">Refund Amount</p>
                  </div>
                </div>

                {/* Images */}
                {detailDialog.return.images && detailDialog.return.images.length > 0 && (
                  <div>
                    <h4 className="font-medium text-[var(--color-ink)] mb-3">Customer Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {detailDialog.return.images.map((img, i) => (
                        <img key={i} src={img} alt={`Return image ${i + 1}`} className="w-full h-32 object-cover rounded-[var(--radius-md)]" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {detailDialog.return.admin_notes && (
                  <div className="p-4 bg-[var(--color-warning-bg)] rounded-[var(--radius-lg)]">
                    <p className="text-sm text-[var(--color-slate)]">Admin Notes</p>
                    <p className="text-[var(--color-ink)]">{detailDialog.return.admin_notes}</p>
                  </div>
                )}

                {/* Pickup Info */}
                {detailDialog.return.pickup_address && (
                  <div className="p-4 bg-[var(--color-info-bg)] rounded-[var(--radius-lg)]">
                    <p className="text-sm text-[var(--color-slate)]">Pickup Scheduled</p>
                    <p className="font-medium">Courier: {detailDialog.return.courier_partner}</p>
                    <p className="text-sm">{detailDialog.return.pickup_address.name}</p>
                    <p className="text-sm">{detailDialog.return.pickup_address.address}, {detailDialog.return.pickup_address.city}, {detailDialog.return.pickup_address.state} - {detailDialog.return.pickup_address.pincode}</p>
                    <p className="text-sm">Phone: {detailDialog.return.pickup_address.phone}</p>
                    {detailDialog.return.pickup_scheduled_at && (
                      <p className="text-sm">Scheduled: {formatDate(detailDialog.return.pickup_scheduled_at)}</p>
                    )}
                    {detailDialog.return.pickup_otp && (
                      <p className="font-mono text-sm">OTP: {detailDialog.return.pickup_otp}</p>
                    )}
                    {detailDialog.return.tracking_number && (
                      <p className="font-mono text-sm">Tracking: {detailDialog.return.tracking_number}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--color-whisper)]">
                  {getAllowedActions(detailDialog.return).map((action) => (
                    <Button
                      key={action}
                      variant={action === 'refund' ? 'primary' : action === 'exchange' ? 'primary' : 'outline'}
                      onClick={() => openActionDialog(action as any, detailDialog.return!)}
                    >
                      {action === 'status' && <RotateCcw className="h-4 w-4 mr-2" />}
                      {action === 'pickup' && <Truck className="h-4 w-4 mr-2" />}
                      {action === 'refund' && <CreditCard className="h-4 w-4 mr-2" />}
                      {action === 'exchange' && <Package className="h-4 w-4 mr-2" />}
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
      </Modal>

      {/* Action Modals */}
      {actionDialog.open && actionDialog.return && actionDialog.action === 'status' && (
        <Modal
          isOpen={actionDialog.open}
          onClose={() => setActionDialog({ open: false, action: null, return: null })}
          title="Update Status"
          description={`Order: ${actionDialog.return.order?.order_number}`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">New Status</label>
              <Select value={actionForm.status} onValueChange={(v) => setActionForm(f => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {getStatusConfig(actionDialog.return.status)?.nextStatuses.map(nextStatus => {
                    const config = statuses.find(s => s.value === nextStatus);
                    return config ? (
                      <SelectItem key={config.value} value={config.value}>{config.label}</SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Admin Notes (optional)</label>
              <Input
                value={actionForm.adminNotes}
                onChange={(e) => setActionForm(f => ({ ...f, adminNotes: e.target.value }))}
                placeholder="Add notes for the customer..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, return: null })}>Cancel</Button>
            <Button onClick={handleAction} disabled={isLoading || !actionForm.status}>
              {isLoading ? 'Processing...' : 'Update Status'}
            </Button>
          </div>
        </Modal>
      )}

      {actionDialog.open && actionDialog.return && actionDialog.action === 'pickup' && (
        <Modal
          isOpen={actionDialog.open}
          onClose={() => setActionDialog({ open: false, action: null, return: null })}
          title="Schedule Pickup"
          description={`Order: ${actionDialog.return.order?.order_number}`}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Courier Partner</label>
              <Input
                value={actionForm.courierPartner}
                onChange={(e) => setActionForm(f => ({ ...f, courierPartner: e.target.value }))}
                placeholder="e.g., Delhivery, Blue Dart, Ekart"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Name</label>
                <Input
                  value={actionForm.pickupAddress.name}
                  onChange={(e) => setActionForm(f => ({ ...f, pickupAddress: { ...f.pickupAddress, name: e.target.value } }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Phone</label>
                <Input
                  value={actionForm.pickupAddress.phone}
                  onChange={(e) => setActionForm(f => ({ ...f, pickupAddress: { ...f.pickupAddress, phone: e.target.value } }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Address</label>
              <Input
                value={actionForm.pickupAddress.address}
                onChange={(e) => setActionForm(f => ({ ...f, pickupAddress: { ...f.pickupAddress, address: e.target.value } }))}
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">City</label>
                <Input
                  value={actionForm.pickupAddress.city}
                  onChange={(e) => setActionForm(f => ({ ...f, pickupAddress: { ...f.pickupAddress, city: e.target.value } }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">State</label>
                <Input
                  value={actionForm.pickupAddress.state}
                  onChange={(e) => setActionForm(f => ({ ...f, pickupAddress: { ...f.pickupAddress, state: e.target.value } }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Pincode</label>
                <Input
                  value={actionForm.pickupAddress.pincode}
                  onChange={(e) => setActionForm(f => ({ ...f, pickupAddress: { ...f.pickupAddress, pincode: e.target.value } }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Scheduled Date/Time</label>
              <Input
                type="datetime-local"
                value={actionForm.scheduledAt}
                onChange={(e) => setActionForm(f => ({ ...f, scheduledAt: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, return: null })}>Cancel</Button>
            <Button onClick={handleAction} disabled={isLoading}>
              {isLoading ? 'Scheduling...' : 'Schedule Pickup'}
            </Button>
          </div>
        </Modal>
      )}

      {actionDialog.open && actionDialog.return && actionDialog.action === 'refund' && (
        <Modal
          isOpen={actionDialog.open}
          onClose={() => setActionDialog({ open: false, action: null, return: null })}
          title="Process Refund"
          description={`Order: ${actionDialog.return.order?.order_number}`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Refund Amount</label>
              <Input
                type="number"
                step="0.01"
                value={actionForm.refundAmount}
                onChange={(e) => setActionForm(f => ({ ...f, refundAmount: e.target.value }))}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Payment Method</label>
              <Select value={actionForm.paymentMethod} onValueChange={(v) => setActionForm(f => ({ ...f, paymentMethod: v as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Payment Method</SelectItem>
                  <SelectItem value="wallet">Wallet/Store Credit</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Notes (optional)</label>
              <Input
                value={actionForm.adminNotes}
                onChange={(e) => setActionForm(f => ({ ...f, adminNotes: e.target.value }))}
                placeholder="Internal notes..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, return: null })}>Cancel</Button>
            <Button onClick={handleAction} disabled={isLoading || !actionForm.refundAmount}>
              {isLoading ? 'Processing...' : 'Process Refund'}
            </Button>
          </div>
        </Modal>
      )}

      {actionDialog.open && actionDialog.return && actionDialog.action === 'exchange' && (
        <Modal
          isOpen={actionDialog.open}
          onClose={() => setActionDialog({ open: false, action: null, return: null })}
          title="Process Exchange"
          description={`Order: ${actionDialog.return.order?.order_number}`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Exchange Variant</label>
              <Input
                value={actionForm.exchangeVariantId}
                onChange={(e) => setActionForm(f => ({ ...f, exchangeVariantId: e.target.value }))}
                placeholder="Enter variant ID or scan barcode"
              />
              <p className="text-xs text-[var(--color-slate)] mt-1">Select the variant to exchange for</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Notes (optional)</label>
              <Input
                value={actionForm.adminNotes}
                onChange={(e) => setActionForm(f => ({ ...f, adminNotes: e.target.value }))}
                placeholder="Internal notes..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, return: null })}>Cancel</Button>
            <Button onClick={handleAction} disabled={isLoading || !actionForm.exchangeVariantId}>
              {isLoading ? 'Processing...' : 'Process Exchange'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}