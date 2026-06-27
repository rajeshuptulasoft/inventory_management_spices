import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ProductionRuns() {
  const [runs, setRuns] = useState([]);
  const [variants, setVariants] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [modal, setModal] = useState(false);
  const [matRows, setMatRows] = useState([{ raw_material_id: '', quantity_used: '' }]);
  const { register, handleSubmit, reset } = useForm();

  const load = () => {
    api.get('/production').then((r) => setRuns(r.data.data));
    api.get('/products?limit=100').then((r) => {
      setVariants(r.data.data.flatMap((p) => (p.variants || []).map((v) => ({ ...v, label: `${p.product_name} - ${v.size}` }))));
    });
    api.get('/raw-materials').then((r) => setMaterials(r.data.data));
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/production', {
        variant_id: Number(data.variant_id),
        planned_qty: Number(data.planned_qty),
        produced_qty: Number(data.produced_qty || data.planned_qty),
        wastage_qty: Number(data.wastage_qty || 0),
        operator_name: data.operator_name,
        machine_id: data.machine_id,
        expiry_date: data.expiry_date,
        materials: matRows.filter((m) => m.raw_material_id).map((m) => ({
          raw_material_id: Number(m.raw_material_id),
          quantity_used: Number(m.quantity_used),
        })),
      });
      toast.success('Production completed — finished goods added to stock');
      setModal(false);
      reset();
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Production failed');
    }
  };

  return (
    <MainLayout title="Production Management">
      <p className="text-gray-400 text-sm mb-4">Convert raw materials → finished variant stock (e.g. 10kg turmeric → 100×100gm packets)</p>
      <Button className="mb-4" onClick={() => setModal(true)}>New Production Run</Button>
      <div className="glass-card rounded-2xl p-4 border border-white/10">
        <Table data={runs} columns={[
          { key: 'batch_code', label: 'Batch' },
          { key: 'variant', label: 'Product', render: (r) => `${r.variant?.product?.product_name} - ${r.variant?.size}` },
          { key: 'produced_qty', label: 'Produced' },
          { key: 'wastage_qty', label: 'Wastage' },
          { key: 'operator_name', label: 'Operator' },
          { key: 'status', label: 'Status' },
        ]} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Production Entry" size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="label">Finished Variant</label>
            <select className="input-field" {...register('variant_id', { required: true })}>
              <option value="">Select</option>
              {variants.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Planned Qty" type="number" {...register('planned_qty', { required: true })} />
            <Input label="Produced Qty" type="number" {...register('produced_qty')} />
            <Input label="Wastage" type="number" {...register('wastage_qty')} />
            <Input label="Expiry Date" type="date" {...register('expiry_date')} />
            <Input label="Operator" {...register('operator_name')} />
            <Input label="Machine ID" {...register('machine_id')} />
          </div>
          <h4 className="font-medium mt-4 mb-2 text-white">Raw Material Consumption</h4>
          {matRows.map((row, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <select className="input-field flex-1" value={row.raw_material_id} onChange={(e) => {
                const n = [...matRows]; n[i].raw_material_id = e.target.value; setMatRows(n);
              }}>
                <option value="">Material</option>
                {materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.current_stock} {m.unit?.symbol})</option>)}
              </select>
              <input className="input-field w-28" type="number" step="0.001" placeholder="Qty" value={row.quantity_used} onChange={(e) => {
                const n = [...matRows]; n[i].quantity_used = e.target.value; setMatRows(n);
              }} />
            </div>
          ))}
          <Button type="button" variant="secondary" className="mb-4" onClick={() => setMatRows([...matRows, { raw_material_id: '', quantity_used: '' }])}>+ Material</Button>
          <Button type="submit">Run Production</Button>
        </form>
      </Modal>
    </MainLayout>
  );
}
