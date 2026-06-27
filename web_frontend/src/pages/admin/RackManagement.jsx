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

export default function RackManagement() {
  const [racks, setRacks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = async () => {
    setLoading(true);
    const [r, w] = await Promise.all([api.get('/racks'), api.get('/racks/warehouses/list')]);
    setRacks(r.data.data);
    setWarehouses(w.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({ rack_name: '', warehouse_id: '', capacity: '', status: 'active' });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setValue('rack_name', row.rack_name);
    setValue('warehouse_id', row.warehouse_id);
    setValue('capacity', row.capacity);
    setValue('status', row.status || 'active');
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        rack_name: data.rack_name,
        warehouse_id: Number(data.warehouse_id),
        capacity: Number(data.capacity),
        status: data.status,
      };
      if (editId) {
        await api.put(`/racks/${editId}`, payload);
        toast.success('Rack updated');
      } else {
        await api.post('/racks', payload);
        toast.success('Rack created');
      }
      setModal(false);
      reset();
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  return (
    <MainLayout title="Rack Management">
      <Button className="mb-4" onClick={openCreate}>+ Add Rack</Button>
      <div className="card">
        <DataTable
          loading={loading}
          data={racks}
          columns={[
            { key: 'rack_name', label: 'Rack' },
            { key: 'warehouse', label: 'Warehouse', render: (r) => r.warehouse?.name },
            { key: 'capacity', label: 'Capacity' },
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

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Rack' : 'New Rack'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Rack Name" {...register('rack_name', { required: true })} />
          <Select label="Warehouse" {...register('warehouse_id', { required: true })}>
            <option value="">Select warehouse</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </Select>
          <Input label="Capacity" type="number" {...register('capacity', { required: true })} />
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
