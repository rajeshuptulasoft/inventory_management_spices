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
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [modal, setModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    const [p, d] = await Promise.all([
      api.get('/fmcg/payments'),
      api.get('/fmcg/distributors?limit=200'),
    ]);
    setPayments(p.data.data || []);
    setDistributors(d.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    reset({
      party_type: 'distributor',
      party_id: '',
      amount: '',
      payment_mode: 'bank',
      payment_date: new Date().toISOString().slice(0, 10),
      reference_no: '',
      notes: '',
    });
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/fmcg/payments', {
        party_type: data.party_type,
        party_id: Number(data.party_id),
        amount: Number(data.amount),
        payment_mode: data.payment_mode,
        payment_date: data.payment_date,
        reference_no: data.reference_no || undefined,
        notes: data.notes || undefined,
      });
      toast.success('Payment recorded');
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  const partyLabel = (p) => {
    if (p.party_type === 'distributor') {
      const d = distributors.find((x) => x.id === p.party_id);
      return d?.name || `Distributor #${p.party_id}`;
    }
    return `${p.party_type} #${p.party_id}`;
  };

  return (
    <MainLayout title="Payment Management">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>+ Record Payment</Button>
      </div>

      <DashboardPanel title="Payment History">
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Payment #</TableHeader>
              <TableHeader>Party</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Mode</TableHeader>
              <TableHeader>Date</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.payment_number}</TableCell>
                <TableCell>{partyLabel(p)}</TableCell>
                <TableCell>{fmt(p.amount)}</TableCell>
                <TableCell className="capitalize">{p.payment_mode}</TableCell>
                <TableCell>{p.payment_date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardPanel>

      <Modal open={modal} onClose={() => setModal(false)} title="Record Payment">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Party type" {...register('party_type')}>
            <option value="distributor">Distributor</option>
            <option value="retailer">Retailer</option>
            <option value="customer">Customer</option>
            <option value="supplier">Supplier</option>
          </Select>
          <Select label="Party" {...register('party_id', { required: true })}>
            <option value="">Select party</option>
            {distributors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Input label="Amount" type="number" step="0.01" {...register('amount', { required: true })} />
          <Select label="Payment mode" {...register('payment_mode')}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank</option>
            <option value="cheque">Cheque</option>
            <option value="credit">Credit</option>
          </Select>
          <Input label="Payment date" type="date" {...register('payment_date', { required: true })} />
          <Input label="Reference no" {...register('reference_no')} />
          <Input label="Notes" {...register('notes')} />
          <Button type="submit">Save Payment</Button>
        </form>
      </Modal>
    </MainLayout>
  );
}
