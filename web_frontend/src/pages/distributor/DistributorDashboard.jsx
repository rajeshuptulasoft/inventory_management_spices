import { useEffect, useState } from 'react';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

export default function DistributorDashboard() {
  const [data, setData] = useState({ stock: [], recentOrders: [], distributor: null });

  useEffect(() => {
    api.get('/fmcg/distributors/1/dashboard').catch(() =>
      api.get('/fmcg/dashboard/admin')
    ).then((r) => {
      if (r.data.data?.distributor) setData(r.data.data);
    });
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <MainLayout title="Distributor Portal">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardStatCard title="Outstanding" value={fmt(data.distributor?.outstanding_balance)} icon="⚠️" color="red" />
        <DashboardStatCard title="Credit Limit" value={fmt(data.distributor?.credit_limit)} icon="💳" color="blue" />
        <DashboardStatCard title="Stock Items" value={data.stock?.length || 0} icon="📦" color="green" />
      </div>
      <DashboardPanel title="Recent Orders">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Order #</TableHeader>
              <TableHeader>Total</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.recentOrders || []).map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.order_number}</TableCell>
                <TableCell>{fmt(o.grand_total)}</TableCell>
                <TableCell className="capitalize">{o.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardPanel>
    </MainLayout>
  );
}
