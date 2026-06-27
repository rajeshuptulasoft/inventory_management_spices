import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DataTable from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

export default function OfferManagement() {
  const [offers, setOffers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = () => api.get('/customers/offers/list').then((r) => setOffers(r.data.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({ name: '', discount_percent: '', start_date: '', end_date: '', status: 'active' });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setValue('name', row.name);
    setValue('discount_percent', row.discount_percent);
    setValue('start_date', row.start_date || '');
    setValue('end_date', row.end_date || '');
    setValue('status', row.status || 'active');
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, discount_percent: Number(data.discount_percent) };
      if (editId) {
        await api.put(`/customers/offers/${editId}`, payload);
        toast.success('Offer updated');
      } else {
        await api.post('/customers/offers', payload);
        toast.success('Offer created');
      }
      setModal(false);
      reset();
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  return (
    <MainLayout title="Offers & Discounts">
      <Button className="mb-4" onClick={openCreate}>+ Add Offer</Button>
      <div className="card">
        <DataTable
          data={offers}
          columns={[
            { key: 'name', label: 'Offer' },
            { key: 'discount_percent', label: 'Discount %' },
            { key: 'start_date', label: 'Start' },
            { key: 'end_date', label: 'End' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
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

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Offer' : 'New Offer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Offer Name" {...register('name', { required: true })} />
          <Input label="Discount %" type="number" {...register('discount_percent', { required: true })} />
          <Input label="Start Date" type="date" {...register('start_date')} />
          <Input label="End Date" type="date" {...register('end_date')} />
          <Select label="Status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Button type="submit">{editId ? 'Update' : 'Save'}</Button>
        </form>
      </Modal>
    </MainLayout>
  );
}
