import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { OrderStatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const emptyLine = () => ({ variant_id: '', quantity: 1 });

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [variants, setVariants] = useState([]);
  const [modal, setModal] = useState(false);
  const [distributorId, setDistributorId] = useState('');
  const [territoryId, setTerritoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([emptyLine()]);

  const load = async () => {
    const [o, d, p] = await Promise.all([
      api.get('/fmcg/sales-orders?limit=100'),
      api.get('/fmcg/distributors?limit=200'),
      api.get('/products?limit=100'),
    ]);
    setOrders(o.data.data || []);
    setDistributors(d.data.data || []);
    const v = (p.data.data || []).flatMap((prod) =>
      (prod.variants || []).map((variant) => ({
        id: variant.id,
        label: `${prod.product_name} — ${variant.size} (₹${variant.selling_price})`,
      }))
    );
    setVariants(v);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setDistributorId('');
    setTerritoryId('');
    setNotes('');
    setLines([emptyLine()]);
    setModal(true);
  };

  const onDistributorChange = (id) => {
    setDistributorId(id);
    const dist = distributors.find((d) => String(d.id) === String(id));
    if (dist?.territory_id) setTerritoryId(String(dist.territory_id));
  };

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) => setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const createOrder = async (e) => {
    e.preventDefault();
    const items = lines
      .filter((l) => l.variant_id && Number(l.quantity) > 0)
      .map((l) => ({ variant_id: Number(l.variant_id), quantity: Number(l.quantity) }));
    if (!distributorId || !items.length) {
      toast.error('Select distributor and at least one product line');
      return;
    }
    try {
      await api.post('/fmcg/sales-orders', {
        distributorId: Number(distributorId),
        territoryId: territoryId ? Number(territoryId) : null,
        items,
        notes: notes || undefined,
      });
      toast.success('Order created');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  };

  const approve = async (id) => {
    try {
      await api.post(`/fmcg/sales-orders/${id}/approve`);
      toast.success('Order approved');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Approve failed');
    }
  };

  const deliver = async (id) => {
    try {
      await api.post(`/fmcg/sales-orders/${id}/deliver`);
      toast.success('Order delivered');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Deliver failed');
    }
  };

  const cancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await api.post(`/fmcg/sales-orders/${id}/cancel`);
      toast.success('Order cancelled');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <MainLayout title="Sales Orders">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>+ Create Order</Button>
      </div>

      <DashboardPanel title="Order Pipeline">
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Order #</TableHeader>
              <TableHeader>Distributor</TableHeader>
              <TableHeader>Total</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.order_number}</TableCell>
                <TableCell>{o.distributor?.name}</TableCell>
                <TableCell>{fmt(o.grand_total)}</TableCell>
                <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {o.status === 'pending' && (
                      <>
                        <Button variant="secondary" className="!py-1 !px-2 !text-xs" onClick={() => approve(o.id)}>Approve</Button>
                        <Button variant="danger" className="!py-1 !px-2 !text-xs" onClick={() => cancel(o.id)}>Cancel</Button>
                      </>
                    )}
                    {['approved', 'partial'].includes(o.status) && (
                      <Button variant="secondary" className="!py-1 !px-2 !text-xs" onClick={() => deliver(o.id)}>Deliver</Button>
                    )}
                    {o.status === 'approved' && (
                      <Button variant="danger" className="!py-1 !px-2 !text-xs" onClick={() => cancel(o.id)}>Cancel</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardPanel>

      <Modal open={modal} onClose={() => setModal(false)} title="Create Sales Order" size="lg">
        <form onSubmit={createOrder} className="space-y-4">
          <div>
            <label className="label">Distributor</label>
            <select className="input-field w-full" value={distributorId} onChange={(e) => onDistributorChange(e.target.value)} required>
              <option value="">Select distributor</option>
              {distributors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="label mb-0">Order lines</span>
              <Button type="button" variant="secondary" className="!py-1 !px-2 !text-xs" onClick={addLine}>+ Line</Button>
            </div>
            {lines.map((line, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <select
                    className="input-field w-full"
                    value={line.variant_id}
                    onChange={(e) => updateLine(idx, 'variant_id', e.target.value)}
                    required
                  >
                    <option value="">Product variant</option>
                    {variants.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                  </select>
                </div>
                <input
                  type="number"
                  min="1"
                  className="input-field w-24"
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                />
                <Button type="button" variant="danger" className="!py-2 !px-2" onClick={() => removeLine(idx)}>×</Button>
              </div>
            ))}
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input-field w-full" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button type="submit">Create Order</Button>
        </form>
      </Modal>
    </MainLayout>
  );
}
