import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';

export default function SalesAnalytics() {
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/marketing'),
      api.get('/invoices?limit=20'),
    ]).then(([m, i]) => {
      setStats(m.data.data);
      setInvoices(i.data.data);
    });
  }, []);

  return (
    <MainLayout title="Sales Analytics">
      <div className="card mb-6">
        <h3 className="font-semibold mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats?.salesByMonth || []}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => `₹${v}`} />
            <Line type="monotone" dataKey="total" stroke="#ea580c" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-4">Recent Invoices</h3>
        <ul className="divide-y dark:divide-gray-700">
          {invoices.map((inv) => (
            <li key={inv.id} className="py-3 flex justify-between">
              <span>{inv.invoice_number} — {inv.customer?.name || 'Walk-in'}</span>
              <span className="font-medium">₹{inv.grand_total}</span>
            </li>
          ))}
        </ul>
      </div>
    </MainLayout>
  );
}
