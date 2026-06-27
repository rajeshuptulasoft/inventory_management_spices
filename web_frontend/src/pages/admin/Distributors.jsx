import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Distributors() {
  const [rows, setRows] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = async () => {
    const [d, t] = await Promise.all([
      api.get('/fmcg/distributors?limit=200'),
      api.get('/fmcg/territories'),
    ]);
    setRows(d.data.data || []);
    setTerritories(t.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({
      name: '', phone: '', email: '', gstin: '', pan: '', address: '', contact_person: '',
      territory_id: '', credit_limit: 0, opening_balance: 0, security_deposit: 0, status: 'active',
    });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setValue('name', row.name);
    setValue('phone', row.phone || '');
    setValue('email', row.email || '');
    setValue('gstin', row.gstin || '');
    setValue('pan', row.pan || '');
    setValue('address', row.address || '');
    setValue('contact_person', row.contact_person || '');
    setValue('territory_id', row.territory_id || '');
    setValue('credit_limit', row.credit_limit || 0);
    setValue('opening_balance', row.opening_balance || 0);
    setValue('security_deposit', row.security_deposit || 0);
    setValue('status', row.status || 'active');
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        territory_id: data.territory_id ? Number(data.territory_id) : null,
        credit_limit: Number(data.credit_limit) || 0,
        opening_balance: Number(data.opening_balance) || 0,
        security_deposit: Number(data.security_deposit) || 0,
      };
      if (editId) {
        await api.put(`/fmcg/distributors/${editId}`, payload);
        toast.success('Distributor updated');
      } else {
        await api.post('/fmcg/distributors', payload);
        toast.success('Distributor created');
      }
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this distributor?')) return;
    try {
      await api.delete(`/fmcg/distributors/${id}`);
      toast.success('Distributor deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <MainLayout title="Distributor Management">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <DashboardStatCard title="Distributors" value={rows.length} icon="🏪" color="orange" />
          <DashboardStatCard title="Total Outstanding" value={fmt(rows.reduce((s, d) => s + Number(d.outstanding_balance || 0), 0))} icon="⚠️" color="red" />
          <DashboardStatCard title="Active" value={rows.filter((d) => d.status === 'active').length} icon="✅" color="green" />
          <DashboardStatCard title="Credit Exposure" value={fmt(rows.reduce((s, d) => s + Number(d.credit_limit || 0), 0))} icon="💳" color="blue" />
        </div>
        <Button onClick={openCreate}>+ Add Distributor</Button>
      </div>

      <DashboardPanel title="Distributors">
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Name</TableHeader>
              <TableHeader>Territory</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Credit Limit</TableHeader>
              <TableHeader>Outstanding</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.territory?.name || '—'}</TableCell>
                <TableCell>{d.phone || '—'}</TableCell>
                <TableCell>{fmt(d.credit_limit)}</TableCell>
                <TableCell><StatusBadge status={Number(d.outstanding_balance) > 0 ? 'due' : 'paid'} label={fmt(d.outstanding_balance)} /></TableCell>
                <TableCell><StatusBadge status={d.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="!py-1 !px-2 !text-xs" onClick={() => openEdit(d)}>Edit</Button>
                    <Button variant="danger" className="!py-1 !px-2 !text-xs" onClick={() => remove(d.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardPanel>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Distributor' : 'Add Distributor'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name" {...register('name', { required: true })} />
          <Input label="Contact person" {...register('contact_person')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Email" type="email" {...register('email')} />
          <Input label="GSTIN" {...register('gstin')} />
          <Input label="PAN" {...register('pan')} />
          <Select label="Territory" {...register('territory_id')}>
            <option value="">Select territory</option>
            {territories.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <Select label="Status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </Select>
          <Input label="Credit limit" type="number" step="0.01" {...register('credit_limit')} />
          {!editId && <Input label="Opening balance" type="number" step="0.01" {...register('opening_balance')} />}
          <Input label="Security deposit" type="number" step="0.01" {...register('security_deposit')} />
          <div className="md:col-span-2">
            <Input label="Address" {...register('address')} />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
