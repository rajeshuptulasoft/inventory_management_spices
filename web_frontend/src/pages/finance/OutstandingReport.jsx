import { useEffect, useState } from 'react';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

export default function OutstandingReport() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/fmcg/outstanding').then((r) => setRows(r.data.data || []));
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <MainLayout title="Outstanding Report">
      <DashboardPanel title="Distributor Outstanding">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Distributor</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Credit Limit</TableHeader>
              <TableHeader>Outstanding</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.phone}</TableCell>
                <TableCell>{fmt(d.credit_limit)}</TableCell>
                <TableCell className="text-red-500 font-medium">{fmt(d.outstanding_balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardPanel>
    </MainLayout>
  );
}
