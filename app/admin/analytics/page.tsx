'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

const analyticsData = {
  overview: {
    revenue: { value: '₹12.4L', change: '+18.2%', trend: 'up' },
    orders: { value: '342', change: '+12%', trend: 'up' },
    aov: { value: '₹3,624', change: '+5.1%', trend: 'up' },
    conversion: { value: '3.24%', change: '+0.3%', trend: 'up' },
    newCustomers: { value: '89', change: '+23%', trend: 'up' },
    returningRate: { value: '34%', change: '+2%', trend: 'up' },
  },
  traffic: {
    total: 45230,
    sources: [
      { source: 'Direct', visits: 18230, percentage: 40.3, trend: 'up' },
      { source: 'Organic Search', visits: 12450, percentage: 27.5, trend: 'up' },
      { source: 'WhatsApp', visits: 6890, percentage: 15.2, trend: 'up' },
      { source: 'Social Media', visits: 4120, percentage: 9.1, trend: 'down' },
      { source: 'Referral', visits: 2340, percentage: 5.2, trend: 'up' },
      { source: 'Email', visits: 1200, percentage: 2.7, trend: 'down' },
    ],
  },
  products: {
    topSelling: [
      { name: 'Banarasi Silk Saree', sold: 45, revenue: 404955, views: 2340, conversion: 1.92 },
      { name: 'Chiffon Lehenga Set', sold: 38, revenue: 493962, views: 1890, conversion: 2.01 },
      { name: 'Cotton Block Print Kurti', sold: 67, revenue: 153833, views: 4560, conversion: 1.47 },
      { name: 'Mirror Work Dupatta', sold: 52, revenue: 181948, views: 2100, conversion: 2.48 },
      { name: 'Velvet Anarkali Gown', sold: 29, revenue: 231971, views: 1230, conversion: 2.36 },
    ],
    lowConverting: [
      { name: 'Organza Saree with Sequins', views: 890, sold: 3, conversion: 0.34 },
      { name: 'Heavy Embroidered Dupatta', views: 1450, sold: 8, conversion: 0.55 },
      { name: 'Designer Anarkali Gown', views: 1230, sold: 7, conversion: 0.57 },
    ],
  },
  customers: {
    total: 12450,
    new: 890,
    returning: 4230,
    segments: [
      { segment: 'VIP (₹50k+)', count: 120, revenue: '₹12.4L', avgOrders: 12 },
      { segment: 'Loyal (₹10k-50k)', count: 890, revenue: '₹34.2L', avgOrders: 5 },
      { segment: 'Regular (₹1k-10k)', count: 3450, revenue: '₹67.8L', avgOrders: 2 },
      { segment: 'New (< ₹1k)', count: 8000, revenue: '₹18.9L', avgOrders: 1 },
    ],
    geography: [
      { city: 'Bangalore', customers: 2340, revenue: '₹45.2L' },
      { city: 'Mumbai', customers: 1890, revenue: '₹38.7L' },
      { city: 'Delhi', customers: 1560, revenue: '₹32.1L' },
      { city: 'Hyderabad', customers: 980, revenue: '₹18.4L' },
      { city: 'Chennai', customers: 760, revenue: '₹14.2L' },
    ],
  },
  marketing: {
    whatsapp: {
      conversations: 2340,
      responseRate: '94%',
      avgResponseTime: '4 min',
      conversionRate: '12.3%',
    },
    email: {
      subscribers: 15230,
      openRate: '28.4%',
      clickRate: '3.2%',
      unsubscribeRate: '0.15%',
    },
    campaigns: [
      { name: 'New Year Sale', sent: 12450, opens: 3540, clicks: 420, revenue: '₹8.4L' },
      { name: 'Vidhya\'s January Edit', sent: 15230, opens: 4320, clicks: 580, revenue: '₹12.1L' },
      { name: 'Festival Archive Launch', sent: 12450, opens: 2890, clicks: 310, revenue: '₹5.6L' },
    ],
  },
};

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">Analytics</h1>
          <p className="text-[var(--color-slate)] mt-1">Insights into your store performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange} className="w-[160px]">
            <SelectTrigger><SelectValue placeholder="Date Range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="flex gap-2 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {Object.entries(analyticsData.overview).map(([key, stat], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="elevated" padding="lg">
                  <p className="text-sm text-[var(--color-slate)] mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-3xl font-bold text-[var(--color-ink)] tabular-nums">{stat.value}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <span className={cn('text-sm font-semibold', stat.trend === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]')}>
                      {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                    </span>
                    <span className="text-xs text-[var(--color-mist)]">vs prev period</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Row */}
          <motion.div
            className="grid lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Revenue Chart */}
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-[var(--color-snow)] rounded-[var(--radius-xl)] relative overflow-hidden">
                  <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M20,170 L50,140 L80,155 L110,120 L140,100 L170,110 L200,85 L230,70 L260,80 L290,60 L320,55 L350,50 L380,45" stroke="var(--color-gold)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20,170 L50,140 L80,155 L110,120 L140,100 L170,110 L200,85 L230,70 L260,80 L290,60 L320,55 L350,50 L380,45 L380,180 L20,180 Z" fill="url(#revGrad)" />
                  </svg>
                </div>
              </CardContent>            </Card>

            {/* Orders Chart */}
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Orders by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-[var(--color-snow)] rounded-[var(--radius-xl)] relative overflow-hidden">
                  <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M20,160 L40,130 L60,145 L80,110 L100,125 L120,95 L140,105 L160,80 L180,90 L200,70 L220,85 L240,60 L260,65 L280,50 L300,55 L320,45 L340,50 L360,40 L380,38" stroke="var(--color-info)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20,160 L40,130 L60,145 L80,110 L100,125 L120,95 L140,105 L160,80 L180,90 L200,70 L220,85 L240,60 L260,65 L280,50 L300,55 L320,45 L340,50 L360,40 L380,38 L380,180 L20,180 Z" fill="url(#ordGrad)" />
                  </svg>
                </div>
              </CardContent>            </Card>
          </motion.div>

          {/* Conversion Funnel */}
          <motion.div
            className="grid lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stage: 'Sessions', value: 45230, percentage: 100 },
                    { stage: 'Product Views', value: 18450, percentage: 40.8 },
                    { stage: 'Add to Cart', value: 3240, percentage: 7.2 },
                    { stage: 'Checkout Started', value: 1890, percentage: 4.2 },
                    { stage: 'Purchases', value: 342, percentage: 0.76 },
                  ].map((funnel, i) => (
                    <div key={funnel.stage} className="flex items-center gap-4">
                      <div className="w-36 text-sm font-medium text-[var(--color-slate)]">{funnel.stage}</div>
                      <div className="flex-1 h-8 bg-[var(--color-whisper)] rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${funnel.percentage}%`, backgroundColor: 'var(--color-gold)' }}
                        />
                      </div>
                      <div className="w-24 text-right font-mono font-bold text-[var(--color-ink)]">{funnel.value.toLocaleString()}</div>
                      <div className="w-16 text-right text-sm text-[var(--color-slate)]">{funnel.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>            </Card>

            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { device: 'Mobile', percentage: 68.2, color: 'var(--color-gold)' },
                    { device: 'Desktop', percentage: 26.8, color: 'var(--color-info)' },
                    { device: 'Tablet', percentage: 5.0, color: 'var(--color-success)' },
                  ].map((item) => (
                    <div key={item.device} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium text-[var(--color-slate)]">{item.device}</div>
                      <div className="flex-1 h-3 bg-[var(--color-whisper)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                      </div>
                      <div className="w-16 text-right font-bold text-[var(--color-ink)]">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>            </Card>
          </motion.div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.traffic.sources.map((source) => (
                    <motion.div key={source.source} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-32 font-medium text-[var(--color-ink)]">{source.source}</div>
                          <Badge variant={source.trend === 'up' ? 'success' : 'error'} className="text-xs">{source.trend === 'up' ? '↑' : '↓'} {source.percentage}%</Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[var(--color-ink)]">{source.visits.toLocaleString()}</p>
                          <p className="text-sm text-[var(--color-slate)]">visits</p>
                        </div>
                      </div>
                      <div className="h-2 bg-[var(--color-whisper)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${source.percentage}%`, backgroundColor: 'var(--color-gold)' }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>            </Card>
          </motion.div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <motion.div
            className="grid lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.products.topSelling.map((product, i) => (
                    <motion.div key={product.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-3 bg-[var(--color-snow)] rounded-[var(--radius-lg)]">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] font-bold">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--color-ink)] truncate">{product.name}</p>
                        <p className="text-xs text-[var(--color-slate)]">{product.views.toLocaleString()} views • {product.conversion}% conversion</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[var(--color-ink)]">{product.sold} sold</p>
                        <p className="text-sm text-[var(--color-gold)]">₹{product.revenue.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>            </Card>

            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Needs Attention (Low Conversion)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.products.lowConverting.map((product, i) => (
                    <motion.div key={product.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-3 bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 rounded-[var(--radius-lg)]">
                      <p className="font-medium text-[var(--color-ink)]">{product.name}</p>
                      <div className="flex gap-6 mt-2 text-sm">
                        <span className="text-[var(--color-slate)]">{product.views.toLocaleString()} views</span>
                        <span className="text-[var(--color-error)] font-semibold">{product.conversion}% conversion</span>
                        <span className="text-[var(--color-slate)]">{product.sold} sold</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>            </Card>
          </motion.div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <motion.div
            className="grid lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.customers.segments.map((segment) => (
                    <motion.div key={segment.segment} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-[var(--color-ink)]">{segment.segment}</h4>
                        <Badge variant="gold">{segment.count} customers</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><span className="text-[var(--color-slate)]">Revenue</span><p className="font-bold text-[var(--color-gold)]">{segment.revenue}</p></div>
                        <div><span className="text-[var(--color-slate)]">Avg Orders</span><p className="font-bold text-[var(--color-ink)]">{segment.avgOrders}</p></div>
                        <div><span className="text-[var(--color-slate)]">Avg AOV</span><p className="font-bold text-[var(--color-ink)]">₹{(parseInt(segment.revenue.replace(/[₹,L]/g, '')) * 100000 / segment.count / segment.avgOrders).toLocaleString()}</p></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>            </Card>

            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Top Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.customers.geography.map((city, i) => (
                    <motion.div key={city.city} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 bg-[var(--color-snow)] rounded-[var(--radius-lg)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center text-[var(--color-gold)] font-bold text-sm">{i + 1}</div>
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{city.city}</p>
                          <p className="text-xs text-[var(--color-slate)]">{city.customers.toLocaleString()} customers</p>
                        </div>
                      </div>
                      <p className="font-bold text-[var(--color-gold)]">{city.revenue}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>            </Card>
          </motion.div>
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing">
          <motion.div
            className="grid lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">WhatsApp Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Conversations', value: analyticsData.marketing.whatsapp.conversations },
                    { label: 'Response Rate', value: analyticsData.marketing.whatsapp.responseRate },
                    { label: 'Avg Response Time', value: analyticsData.marketing.whatsapp.avgResponseTime },
                    { label: 'Conversion Rate', value: analyticsData.marketing.whatsapp.conversionRate },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)] text-center">
                      <p className="text-3xl font-bold text-[var(--color-gold)]">{metric.value}</p>
                      <p className="text-sm text-[var(--color-slate)]">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>            </Card>

            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Email Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Subscribers', value: analyticsData.marketing.email.subscribers.toLocaleString() },
                    { label: 'Open Rate', value: analyticsData.marketing.email.openRate },
                    { label: 'Click Rate', value: analyticsData.marketing.email.clickRate },
                    { label: 'Unsubscribe', value: analyticsData.marketing.email.unsubscribeRate },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)] text-center">
                      <p className="text-3xl font-bold text-[var(--color-info)]">{metric.value}</p>
                      <p className="text-sm text-[var(--color-slate)]">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>            </Card>

            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle className="text-[var(--font-display)] text-lg">Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.marketing.campaigns.map((campaign, i) => (
                    <motion.div key={campaign.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-[var(--color-ink)]">{campaign.name}</h4>
                        <Badge variant="gold">{campaign.revenue}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><span className="text-[var(--color-slate)]">Sent</span><p className="font-bold">{campaign.sent.toLocaleString()}</p></div>
                        <div><span className="text-[var(--color-slate)]">Opens</span><p className="font-bold">{campaign.opens.toLocaleString()} ({(campaign.opens/campaign.sent*100).toFixed(1)}%)</p></div>
                        <div><span className="text-[var(--color-slate)]">Clicks</span><p className="font-bold">{campaign.clicks.toLocaleString()} ({(campaign.clicks/campaign.sent*100).toFixed(1)}%)</p></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}