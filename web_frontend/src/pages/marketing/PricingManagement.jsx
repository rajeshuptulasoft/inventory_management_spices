import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Table from '../../components/ui/Table';

export default function PricingManagement() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);

  const load = () => api.get('/products?limit=100').then((r) => {
    setVariants(r.data.data.flatMap((p) => (p.variants || []).map((v) => ({ ...v, product_name: p.product_name }))));
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.put(`/variants/${edit.id}`, { selling_price: edit.selling_price, mrp: edit.mrp, gst_percent: edit.gst_percent });
    toast.success('Pricing updated');
    setEdit(null);
    load();
  };

  return (
    <MainLayout title="Pricing Management">
      <div className="card">
        <Table loading={loading} data={variants} columns={[
          { key: 'product_name', label: 'Product' },
          { key: 'size', label: 'Variant' },
          { key: 'mrp', label: 'MRP', render: (r) => `₹${r.mrp}` },
          { key: 'selling_price', label: 'Selling', render: (r) => `₹${r.selling_price}` },
          { key: 'gst_percent', label: 'GST %' },
          { key: 'actions', label: '', render: (r) => (
            <button onClick={() => setEdit({ ...r })} className="text-spice-600 text-sm">Edit</button>
          )},
        ]} />
      </div>
      {edit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setEdit(null)}>
          <div className="modal-panel max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-white mb-4">Update Pricing — {edit.product_name} {edit.size}</h3>
            <label className="label">MRP</label>
            <input className="input-field mb-3" type="number" value={edit.mrp} onChange={(e) => setEdit({ ...edit, mrp: e.target.value })} />
            <label className="label">Selling Price</label>
            <input className="input-field mb-3" type="number" value={edit.selling_price} onChange={(e) => setEdit({ ...edit, selling_price: e.target.value })} />
            <label className="label">GST %</label>
            <input className="input-field mb-3" type="number" value={edit.gst_percent} onChange={(e) => setEdit({ ...edit, gst_percent: e.target.value })} />
            <div className="flex gap-2">
              <button className="btn-primary" onClick={save}>Save</button>
              <button className="btn-secondary" onClick={() => setEdit(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
