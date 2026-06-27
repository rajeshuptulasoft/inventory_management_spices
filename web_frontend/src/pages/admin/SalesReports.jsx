import { useEffect, useState } from 'react';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Table from '../../components/ui/Table';

export default function SalesReports() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices?limit=50').then((r) => { setInvoices(r.data.data); setLoading(false); });
  }, []);

  const total = invoices.reduce((s, i) => s + parseFloat(i.grand_total), 0);

  return (
    <MainLayout title="Sales Reports">
      <div className="flex gap-2 mb-4">
        <a href="/api/export/invoices" className="btn-secondary text-sm inline-block" onClick={(e) => { e.preventDefault(); api.get('/export/invoices', { responseType: 'blob' }).then((r) => { const u = URL.createObjectURL(r.data); const a = document.createElement('a'); a.href = u; a.download = 'invoices.xlsx'; a.click(); }); }}>Export Excel</a>
      </div>
      <div className="glass-card rounded-2xl p-6 border border-white/10 mb-6">
        <p className="text-sm text-gray-500">Total Revenue (shown invoices)</p>
        <p className="text-3xl font-bold text-spice-600">₹{total.toLocaleString('en-IN')}</p>
      </div>
      <div className="glass-card rounded-2xl p-4 border border-white/10">
        <Table loading={loading} data={invoices} columns={[
          { key: 'invoice_number', label: 'Invoice' },
          { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
          { key: 'customer', label: 'Customer', render: (r) => r.customer?.name },
          { key: 'subtotal', label: 'Subtotal', render: (r) => `₹${r.subtotal}` },
          { key: 'gst_total', label: 'GST' },
          { key: 'grand_total', label: 'Total', render: (r) => `₹${r.grand_total}` },
          { key: 'payment_status', label: 'Status' },
        ]} />
      </div>
    </MainLayout>
  );
}
