import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import GlassStatCard from '../../components/dashboard/GlassStatCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Wholesalers() {
  const [rows, setRows] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = async () => {
    setLoading(true);
    const [w, t] = await Promise.all([
      api.get('/fmcg/wholesalers?limit=100'),
      api.get('/fmcg/territories'),
    ]);
    setRows(w.data.data || []);
    setTerritories(t.data.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({
      name: '', phone: '', email: '', gstin: '', pan: '', address: '',
      territory_id: '', credit_limit: 0, channel_type: 'wholesaler', status: 'active',
    });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    Object.keys(row).forEach((k) => setValue(k, row[k] ?? ''));
    setValue('territory_id', row.territory_id || '');
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        territory_id: data.territory_id ? Number(data.territory_id) : null,
        credit_limit: Number(data.credit_limit) || 0,
      };
      if (editId) {
        await api.put(`/fmcg/wholesalers/${editId}`, payload);
        toast.success('Wholesaler updated');
      } else {
        await api.post('/fmcg/wholesalers', payload);
        toast.success('Wholesaler created');
      }
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this wholesaler?')) return;
    try {
      await api.delete(`/fmcg/wholesalers/${id}`);
      toast.success('Wholesaler deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <MainLayout title="Wholesaler Management">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <GlassStatCard title="Wholesalers" value={rows.length} icon="🏬" accent="blue" />
          <GlassStatCard title="Outstanding" value={fmt(rows.reduce((s, w) => s + Number(w.outstanding_balance || 0), 0))} icon="⚠️" accent="red" />
          <GlassStatCard title="Active" value={rows.filter((w) => w.status === 'active').length} icon="✅" accent="green" />
        </div>
        <Button onClick={openCreate}>+ Add Wholesaler</Button>
      </div>

      <DashboardPanel title="Wholesalers & Super Stockists">
        {loading ? <p className="text-slate-500 text-sm py-8 text-center">Loading...</p> : (
          <Table>
            <TableHead>
              <TableRow className="hover:bg-transparent">
                <TableHeader>Name</TableHeader>
                <TableHeader>Phone</TableHeader>
                <TableHeader>Territory</TableHeader>
                <TableHeader>Credit</TableHeader>
                <TableHeader>Outstanding</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>{w.phone || '—'}</TableCell>
                  <TableCell>{w.territory?.name || '—'}</TableCell>
                  <TableCell>{fmt(w.credit_limit)}</TableCell>
                  <TableCell><StatusBadge status="due" label={fmt(w.outstanding_balance)} /></TableCell>
                  <TableCell><StatusBadge status="approved" label={w.channel_type?.replace('_', ' ')} /></TableCell>
                  <TableCell><StatusBadge status={w.status} /></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="!py-1 !px-2 !text-xs" onClick={() => openEdit(w)}>Edit</Button>
                      <Button variant="danger" className="!py-1 !px-2 !text-xs" onClick={() => remove(w.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DashboardPanel>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Wholesaler' : 'Add Wholesaler'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Input label="Name" {...register('name', { required: true })} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Email" type="email" {...register('email')} />
          <Input label="GSTIN" {...register('gstin')} />
          <Input label="PAN" {...register('pan')} />
          <Select label="Territory" {...register('territory_id')}>
            <option value="">— None —</option>
            {territories.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          <Input label="Credit limit" type="number" {...register('credit_limit')} />
          <Select label="Channel type" {...register('channel_type')}>
            <option value="wholesaler">Wholesaler</option>
            <option value="super_stockist">Super Stockist</option>
          </Select>
          <Select label="Status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </Select>
          <div className="md:col-span-2">
            <Input label="Address" {...register('address')} />
          </div>
          <div className="md:col-span-2 flex gap-3 justify-end mt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
