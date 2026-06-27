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

export default function Commodities() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();
  const purchaseForm = useForm();

  const load = () => api.get('/fmcg/commodities').then((r) => setRows(r.data.data || []));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({ name: '', grade: 'A', current_stock: 0, minimum_stock: 100, status: 'active' });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setValue('name', row.name);
    setValue('grade', row.grade || '');
    setValue('minimum_stock', row.minimum_stock);
    setValue('status', row.status || 'active');
    setModal(true);
  };

  const openPurchase = (row) => {
    purchaseForm.reset({
      commodity_id: row.id,
      quantity: '',
      rate: '',
      purchase_date: new Date().toISOString().slice(0, 10),
    });
    setPurchaseModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        grade: data.grade,
        minimum_stock: Number(data.minimum_stock) || 0,
        status: data.status,
      };
      if (!editId) payload.current_stock = Number(data.current_stock) || 0;
      if (editId) {
        await api.put(`/fmcg/commodities/${editId}`, payload);
        toast.success('Commodity updated');
      } else {
        await api.post('/fmcg/commodities', payload);
        toast.success('Commodity created');
      }
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  const onPurchase = async (data) => {
    try {
      await api.post('/fmcg/commodities/purchase', {
        commodity_id: Number(data.commodity_id),
        quantity: Number(data.quantity),
        rate: Number(data.rate),
        purchase_date: data.purchase_date,
      });
      toast.success('Purchase recorded');
      setPurchaseModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Purchase failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this commodity?')) return;
    try {
      await api.delete(`/fmcg/commodities/${id}`);
      toast.success('Commodity deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <MainLayout title="Commodity Management">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <DashboardStatCard title="Commodities" value={rows.length} icon="🌾" color="amber" />
          <DashboardStatCard title="Total Stock (kg)" value={rows.reduce((s, c) => s + Number(c.current_stock || 0), 0).toFixed(1)} icon="📦" color="green" />
          <DashboardStatCard title="Low Stock" value={rows.filter((c) => Number(c.current_stock) < Number(c.minimum_stock)).length} icon="⚠️" color="red" />
        </div>
        <Button onClick={openCreate}>+ Add Commodity</Button>
      </div>

      <DashboardPanel title="Commodity Stock">
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Name</TableHeader>
              <TableHeader>Grade</TableHeader>
              <TableHeader>Current Stock</TableHeader>
              <TableHeader>Min Stock</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.grade || '—'}</TableCell>
                <TableCell>{c.current_stock} kg</TableCell>
                <TableCell>{c.minimum_stock} kg</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" className="!py-1 !px-2 !text-xs" onClick={() => openPurchase(c)}>Purchase</Button>
                    <Button variant="secondary" className="!py-1 !px-2 !text-xs" onClick={() => openEdit(c)}>Edit</Button>
                    <Button variant="danger" className="!py-1 !px-2 !text-xs" onClick={() => remove(c.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardPanel>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Commodity' : 'Add Commodity'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" {...register('name', { required: true })} disabled={!!editId} />
          <Input label="Grade" {...register('grade')} />
          {!editId && <Input label="Initial stock (kg)" type="number" step="0.001" {...register('current_stock')} />}
          <Input label="Minimum stock alert (kg)" type="number" step="0.001" {...register('minimum_stock')} />
          <Select label="Status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
        </form>
      </Modal>

      <Modal open={purchaseModal} onClose={() => setPurchaseModal(false)} title="Record Purchase">
        <form onSubmit={purchaseForm.handleSubmit(onPurchase)} className="space-y-4">
          <input type="hidden" {...purchaseForm.register('commodity_id')} />
          <Input label="Quantity (kg)" type="number" step="0.001" {...purchaseForm.register('quantity', { required: true })} />
          <Input label="Rate per kg" type="number" step="0.01" {...purchaseForm.register('rate', { required: true })} />
          <Input label="Purchase date" type="date" {...purchaseForm.register('purchase_date', { required: true })} />
          <Button type="submit">Record Purchase</Button>
        </form>
      </Modal>
    </MainLayout>
  );
}
