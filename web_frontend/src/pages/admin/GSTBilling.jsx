import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function GSTBilling() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [items, setItems] = useState([{ variant_id: '', quantity: 1 }]);
  const [customerId, setCustomerId] = useState('');

  const load = async () => {
    const [inv, cust, prod] = await Promise.all([
      api.get('/invoices'),
      api.get('/customers'),
      api.get('/products?limit=100'),
    ]);
    setInvoices(inv.data.data);
    setCustomers(cust.data.data);
    const variants = prod.data.data.flatMap((p) => (p.variants || []).map((v) => ({ ...v, label: `${p.product_name} - ${v.size} (₹${v.selling_price})` })));
    setProducts(variants);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setItems([...items, { variant_id: '', quantity: 1 }]);
  const updateItem = (i, field, val) => {
    const next = [...items];
    next[i][field] = val;
    setItems(next);
  };

  const createInvoice = async () => {
    try {
      await api.post('/invoices', {
        customer_id: customerId ? Number(customerId) : null,
        items: items.filter((i) => i.variant_id).map((i) => ({ variant_id: Number(i.variant_id), quantity: Number(i.quantity) })),
      });
      toast.success('Invoice created');
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const downloadPdf = async (id, num) => {
    try {
      const { data } = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${num}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('PDF download failed');
    }
  };

  return (
    <MainLayout title="GST Billing">
      <Button className="mb-4" onClick={() => setModal(true)}>Create Invoice</Button>
      <div className="card">
        <Table loading={loading} data={invoices} columns={[
          { key: 'invoice_number', label: 'Invoice #' },
          { key: 'customer', label: 'Customer', render: (r) => r.customer?.name || 'Walk-in' },
          { key: 'grand_total', label: 'Total', render: (r) => `₹${r.grand_total}` },
          { key: 'gst_total', label: 'GST', render: (r) => `₹${r.gst_total}` },
          { key: 'payment_status', label: 'Status' },
          { key: 'actions', label: '', render: (r) => (
            <button onClick={() => downloadPdf(r.id, r.invoice_number)} className="text-spice-600 text-sm">PDF</button>
          )},
        ]} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create GST Invoice" size="lg">
        <div className="mb-4">
          <label className="label">Customer</label>
          <select className="input-field" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Walk-in</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name} {c.gstin ? `(${c.gstin})` : ''}</option>)}
          </select>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <select className="input-field flex-1" value={item.variant_id} onChange={(e) => updateItem(i, 'variant_id', e.target.value)}>
              <option value="">Select variant</option>
              {products.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
            <input type="number" className="input-field w-24" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} min="1" />
          </div>
        ))}
        <Button variant="secondary" onClick={addItem} className="mb-4">+ Add Line</Button>
        <Button onClick={createInvoice}>Generate Invoice (GST auto-calculated)</Button>
      </Modal>
    </MainLayout>
  );
}
