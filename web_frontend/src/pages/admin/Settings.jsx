import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Settings() {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    api.get('/settings').then((r) => reset(r.data.data));
  }, [reset]);

  const onSubmit = async (data) => {
    await api.put('/settings', data);
    toast.success('Settings saved');
  };

  return (
    <MainLayout title="Company Settings">
      <div className="max-w-2xl glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6">Company Profile</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
          <Input label="Company Name" {...register('company_name')} />
          <Input label="GST Number" {...register('gst_number')} />
          <Input label="Address" {...register('address')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Email" {...register('email')} />
          <Input label="Bank Name" {...register('bank_name')} />
          <Input label="Account Number" {...register('bank_account')} />
          <Input label="IFSC" {...register('ifsc')} />
          <Input label="Invoice Prefix" {...register('invoice_prefix')} />
          <Input label="Default GST %" type="number" {...register('gst_rate_default')} />
          <Button type="submit" className="mt-4">Save Settings</Button>
        </form>
        <p className="text-xs text-gray-500 mt-6">API Docs: <a href="http://localhost:5000/api/docs" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">localhost:5000/api/docs</a></p>
      </div>
    </MainLayout>
  );
}
