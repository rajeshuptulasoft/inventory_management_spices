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

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Collections() {
  const [rows, setRows] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [modal, setModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    const [c, d] = await Promise.all([
      api.get('/fmcg/collections'),
      api.get('/fmcg/distributors?limit=200'),
    ]);
    setRows(c.data.data || []);
    setDistributors(d.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const distName = (id) => distributors.find((d) => d.id === id)?.name || `#${id}`;

  const openCreate = () => {
    reset({
      distributor_id: '',
      amount: '',
      payment_mode: 'cash',
      collection_date: new Date().toISOString().slice(0, 10),
      status: 'confirmed',
      notes: '',
    });
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/fmcg/collections', {
        distributor_id: Number(data.distributor_id),
        amount: Number(data.amount),
        payment_mode: data.payment_mode,
        collection_date: data.collection_date,
        status: data.status,
        notes: data.notes || undefined,
      });
      toast.success('Collection recorded');
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  return (
    <MainLayout title="Collection Management">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>+ Record Collection</Button>
      </div>

      <DashboardPanel title="Collections">
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Collection #</TableHeader>
              <TableHeader>Distributor</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Mode</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.collection_number}</TableCell>
                <TableCell>{distName(c.distributor_id)}</TableCell>
                <TableCell>{fmt(c.amount)}</TableCell>
                <TableCell className="capitalize">{c.payment_mode}</TableCell>
                <TableCell>{c.collection_date}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardPanel>

      <Modal open={modal} onClose={() => setModal(false)} title="Record Collection">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Distributor" {...register('distributor_id', { required: true })}>
            <option value="">Select distributor</option>
            {distributors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Input label="Amount" type="number" step="0.01" {...register('amount', { required: true })} />
          <Select label="Payment mode" {...register('payment_mode')}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank</option>
            <option value="cheque">Cheque</option>
          </Select>
          <Input label="Collection date" type="date" {...register('collection_date', { required: true })} />
          <Select label="Status" {...register('status')}>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </Select>
          <Input label="Notes" {...register('notes')} />
          <Button type="submit">Save Collection</Button>
        </form>
      </Modal>
    </MainLayout>
  );
}
