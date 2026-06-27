import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function StockEntry() {
  const [variants, setVariants] = useState([]);
  const [type, setType] = useState('in');
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    api.get('/products?limit=100').then((r) => {
      setVariants(r.data.data.flatMap((p) => (p.variants || []).map((v) => ({ ...v, label: `${p.product_name} - ${v.size}` }))));
    });
  }, []);

  const onSubmit = async (data) => {
    const payload = { variant_id: Number(data.variant_id), quantity: Number(data.quantity), notes: data.notes, batch_number: data.batch_number, manufacturing_date: data.manufacturing_date, expiry_date: data.expiry_date, rack_id: data.rack_id ? Number(data.rack_id) : undefined };
    try {
      if (type === 'in') await api.post('/inventory/stock-in', payload);
      else await api.post('/inventory/stock-out', payload);
      toast.success(`Stock ${type === 'in' ? 'added' : 'removed'}`);
      reset();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  return (
    <MainLayout title="Stock Entry">
      <div className="card max-w-xl">
        <div className="flex gap-2 mb-6">
          <Button variant={type === 'in' ? 'primary' : 'secondary'} onClick={() => setType('in')}>Stock In</Button>
          <Button variant={type === 'out' ? 'primary' : 'secondary'} onClick={() => setType('out')}>Stock Out</Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="label">Variant</label>
            <select className="input-field" {...register('variant_id', { required: true })}>
              <option value="">Select</option>
              {variants.map((v) => <option key={v.id} value={v.id}>{v.label} (Stock: {v.current_stock})</option>)}
            </select>
          </div>
          <Input label="Quantity" type="number" {...register('quantity', { required: true })} />
          {type === 'in' && (
            <>
              <Input label="Batch Number" {...register('batch_number')} />
              <Input label="Mfg Date" type="date" {...register('manufacturing_date')} />
              <Input label="Expiry Date" type="date" {...register('expiry_date')} />
            </>
          )}
          <Input label="Notes" {...register('notes')} />
          <Button type="submit">Submit</Button>
        </form>
      </div>
    </MainLayout>
  );
}
