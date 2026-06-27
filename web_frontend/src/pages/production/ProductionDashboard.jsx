import { useEffect, useState } from 'react';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import Table from '../../components/ui/Table';

export default function ProductionDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/production').then((r) => { setStats(r.data.data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <MainLayout title="Production">
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Production">
      <div className="dashboard-hero mb-8">
        <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Manufacturing</p>
        <h1 className="text-2xl font-bold text-slate-800">Production overview</h1>
        <p className="text-slate-500 mt-1">Batches, expiry, racks, and raw material levels</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardStatCard title="Batches" value={stats?.batchCount ?? 0} icon="📅" color="sky" />
        <DashboardStatCard title="Expiry alerts" value={stats?.expiryAlerts ?? 0} icon="⏰" color="rose" />
        <DashboardStatCard title="Active runs" value={stats?.activeRuns ?? 0} icon="🏭" color="orange" />
        <DashboardStatCard title="Racks" value={stats?.rackCount ?? 0} icon="🗄️" color="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DashboardPanel title="Recent production runs">
          <Table data={stats?.recentProduction || []} emptyMessage="No production runs yet" columns={[
            { key: 'batch_code', label: 'Batch' },
            { key: 'variant', label: 'Product', render: (r) => `${r.variant?.product?.product_name || ''} — ${r.variant?.size || ''}` },
            { key: 'produced_qty', label: 'Qty' },
            { key: 'status', label: 'Status' },
          ]} />
        </DashboardPanel>
        <DashboardPanel title="Raw material stock" subtitle="Sorted by lowest first">
          <Table data={stats?.rawStock || []} columns={[
            { key: 'name', label: 'Material' },
            { key: 'current_stock', label: 'Available', render: (r) => `${r.current_stock} ${r.unit?.symbol || ''}` },
          ]} />
        </DashboardPanel>
      </div>
    </MainLayout>
  );
}
