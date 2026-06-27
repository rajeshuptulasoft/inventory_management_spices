import { useEffect, useState } from 'react';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';

export default function SalesDashboard() {
  const [data, setData] = useState({ pendingOrders: 0, targets: [], totalCollections: 0 });

  useEffect(() => {
    api.get('/fmcg/dashboard/sales').then((r) => setData(r.data.data || {}));
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <MainLayout title="Sales Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardStatCard title="Pending Orders" value={data.pendingOrders} icon="📋" color="amber" />
        <DashboardStatCard title="Collections" value={fmt(data.totalCollections)} icon="💵" color="green" />
        <DashboardStatCard title="Active Targets" value={data.targets?.length || 0} icon="🎯" color="blue" />
      </div>
      <DashboardPanel title="Monthly Targets">
        <div className="space-y-3">
          {(data.targets || []).map((t) => {
            const pct = t.target_amount ? Math.round((Number(t.achieved_amount) / Number(t.target_amount)) * 100) : 0;
            return (
              <div key={t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-sm mb-1">
                  <span>{new Date(t.target_month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{fmt(t.achieved_amount)} / {fmt(t.target_amount)}</p>
              </div>
            );
          })}
          {!data.targets?.length && <p className="text-slate-500 text-sm">No targets assigned yet.</p>}
        </div>
      </DashboardPanel>
    </MainLayout>
  );
}
