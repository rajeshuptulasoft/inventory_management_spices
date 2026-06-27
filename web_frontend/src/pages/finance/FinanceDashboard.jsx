import { useEffect, useState } from 'react';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

export default function FinanceDashboard() {
  const [data, setData] = useState({ topOutstanding: [], totalReceivables: 0, recentCollections: [] });

  useEffect(() => {
    api.get('/fmcg/dashboard/accounts').then((r) => setData(r.data.data || {}));
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <MainLayout title="Accounts Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardStatCard title="Total Receivables" value={fmt(data.totalReceivables)} icon="📥" color="red" />
        <DashboardStatCard title="Overdue Accounts" value={data.topOutstanding?.length || 0} icon="⚠️" color="amber" />
        <DashboardStatCard title="Recent Collections" value={data.recentCollections?.length || 0} icon="💵" color="green" />
      </div>
      <DashboardPanel title="Top Outstanding Distributors">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Distributor</TableHeader>
              <TableHeader>Outstanding</TableHeader>
              <TableHeader>Credit Limit</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.topOutstanding || []).map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell className="text-red-500">{fmt(d.outstanding_balance)}</TableCell>
                <TableCell>{fmt(d.credit_limit)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardPanel>
    </MainLayout>
  );
}
