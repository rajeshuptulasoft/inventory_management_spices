import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import GlassStatCard from '../../components/dashboard/GlassStatCard';

export default function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const load = () => api.get('/raw-materials').then((r) => { setMaterials(r.data.data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    await api.post('/raw-materials', { ...data, minimum_stock: Number(data.minimum_stock), current_stock: Number(data.current_stock || 0), cost_per_unit: Number(data.cost_per_unit || 0) });
    toast.success('Raw material added');
    setModal(false);
    reset();
    load();
  };

  const onPurchase = async (data) => {
    await api.post('/raw-materials/purchase', { raw_material_id: purchaseModal.id, quantity: Number(data.quantity) });
    toast.success('Stock added');
    setPurchaseModal(null);
    load();
  };

  const lowCount = materials.filter((m) => parseFloat(m.current_stock) <= parseFloat(m.minimum_stock)).length;

  return (
    <MainLayout title="Raw Material Inventory">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <GlassStatCard title="Materials" value={materials.length} icon="🧪" accent="purple" />
        <GlassStatCard title="Low Stock" value={lowCount} icon="⚠️" accent="red" />
      </div>
      <div className="flex justify-between mb-4">
        <Button onClick={() => setModal(true)}>Add Material</Button>
      </div>
      <div className="glass-card rounded-2xl p-4 border border-white/10">
        <Table loading={loading} data={materials} columns={[
          { key: 'name', label: 'Material' },
          { key: 'sku', label: 'SKU' },
          { key: 'category', label: 'Category' },
          { key: 'current_stock', label: 'Stock', render: (r) => (
            <span className={parseFloat(r.current_stock) <= parseFloat(r.minimum_stock) ? 'text-red-400 font-semibold' : ''}>
              {r.current_stock} {r.unit?.symbol}
            </span>
          )},
          { key: 'cost_per_unit', label: 'Cost', render: (r) => `₹${r.cost_per_unit}` },
          { key: 'actions', label: '', render: (r) => (
            <button onClick={() => setPurchaseModal(r)} className="text-orange-400 text-sm">Stock In</button>
          )},
        ]} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Raw Material">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" {...register('name', { required: true })} />
          <Input label="SKU" {...register('sku')} />
          <Input label="Category (raw/packaging)" {...register('category')} />
          <Input label="Min Stock" type="number" step="0.001" {...register('minimum_stock')} />
          <Input label="Initial Stock" type="number" step="0.001" {...register('current_stock')} />
          <Input label="Cost/Unit" type="number" step="0.01" {...register('cost_per_unit')} />
          <Button type="submit">Save</Button>
        </form>
      </Modal>

      <Modal open={!!purchaseModal} onClose={() => setPurchaseModal(null)} title={`Stock In — ${purchaseModal?.name}`}>
        <form onSubmit={handleSubmit(onPurchase)}>
          <Input label="Quantity" type="number" step="0.001" {...register('quantity', { required: true })} />
          <Button type="submit">Add Stock</Button>
        </form>
      </Modal>
    </MainLayout>
  );
}
