import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

export default function RackAllocation() {
  const [racks, setRacks] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selected, setSelected] = useState({ variant_id: '', from_rack_id: '', to_rack_id: '', quantity: '' });

  useEffect(() => {
    Promise.all([api.get('/racks'), api.get('/products?limit=100')]).then(([r, p]) => {
      setRacks(r.data.data);
      setVariants(p.data.data.flatMap((pr) => (pr.variants || []).map((v) => ({ ...v, label: `${pr.product_name} - ${v.size}`, rack_id: v.rack_id }))));
    });
  }, []);

  const transfer = async () => {
    try {
      await api.post('/inventory/transfer', {
        variant_id: Number(selected.variant_id),
        from_rack_id: Number(selected.from_rack_id),
        to_rack_id: Number(selected.to_rack_id),
        quantity: Number(selected.quantity),
      });
      toast.success('Rack transfer completed');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Transfer failed');
    }
  };

  return (
    <MainLayout title="Rack Allocation">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Rack Transfer</h3>
          <select className="input-field mb-3" value={selected.variant_id} onChange={(e) => {
            const v = variants.find((x) => x.id === Number(e.target.value));
            setSelected({ ...selected, variant_id: e.target.value, from_rack_id: v?.rack_id || '' });
          }}>
            <option value="">Variant</option>
            {variants.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
          <select className="input-field mb-3" value={selected.from_rack_id} onChange={(e) => setSelected({ ...selected, from_rack_id: e.target.value })}>
            <option value="">From Rack</option>
            {racks.map((r) => <option key={r.id} value={r.id}>{r.rack_name}</option>)}
          </select>
          <select className="input-field mb-3" value={selected.to_rack_id} onChange={(e) => setSelected({ ...selected, to_rack_id: e.target.value })}>
            <option value="">To Rack</option>
            {racks.map((r) => <option key={r.id} value={r.id}>{r.rack_name}</option>)}
          </select>
          <input className="input-field mb-3" type="number" placeholder="Quantity" value={selected.quantity} onChange={(e) => setSelected({ ...selected, quantity: e.target.value })} />
          <Button onClick={transfer}>Transfer</Button>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">All Racks</h3>
          <Table data={racks} columns={[
            { key: 'rack_name', label: 'Rack' },
            { key: 'warehouse', label: 'Warehouse', render: (r) => r.warehouse?.name },
            { key: 'capacity', label: 'Capacity' },
          ]} />
        </div>
      </div>
    </MainLayout>
  );
}
