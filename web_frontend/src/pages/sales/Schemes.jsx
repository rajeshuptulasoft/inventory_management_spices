import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

export default function Schemes() {
  const [schemes, setSchemes] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const schemeType = watch('scheme_type');

  const load = () => api.get('/fmcg/schemes').then((r) => setSchemes(r.data.data || []));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({
      name: '',
      scheme_type: 'quantity',
      description: '',
      buy_qty: 10,
      free_qty: 1,
      discount_percent: 0,
      discount_amount: 0,
      start_date: '',
      end_date: '',
      status: 'active',
    });
    setModal(true);
  };

  const openEdit = (s) => {
    setEditId(s.id);
    setValue('name', s.name);
    setValue('scheme_type', s.scheme_type);
    setValue('description', s.description || '');
    setValue('buy_qty', s.buy_qty || 0);
    setValue('free_qty', s.free_qty || 0);
    setValue('discount_percent', s.discount_percent || 0);
    setValue('discount_amount', s.discount_amount || 0);
    setValue('start_date', s.start_date?.slice?.(0, 10) || s.start_date || '');
    setValue('end_date', s.end_date?.slice?.(0, 10) || s.end_date || '');
    setValue('status', s.status || 'active');
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        scheme_type: data.scheme_type,
        description: data.description,
        buy_qty: Number(data.buy_qty) || 0,
        free_qty: Number(data.free_qty) || 0,
        discount_percent: Number(data.discount_percent) || 0,
        discount_amount: Number(data.discount_amount) || 0,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        status: data.status,
        products: [],
        distributors: [],
      };
      if (editId) {
        await api.put(`/fmcg/schemes/${editId}`, payload);
        toast.success('Scheme updated');
      } else {
        await api.post('/fmcg/schemes', payload);
        toast.success('Scheme created');
      }
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this scheme?')) return;
    try {
      await api.delete(`/fmcg/schemes/${id}`);
      toast.success('Scheme deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <MainLayout title="Schemes & Offers">
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate}>+ Add Scheme</Button>
      </div>

      <DashboardPanel title="Schemes">
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Name</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Offer</TableHeader>
              <TableHeader>Valid until</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {schemes.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell><StatusBadge status="approved" label={s.scheme_type?.replace(/_/g, ' ')} /></TableCell>
                <TableCell>
                  {s.scheme_type === 'quantity' && s.buy_qty
                    ? `Buy ${s.buy_qty} get ${s.free_qty} free`
                    : s.discount_percent
                      ? `${s.discount_percent}% off`
                      : s.discount_amount
                        ? `₹${s.discount_amount}`
                        : '—'}
                </TableCell>
                <TableCell>{s.end_date || '—'}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="!py-1 !px-2 !text-xs" onClick={() => openEdit(s)}>Edit</Button>
                    <Button variant="danger" className="!py-1 !px-2 !text-xs" onClick={() => remove(s.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardPanel>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Scheme' : 'Add Scheme'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <div className="md:col-span-2">
            <Input label="Scheme name" {...register('name', { required: true })} />
          </div>
          <Select label="Scheme type" {...register('scheme_type')}>
            <option value="quantity">Buy X Get Y (Quantity)</option>
            <option value="free_packet">Free packet</option>
            <option value="discount">Discount %</option>
            <option value="cashback">Cashback (₹)</option>
            <option value="seasonal">Seasonal</option>
          </Select>
          <Select label="Status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          {(schemeType === 'quantity' || schemeType === 'free_packet') && (
            <>
              <Input label="Buy quantity" type="number" {...register('buy_qty')} />
              <Input label="Free quantity" type="number" {...register('free_qty')} />
            </>
          )}
          {schemeType === 'discount' && (
            <Input label="Discount %" type="number" step="0.01" {...register('discount_percent')} />
          )}
          {schemeType === 'cashback' && (
            <Input label="Cashback amount (₹)" type="number" {...register('discount_amount')} />
          )}
          <Input label="Start date" type="date" {...register('start_date')} />
          <Input label="End date" type="date" {...register('end_date')} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Description</label>
            <textarea className="input-field w-full min-h-[80px]" {...register('description')} />
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
