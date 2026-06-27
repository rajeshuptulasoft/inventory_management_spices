import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import Table from '../../components/ui/Table';

const chartTooltip = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  color: '#e2e8f0',
};

export default function MarketingDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/marketing').then((r) => { setStats(r.data.data); setLoading(false); });
  }, []);

  const totalRev = (stats?.salesByMonth || []).reduce((s, m) => s + parseFloat(m.total || 0), 0);

  if (loading) {
    return (
      <MainLayout title="Marketing">
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Marketing">
      <div className="dashboard-hero mb-8">
        <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Sales & growth</p>
        <h1 className="text-2xl font-bold text-slate-800">Marketing insights</h1>
        <p className="text-slate-500 mt-1">Top sellers and monthly revenue performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-w-3xl">
        <DashboardStatCard title="Top SKUs tracked" value={stats?.topSelling?.length ?? 0} icon="🏆" color="amber" />
        <DashboardStatCard title="6-month revenue" value={`₹${(totalRev / 1000).toFixed(0)}k`} icon="💹" color="emerald" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DashboardPanel title="Sales trend">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats?.salesByMonth || []}>
              <defs>
                <linearGradient id="mktFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltip} formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Sales']} />
              <Area type="monotone" dataKey="total" stroke="#d97706" strokeWidth={2} fill="url(#mktFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardPanel>

        <DashboardPanel title="Best selling products">
          <Table data={stats?.topSelling || []} columns={[
            { key: 'variant', label: 'Product', render: (r) => `${r.variant?.product?.product_name || ''} — ${r.variant?.size || ''}` },
            { key: 'totalSold', label: 'Units', render: (r) => r.get?.('totalSold') ?? r.dataValues?.totalSold ?? '—' },
            { key: 'revenue', label: 'Revenue', render: (r) => `₹${Number(r.get?.('revenue') || r.dataValues?.revenue || 0).toLocaleString('en-IN')}` },
          ]} />
        </DashboardPanel>
      </div>
    </MainLayout>
  );
}
