import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, LineChart, Line,
} from 'recharts';
import {
  TrendingUp, Package, Users, IndianRupee, AlertTriangle, ShoppingCart,
  Building2, Store, Truck,
} from 'lucide-react';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import GlassStatCard from '../../components/dashboard/GlassStatCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import StatusBadge, { OrderStatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

const CHART_COLORS = ['#ea580c', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899'];
const tooltipStyle = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: '12px',
  color: '#e2e8f0',
};

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const { data: enterprise, isLoading: entLoading } = useQuery({
    queryKey: ['dashboard-enterprise'],
    queryFn: () => api.get('/fmcg/dashboard/enterprise').then((r) => r.data.data),
  });
  const { data: legacy, isLoading: legLoading } = useQuery({
    queryKey: ['dashboard-admin'],
    queryFn: () => api.get('/dashboard/admin').then((r) => r.data.data),
  });

  const loading = entLoading || legLoading;
  const kpi = enterprise?.kpis || {};
  const pipeline = enterprise?.orderPipeline || [];

  if (loading) {
    return (
      <MainLayout title="Enterprise Dashboard">
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  const piePipeline = pipeline.map((p) => ({ name: p.status, value: parseInt(p.count, 10) }));

  return (
    <MainLayout title="Enterprise Dashboard">
      <motion.div {...fadeUp} className="dashboard-hero mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-500 dark:text-orange-400 mb-1">FMCG Spice ERP · Enterprise</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Command Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manufacturing · Distribution · Sales · Finance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(enterprise?.alerts || []).slice(0, 3).map((a, i) => (
            <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
              {a.message}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <GlassStatCard title="Revenue" value={fmt(kpi.revenue)} icon="💰" accent="orange" />
        <GlassStatCard title="Collections (MTD)" value={fmt(kpi.monthCollections)} icon="📥" accent="green" />
        <GlassStatCard title="Outstanding" value={fmt(kpi.totalOutstanding)} icon="⚠️" accent="red" />
        <GlassStatCard title="Pending Orders" value={kpi.pendingOrders ?? 0} icon="📋" accent="blue" />
        <GlassStatCard title="Distributors" value={kpi.distributorCount ?? 0} icon="🏪" accent="purple" />
        <GlassStatCard title="Wholesalers" value={kpi.wholesalerCount ?? 0} icon="🏬" accent="orange" />
      </motion.div>

      <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
          <Store className="w-8 h-8 text-violet-500" />
          <div><p className="text-xs text-slate-500">Dealers</p><p className="text-xl font-bold text-slate-800 dark:text-white">{kpi.dealerCount ?? 0}</p></div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
          <Package className="w-8 h-8 text-emerald-500" />
          <div><p className="text-xs text-slate-500">Products</p><p className="text-xl font-bold">{legacy?.totalProducts ?? 0}</p></div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <div><p className="text-xs text-slate-500">Low Stock</p><p className="text-xl font-bold">{kpi.lowStockAlerts ?? 0}</p></div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-orange-500" />
          <div><p className="text-xs text-slate-500">Delivered</p><p className="text-xl font-bold">{kpi.deliveredOrders ?? 0}</p></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <DashboardPanel title="Sales trend" subtitle="Last 6 months" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={enterprise?.monthlySales || legacy?.monthlySales || []}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(v), 'Sales']} />
              <Area type="monotone" dataKey="total" stroke="#ea580c" strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardPanel>

        <DashboardPanel title="Order pipeline">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={piePipeline.length ? piePipeline : [{ name: 'none', value: 1 }]} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {(piePipeline.length ? piePipeline : [{ name: 'x', value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {piePipeline.map((p) => (
              <OrderStatusBadge key={p.name} status={p.name} />
            ))}
          </div>
        </DashboardPanel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <DashboardPanel title="Collections" subtitle="Monthly">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={enterprise?.monthlyCollections || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(v), 'Collected']} />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </DashboardPanel>

        <DashboardPanel title="Channel outstanding" className="xl:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Distributors', value: enterprise?.channelOutstanding?.distributor, icon: Truck, color: 'text-orange-500' },
              { label: 'Wholesalers', value: enterprise?.channelOutstanding?.wholesaler, icon: Building2, color: 'text-blue-500' },
              { label: 'Dealers', value: enterprise?.channelOutstanding?.dealer, icon: Store, color: 'text-violet-500' },
            ].map((ch) => (
              <div key={ch.label} className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200/80 dark:border-slate-700/80">
                <ch.icon className={`w-6 h-6 mb-2 ${ch.color}`} />
                <p className="text-xs text-slate-500 uppercase tracking-wide">{ch.label}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{fmt(ch.value)}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel title="Recent orders">
          <Table>
            <TableHead>
              <TableRow className="hover:bg-transparent">
                <TableHeader>Order</TableHeader>
                <TableHeader>Party</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {(enterprise?.recentOrders || []).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.order_number}</TableCell>
                  <TableCell>{o.distributor?.name || '—'}</TableCell>
                  <TableCell>{fmt(o.grand_total)}</TableCell>
                  <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardPanel>

        <DashboardPanel title="Top outstanding · Distributors">
          <ul className="space-y-3">
            {(enterprise?.topDistributors || []).map((d, i) => (
              <li key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-600 text-xs flex items-center justify-center">{i + 1}</span>
                  {d.name}
                </span>
                <StatusBadge status="due" label={fmt(d.outstanding_balance)} />
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </div>
    </MainLayout>
  );
}
