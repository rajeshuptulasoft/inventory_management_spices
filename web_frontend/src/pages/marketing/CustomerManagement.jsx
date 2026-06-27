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

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = () => api.get('/customers').then((r) => { setCustomers(r.data.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({ name: '', email: '', phone: '', gstin: '', address: '', city: '', state: '', status: 'active' });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    Object.keys(row).forEach((k) => setValue(k, row[k] ?? ''));
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editId) {
        await api.put(`/customers/${editId}`, data);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', data);
        toast.success('Customer added');
      }
      setModal(false);
      reset();
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  return (
    <MainLayout title="Customer Management">
      <Button className="mb-4" onClick={openCreate}>+ Add Customer</Button>
      <div className="card">
        <DataTable
          loading={loading}
          data={customers}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'phone', label: 'Phone' },
            { key: 'gstin', label: 'GSTIN' },
            { key: 'city', label: 'City' },
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

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Customer' : 'New Customer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" {...register('name', { required: true })} />
          <Input label="Email" type="email" {...register('email')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="GSTIN" {...register('gstin')} />
          <Input label="Address" {...register('address')} />
          <Input label="City" {...register('city')} />
          <Input label="State" {...register('state')} />
          {editId && (
            <Select label="Status" {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          )}
          <Button type="submit">{editId ? 'Update' : 'Save'}</Button>
        </form>
      </Modal>
    </MainLayout>
  );
}
