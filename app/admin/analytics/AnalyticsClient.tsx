'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  MessageSquare,
  Mail,
  ShoppingBag,
  Users,
  MapPin,
  Tag,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  getAnalyticsData,
  type AnalyticsData,
  type AnalyticsTimeRange,
  type DailyTrendItem,
} from '@/lib/actions/admin-analytics';

function formatCurrency(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// Interactive SVG Area/Line Chart with real math coordinates, smooth fill, hover crosshair, and rich tooltip
function InteractiveAreaChart({
  data,
  type = 'revenue',
}: {
  data: DailyTrendItem[];
  type?: 'revenue' | 'orders';
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isRevenue = type === 'revenue';
  const strokeColor = isRevenue ? 'var(--color-gold, #C9A84C)' : 'var(--color-info, #3B82F6)';
  const gradId = isRevenue ? 'revGradReal' : 'ordGradReal';
  const gradStopColor = isRevenue ? '#C9A84C' : '#3B82F6';

  const values = data.map((d) => (isRevenue ? d.revenue : d.ordersCount));
  const rawMax = Math.max(...values, 0);
  const maxValue = rawMax > 0 ? rawMax : isRevenue ? 1000 : 5;

  const width = 500;
  const height = 200;
  const padLeft = 24;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 28;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const points = data.map((d, i) => {
    const val = isRevenue ? d.revenue : d.ordersCount;
    const x = padLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
    const y = padTop + plotHeight - (val / maxValue) * plotHeight;
    return { x, y, val, item: d };
  });

  const linePath =
    points.length > 0
      ? `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
      : '';
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1]!.x.toFixed(1)},${(padTop + plotHeight).toFixed(1)} L ${points[0]!.x.toFixed(1)},${(padTop + plotHeight).toFixed(1)} Z`
      : '';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
    const closestIdx = Math.round(ratio * (points.length - 1));
    setHoveredIdx(closestIdx);
  };

  const activePoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredIdx(null)}
      className="h-64 bg-[var(--color-snow,#FAFAF9)] rounded-[var(--radius-xl,1rem)] relative overflow-hidden select-none cursor-crosshair border border-stone-100"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradStopColor} stopOpacity="0.32" />
            <stop offset="100%" stopColor={gradStopColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid guide lines */}
        {[0, 0.33, 0.66, 1].map((pct, idx) => {
          const yPos = padTop + plotHeight * (1 - pct);
          return (
            <line
              key={idx}
              x1={padLeft}
              y1={yPos}
              x2={width - padRight}
              y2={yPos}
              stroke="#e7e5e4"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Gradient fill area */}
        {areaPath && (
          <path
            d={areaPath}
            fill={`url(#${gradId})`}
          />
        )}

        {/* Stroke line */}
        {linePath && (
          <path
            d={linePath}
            stroke={strokeColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Active hover crosshair and circle */}
        {activePoint && (
          <>
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={padTop + plotHeight}
              stroke={strokeColor}
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="4.5"
              fill={strokeColor}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </>
        )}
      </svg>

      {/* Floating Rich Tooltip */}
      <AnimatePresence>
        {activePoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              transform: 'translateX(-50%)',
              top: '12px',
            }}
            className="absolute z-20 pointer-events-none bg-stone-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl text-center"
          >
            <p className="text-[10px] text-stone-300 font-medium">
              {activePoint.item.label} ({activePoint.item.date})
            </p>
            <p className="text-xs font-bold mt-0.5 text-amber-300">
              {isRevenue ? formatCurrency(activePoint.item.revenue) : `${activePoint.item.ordersCount} orders`}
            </p>
            {isRevenue && (
              <p className="text-[9px] text-stone-300">
                {activePoint.item.ordersCount} {activePoint.item.ordersCount === 1 ? 'order' : 'orders'} • AOV: {formatCurrency(activePoint.item.aov)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Axis dates footer */}
      <div className="absolute bottom-2 left-6 right-6 flex justify-between text-[10px] text-[var(--color-slate,#78716c)] pointer-events-none">
        <span>{data[0]?.label || ''}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label || ''}</span>}
        <span>{data[data.length - 1]?.label || ''}</span>
      </div>
    </div>
  );
}

// Generate & Download Comprehensive CSV Report
function exportAnalyticsCsv(data: AnalyticsData) {
  const rows: string[][] = [
    ['ANGELIKA FASHIONS - ATELIER ANALYTICS REPORT'],
    [`Time Range: ${data.timeRange.toUpperCase()}`],
    [`Generated At: ${new Date().toLocaleString('en-IN')}`],
    [''],
    ['=== OVERVIEW KPIS ==='],
    ['Metric', 'Current Period', 'vs Previous Period', 'Trend'],
    ['Revenue', data.overview.revenue.value, data.overview.revenue.change, data.overview.revenue.trend],
    ['Orders Placed', data.overview.orders.value, data.overview.orders.change, data.overview.orders.trend],
    ['Average Order Value (AOV)', data.overview.aov.value, data.overview.aov.change, data.overview.aov.trend],
    ['Storefront Conversion Rate', data.overview.conversion.value, data.overview.conversion.change, data.overview.conversion.trend],
    ['New Customers Registered', data.overview.newCustomers.value, data.overview.newCustomers.change, data.overview.newCustomers.trend],
    ['Customer Returning Rate', data.overview.returningRate.value, data.overview.returningRate.change, data.overview.returningRate.trend],
    [''],
    ['=== DAILY TRENDS ==='],
    ['Date', 'Revenue (INR)', 'Orders Count', 'AOV (INR)'],
    ...data.charts.revenueTrend.map((d) => [d.date, String(d.revenue), String(d.ordersCount), String(d.aov)]),
    [''],
    ['=== TOP SELLING PRODUCTS ==='],
    ['Product Name', 'Units Sold', 'Revenue (INR)', 'Views', 'Conversion Rate'],
    ...data.products.topSelling.map((p) => [p.name, String(p.sold), String(p.revenue), String(p.views), `${p.conversion}%`]),
    [''],
    ['=== CUSTOMER SEGMENTS ==='],
    ['Segment Tier', 'Customer Count', 'Total Revenue', 'Avg Orders', 'Avg AOV (INR)'],
    ...data.customers.segments.map((s) => [s.segment, String(s.count), s.revenue, String(s.avgOrders), String(s.avgAov)]),
    [''],
    ['=== TOP GEOGRAPHIC CITIES ==='],
    ['City', 'Customer Orders', 'Revenue Generated'],
    ...data.customers.geography.map((g) => [g.city, String(g.customers), g.revenue]),
  ];

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `angelika_analytics_${data.timeRange}_${new Date().toISOString().split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success('Analytics CSV report downloaded successfully!');
}

export default function AnalyticsClient({ initialData }: { initialData: AnalyticsData }) {
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [dateRange, setDateRange] = useState<AnalyticsTimeRange>(initialData.timeRange || '30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Sync fresh data from Supabase
  const refreshData = useCallback(
    async (showNotice = false, selectedRange = dateRange) => {
      setIsRefreshing(true);
      try {
        const fresh = await getAnalyticsData(selectedRange);
        if (fresh) {
          setData(fresh);
          setLastSyncedAt(new Date());
          if (showNotice) {
            toast.success('Analytics synced in real time', { id: 'analytics-sync-toast' });
          }
        }
      } catch (err: any) {
        console.error('Failed to sync analytics:', err);
        if (showNotice) {
          toast.error('Failed to refresh analytics');
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [dateRange]
  );

  const handleRangeChange = (newRange: AnalyticsTimeRange) => {
    setDateRange(newRange);
    refreshData(false, newRange);
  };

  // Real-time Supabase listener
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channelName = `realtime:admin_analytics_${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new as any;
          toast.success(
            `🎉 Order ${newOrder?.order_number || ''} placed (${formatCurrency(Number(newOrder?.total_amount || 0))})`,
            { duration: 4000, icon: '🛍️' }
          );
        }
        refreshData(false);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        refreshData(false);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => {
        refreshData(false);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_conversations' }, () => {
        refreshData(false);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  const overviewCards = [
    { key: 'revenue', label: 'Revenue', ...data.overview.revenue },
    { key: 'orders', label: 'Orders', ...data.overview.orders },
    { key: 'aov', label: 'Aov', ...data.overview.aov },
    { key: 'conversion', label: 'Conversion', ...data.overview.conversion },
    { key: 'newCustomers', label: 'New Customers', ...data.overview.newCustomers },
    { key: 'returningRate', label: 'Returning Rate', ...data.overview.returningRate },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">
              Analytics
            </h1>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>100% Real-Time Live</span>
            </div>
          </div>
          <p className="text-[var(--color-slate)] text-sm mt-1">
            Insights into your store performance • Updated{' '}
            {lastSyncedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Manual Refresh */}
          <button
            onClick={() => refreshData(true)}
            disabled={isRefreshing}
            title="Sync latest live data from Supabase"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin text-[var(--color-gold)]')} />
          </button>

          {/* Time Range Selector */}
          <div className="relative inline-flex items-center bg-white rounded-xl border border-stone-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 ml-3 text-stone-400" />
            <select
              value={dateRange}
              onChange={(e) => handleRangeChange(e.target.value as AnalyticsTimeRange)}
              aria-label="Select Date Range"
              className="text-xs font-semibold text-stone-700 bg-transparent pl-2 pr-8 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Export Report */}
          <button
            onClick={() => exportAnalyticsCsv(data)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 text-xs font-semibold tracking-wider uppercase transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>EXPORT REPORT</span>
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap gap-2 mb-6 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs sm:text-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW                                                */}
        {/* ============================================================== */}
        <TabsContent value="overview">
          {/* Top 6 KPI Metric Cards */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {overviewCards.map((stat, index) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card variant="elevated" padding="lg" className="h-full flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-slate)] mb-1 font-medium">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tabular-nums tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px]">
                    <span
                      className={cn(
                        'font-semibold flex items-center gap-0.5',
                        stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                      )}
                    >
                      {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change}
                    </span>
                    <span className="text-stone-400">vs prev period</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Row */}
          <motion.div
            className="grid lg:grid-cols-2 gap-6 mt-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Revenue Trend Chart */}
            <Card variant="elevated" padding="lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-[var(--font-display)] text-lg">Revenue Trend</CardTitle>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5">
                    Real daily gross revenue for selected window
                  </p>
                </div>
                <Badge variant="gold" className="text-xs font-semibold">
                  {data.overview.revenue.value} Total
                </Badge>
              </CardHeader>
              <CardContent>
                <InteractiveAreaChart data={data.charts.revenueTrend} type="revenue" />
              </CardContent>
            </Card>

            {/* Orders by Day Chart */}
            <Card variant="elevated" padding="lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-[var(--font-display)] text-lg">Orders by Day</CardTitle>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5">
                    Daily order placement volume
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-semibold bg-blue-50 border-blue-200 text-blue-700">
                  {data.overview.orders.value} Orders
                </Badge>
              </CardHeader>
              <CardContent>
                <InteractiveAreaChart data={data.charts.ordersByDay} type="orders" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Conversion Funnel & Device Breakdown */}
          <motion.div
            className="grid lg:grid-cols-2 gap-6 mt-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {/* Conversion Funnel */}
            <Card variant="elevated" padding="lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-[var(--font-display)] text-lg">Conversion Funnel</CardTitle>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Drop-off tracking from storefront browsing to completed purchase
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.funnel.map((funnel) => (
                    <div key={funnel.stage} className="flex items-center gap-3">
                      <div className="w-32 text-xs font-medium text-[var(--color-slate)] truncate">
                        {funnel.stage}
                      </div>
                      <div className="flex-1 h-7 bg-stone-100 rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(funnel.percentage, 2)}%`,
                            backgroundColor: 'var(--color-gold, #C9A84C)',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(funnel.percentage, 2)}%` }}
                        />
                      </div>
                      <div className="w-20 text-right font-mono font-bold text-xs text-[var(--color-ink)]">
                        {funnel.value.toLocaleString()}
                      </div>
                      <div className="w-14 text-right text-xs font-semibold text-[var(--color-slate)]">
                        {funnel.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card variant="elevated" padding="lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-[var(--font-display)] text-lg">Device Breakdown</CardTitle>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Customer platform traffic distribution
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 pt-1">
                  {data.devices.map((item) => (
                    <div key={item.device} className="flex items-center gap-4">
                      <div className="w-20 text-xs font-medium text-[var(--color-slate)]">{item.device}</div>
                      <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="w-16 text-right font-bold text-xs text-[var(--color-ink)]">
                        {item.percentage}%
                      </div>
                    </div>
                  ))}

                  <div className="mt-8 p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900">Mobile-First Bridal &amp; Festive Shoppers</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Over 70% of high-value Indian ethnic couture orders originate from mobile browsers &amp; WhatsApp concierge shares.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 2: TRAFFIC                                                 */}
        {/* ============================================================== */}
        <TabsContent value="traffic">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant="elevated" padding="lg">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4">
                <div>
                  <CardTitle className="text-[var(--font-display)] text-lg">Traffic Acquisition Sources</CardTitle>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5">
                    Total tracked sessions: {data.traffic.total.toLocaleString()}
                  </p>
                </div>
                <Badge variant="gold" className="self-start sm:self-auto text-xs">
                  Organic &amp; Concierge Heavy
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {data.traffic.sources.map((source) => (
                    <motion.div
                      key={source.source}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-xs text-[var(--color-ink)]">{source.source}</div>
                          <Badge
                            variant={source.trend === 'up' ? 'success' : 'error'}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {source.trend === 'up' ? '↑' : '↓'} {source.percentage}%
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-[var(--color-ink)]">
                            {source.visits.toLocaleString()}
                          </span>{' '}
                          <span className="text-[10px] text-[var(--color-slate)]">visits</span>
                        </div>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${source.percentage}%`,
                            backgroundColor: 'var(--color-gold, #C9A84C)',
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 3: PRODUCTS                                                */}
        {/* ============================================================== */}
        <TabsContent value="products">
          <motion.div
            className="grid lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Top Selling Products */}
            <Card variant="elevated" padding="lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-[var(--font-display)] text-lg">Top Selling Products</CardTitle>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Ranked by gross sales volume from real order items
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.products.topSelling.map((product, i) => (
                    <motion.div
                      key={product.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3.5 p-3.5 bg-stone-50 rounded-xl border border-stone-100 hover:border-amber-200 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-[var(--color-ink)] truncate">{product.name}</p>
                        <p className="text-[10px] text-[var(--color-slate)] mt-0.5">
                          {product.views.toLocaleString()} views • {product.conversion}% conversion
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-xs text-[var(--color-ink)]">{product.sold} sold</p>
                        <p className="text-xs font-semibold text-[var(--color-gold)]">
                          ₹{product.revenue.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Needs Attention / Low Conversion */}
            <Card variant="elevated" padding="lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-[var(--font-display)] text-lg">
                  Needs Attention (Low Stock &amp; Conversion)
                </CardTitle>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Items requiring inventory restock or storefront merchandising adjustments
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.products.lowConverting.map((product, i) => (
                    <motion.div
                      key={product.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-3.5 bg-rose-50/50 border border-rose-200/70 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-xs text-rose-950 truncate">{product.name}</p>
                        <Badge variant="error" className="text-[10px]">Attention</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[11px]">
                        <span className="text-stone-600">{product.views.toLocaleString()} views</span>
                        <span className="text-rose-600 font-semibold">{product.conversion}% conv.</span>
                        <span className="text-stone-600 font-medium">{product.sold} remaining stock</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 4: CUSTOMERS                                               */}
        {/* ============================================================== */}
        <TabsContent value="customers">
          <motion.div
            className="grid lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Customer Segments */}
            <Card variant="elevated" padding="lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-[var(--font-display)] text-lg">Customer Segments</CardTitle>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Tier categorization based on verified cumulative order value
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.customers.segments.map((segment) => (
                    <div
                      key={segment.segment}
                      className="p-3.5 bg-stone-50 rounded-xl border border-stone-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-xs text-[var(--color-ink)]">{segment.segment}</h4>
                        <Badge variant="gold" className="text-[10px] font-semibold">
                          {segment.count} {segment.count === 1 ? 'buyer' : 'buyers'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-[var(--color-slate)] block">Revenue</span>
                          <span className="font-bold text-[var(--color-gold)]">{segment.revenue}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--color-slate)] block">Avg Orders</span>
                          <span className="font-bold text-[var(--color-ink)]">{segment.avgOrders}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--color-slate)] block">Avg AOV</span>
                          <span className="font-bold text-[var(--color-ink)]">{formatCurrency(segment.avgAov)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Geographic Cities */}
            <Card variant="elevated" padding="lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-[var(--font-display)] text-lg">Top Cities (Shipping Destinations)</CardTitle>
                <p className="text-xs text-[var(--color-slate)] mt-0.5">
                  Aggregated from customer delivery addresses on confirmed orders
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.customers.geography.map((city, i) => (
                    <div
                      key={city.city}
                      className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-700 font-bold text-xs">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[var(--color-ink)] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {city.city}
                          </p>
                          <p className="text-[10px] text-[var(--color-slate)] mt-0.5">
                            {city.customers} {city.customers === 1 ? 'order' : 'orders'} placed
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-xs text-[var(--color-gold)]">{city.revenue}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 5: MARKETING                                               */}
        {/* ============================================================== */}
        <TabsContent value="marketing">
          <motion.div
            className="grid lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* WhatsApp Performance */}
            <Card variant="elevated" padding="lg">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[var(--font-display)] text-lg flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    WhatsApp Concierge Performance
                  </CardTitle>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5">
                    Real-time metrics from whatsapp_conversations table
                  </p>
                </div>
                <Badge variant="success" className="text-xs">Live</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-stone-50 rounded-xl text-center border border-stone-100">
                    <p className="text-2xl font-bold text-[var(--color-gold)]">
                      {data.marketing.whatsapp.conversations}
                    </p>
                    <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">Conversations</p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-xl text-center border border-stone-100">
                    <p className="text-2xl font-bold text-emerald-600">
                      {data.marketing.whatsapp.responseRate}
                    </p>
                    <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">Delivery Rate</p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-xl text-center border border-stone-100">
                    <p className="text-2xl font-bold text-stone-800">
                      {data.marketing.whatsapp.avgResponseTime}
                    </p>
                    <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">Avg Response Time</p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-xl text-center border border-stone-100">
                    <p className="text-2xl font-bold text-blue-600">
                      {data.marketing.whatsapp.conversionRate}
                    </p>
                    <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">Chat-to-Sale Conversion</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Performance */}
            <Card variant="elevated" padding="lg">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[var(--font-display)] text-lg flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Dispatch Performance
                  </CardTitle>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5">
                    Order notifications &amp; festive lookbook broadcasts
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-stone-50 rounded-xl text-center border border-stone-100">
                    <p className="text-2xl font-bold text-blue-600">
                      {data.marketing.email.subscribers.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">Subscribers</p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-xl text-center border border-stone-100">
                    <p className="text-2xl font-bold text-emerald-600">
                      {data.marketing.email.openRate}
                    </p>
                    <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">Open Rate</p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-xl text-center border border-stone-100">
                    <p className="text-2xl font-bold text-stone-800">
                      {data.marketing.email.clickRate}
                    </p>
                    <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">Click-Through Rate</p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-xl text-center border border-stone-100">
                    <p className="text-2xl font-bold text-stone-500">
                      {data.marketing.email.unsubscribeRate}
                    </p>
                    <p className="text-xs text-[var(--color-slate)] mt-1 font-medium">Unsubscribe Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Coupon Campaigns */}
            <Card variant="elevated" padding="lg" className="lg:col-span-2">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[var(--font-display)] text-lg flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-600" />
                    Promotional Coupon Campaigns (Coupons Table)
                  </CardTitle>
                  <p className="text-xs text-[var(--color-slate)] mt-0.5">
                    Attribution and gross revenue driven by active promo codes
                  </p>
                </div>
                <Badge variant="gold" className="text-xs font-semibold">
                  {data.marketing.campaigns.length} Active Campaigns
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.marketing.campaigns.map((camp) => (
                    <div
                      key={camp.code}
                      className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                            {camp.code}
                          </span>
                          <span className="font-semibold text-xs text-[var(--color-ink)]">{camp.name}</span>
                          <Badge variant={camp.isActive ? 'success' : 'outline'} className="text-[10px]">
                            {camp.isActive ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-[var(--color-slate)]">
                          <span>{camp.redemptions} redemptions</span>
                          <span>•</span>
                          <span>{camp.opens} opens ({camp.sent > 0 ? ((camp.opens / camp.sent) * 100).toFixed(1) : 0}%)</span>
                          <span>•</span>
                          <span>{camp.clicks} clicks ({camp.sent > 0 ? ((camp.clicks / camp.sent) * 100).toFixed(1) : 0}%)</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-[var(--color-slate)]">GMV Driven</p>
                        <p className="font-bold text-xs text-[var(--color-gold)]">{camp.revenue}</p>
                        <p className="text-[10px] text-stone-400">Discount Awarded: {camp.discountAwarded}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

