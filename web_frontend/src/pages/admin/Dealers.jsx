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

export default function Dealers() {
  const [rows, setRows] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = async () => {
    setLoading(true);
    const [d, w, t] = await Promise.all([
      api.get('/fmcg/dealers?limit=100'),
      api.get('/fmcg/wholesalers?limit=100'),
      api.get('/fmcg/territories'),
    ]);
    setRows(d.data.data || []);
    setWholesalers(w.data.data || []);
    setTerritories(t.data.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({
      name: '', shop_name: '', phone: '', email: '', gstin: '',
      wholesaler_id: '', territory_id: '', credit_limit: 0, status: 'active',
    });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setValue('name', row.name);
    setValue('shop_name', row.shop_name || '');
    setValue('phone', row.phone || '');
    setValue('email', row.email || '');
    setValue('gstin', row.gstin || '');
    setValue('wholesaler_id', row.wholesaler_id || '');
    setValue('territory_id', row.territory_id || '');
    setValue('credit_limit', row.credit_limit || 0);
    setValue('status', row.status || 'active');
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        wholesaler_id: data.wholesaler_id ? Number(data.wholesaler_id) : null,
        territory_id: data.territory_id ? Number(data.territory_id) : null,
        credit_limit: Number(data.credit_limit) || 0,
      };
      if (editId) {
        await api.put(`/fmcg/dealers/${editId}`, payload);
        toast.success('Dealer updated');
      } else {
        await api.post('/fmcg/dealers', payload);
        toast.success('Dealer created');
      }
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this dealer?')) return;
    try {
      await api.delete(`/fmcg/dealers/${id}`);
      toast.success('Dealer deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <MainLayout title="Dealer Management">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
          <GlassStatCard title="Dealers" value={rows.length} icon="🏪" accent="purple" />
          <GlassStatCard title="Active" value={rows.filter((d) => d.status === 'active').length} icon="✅" accent="green" />
        </div>
        <Button onClick={openCreate}>+ Add Dealer</Button>
      </div>

      <DashboardPanel title="Dealers">
        {loading ? <p className="text-slate-500 text-sm py-8 text-center">Loading...</p> : (
          <Table>
            <TableHead>
              <TableRow className="hover:bg-transparent">
                <TableHeader>Dealer</TableHeader>
                <TableHeader>Shop</TableHeader>
                <TableHeader>Wholesaler</TableHeader>
                <TableHeader>Phone</TableHeader>
                <TableHeader>Outstanding</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.shop_name || '—'}</TableCell>
                  <TableCell>{d.wholesaler?.name || '—'}</TableCell>
                  <TableCell>{d.phone || '—'}</TableCell>
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
        )}
      </DashboardPanel>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Dealer' : 'Add Dealer'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Input label="Dealer name" {...register('name', { required: true })} />
          <Input label="Shop name" {...register('shop_name')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Email" type="email" {...register('email')} />
          <Input label="GSTIN" {...register('gstin')} />
          <Select label="Wholesaler" {...register('wholesaler_id')}>
            <option value="">— None —</option>
            {wholesalers.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </Select>
          <Select label="Territory" {...register('territory_id')}>
            <option value="">— None —</option>
            {territories.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          <Input label="Credit limit" type="number" {...register('credit_limit')} />
          <Select label="Status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </Select>
          <div className="md:col-span-2 flex gap-3 justify-end mt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
