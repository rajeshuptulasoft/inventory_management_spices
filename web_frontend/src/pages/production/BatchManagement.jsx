import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DataTable from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/batches?expiring=true'),
      api.get('/products?limit=100'),
    ]).then(([b, p]) => {
      setBatches(b.data.data);
      setVariants(p.data.data.flatMap((pr) => (pr.variants || []).map((v) => ({ ...v, label: `${pr.product_name} - ${v.size}` }))));
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({ variant_id: '', batch_number: '', manufacturing_date: '', expiry_date: '', quantity: '' });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setValue('variant_id', row.variant_id);
    setValue('batch_number', row.batch_number);
    setValue('manufacturing_date', row.manufacturing_date || '');
    setValue('expiry_date', row.expiry_date || '');
    setValue('quantity', row.quantity);
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        variant_id: Number(data.variant_id),
        batch_number: data.batch_number,
        manufacturing_date: data.manufacturing_date || null,
        expiry_date: data.expiry_date || null,
        quantity: Number(data.quantity),
      };
      if (editId) {
        await api.put(`/batches/${editId}`, payload);
        toast.success('Batch updated');
      } else {
        await api.post('/batches', payload);
        toast.success('Batch created');
      }
      setModal(false);
      reset();
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  return (
    <MainLayout title="Batch Management">
      <Button className="mb-4" onClick={openCreate}>+ Add Batch</Button>
      <div className="card">
        <DataTable
          loading={loading}
          data={batches}
          columns={[
            { key: 'batch_number', label: 'Batch #' },
            { key: 'variant', label: 'Product', render: (r) => `${r.variant?.product?.product_name} - ${r.variant?.size}` },
            { key: 'manufacturing_date', label: 'Mfg Date' },
            { key: 'expiry_date', label: 'Expiry' },
            { key: 'quantity', label: 'Qty' },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <button type="button" onClick={() => openEdit(r)} className="text-orange-600 text-sm font-medium">Edit</button>
              ),
            },
          ]}
        />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Batch' : 'New Batch'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Variant</label>
            <select className="input-field" {...register('variant_id', { required: true })} disabled={!!editId}>
              <option value="">Select variant</option>
              {variants.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </div>
          <Input label="Batch Number" {...register('batch_number', { required: true })} />
          <Input label="Mfg Date" type="date" {...register('manufacturing_date')} />
          <Input label="Expiry Date" type="date" {...register('expiry_date')} />
          <Input label="Quantity" type="number" {...register('quantity', { required: true })} />
          <Button type="submit">{editId ? 'Update' : 'Save'}</Button>
        </form>
      </Modal>
    </MainLayout>
  );
}
