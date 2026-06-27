import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DataTable from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function VariantManagement() {
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const loadProducts = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([api.get('/products?limit=100'), api.get('/racks')]);
    setProducts(p.data.data);
    setRacks(r.data.data);
    const allVariants = p.data.data.flatMap((prod) =>
      (prod.variants || []).map((v) => ({ ...v, product_name: prod.product_name, product_id: prod.id }))
    );
    setVariants(allVariants);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({
      product_id: '', size: '', sku: '', barcode: '', mrp: '', selling_price: '',
      gst_percent: '', unit: 'pcs', weight: '', rack_id: '', current_stock: 0, minimum_stock: 10,
    });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setValue('product_id', row.product_id);
    setValue('size', row.size);
    setValue('sku', row.sku);
    setValue('barcode', row.barcode || '');
    setValue('mrp', row.mrp);
    setValue('selling_price', row.selling_price);
    setValue('gst_percent', row.gst_percent);
    setValue('unit', row.unit || 'pcs');
    setValue('weight', row.weight || '');
    setValue('rack_id', row.rack_id || '');
    setValue('current_stock', row.current_stock);
    setValue('minimum_stock', row.minimum_stock);
    setModal(true);
  };

  const buildPayload = (data) => ({
    product_id: Number(data.product_id),
    size: data.size,
    sku: data.sku,
    barcode: data.barcode || null,
    mrp: Number(data.mrp),
    selling_price: Number(data.selling_price),
    gst_percent: Number(data.gst_percent),
    unit: data.unit || 'pcs',
    weight: data.weight ? Number(data.weight) : null,
    rack_id: data.rack_id ? Number(data.rack_id) : null,
    current_stock: Number(data.current_stock || 0),
    minimum_stock: Number(data.minimum_stock || 10),
  });

  const onSubmit = async (data) => {
    try {
      const payload = buildPayload(data);
      if (editId) {
        await api.put(`/variants/${editId}`, payload);
        toast.success('Variant updated');
      } else {
        await api.post('/variants', payload);
        toast.success('Variant created');
      }
      setModal(false);
      reset();
      loadProducts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this variant?')) return;
    try {
      await api.delete(`/variants/${id}`);
      toast.success('Variant deleted');
      loadProducts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <MainLayout title="Variant Management">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>+ Add Variant</Button>
      </div>
      <div className="card">
        <DataTable
          loading={loading}
          data={variants}
          columns={[
            { key: 'product_name', label: 'Product' },
            { key: 'size', label: 'Size' },
            { key: 'sku', label: 'SKU' },
            { key: 'selling_price', label: 'Price', render: (r) => `₹${r.selling_price}` },
            { key: 'gst_percent', label: 'GST %' },
            { key: 'current_stock', label: 'Stock' },
            { key: 'rack', label: 'Rack', render: (r) => r.rack?.rack_name || '—' },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(r)} className="text-orange-600 text-sm font-medium">Edit</button>
                  <button type="button" onClick={() => remove(r.id)} className="text-red-600 text-sm font-medium">Delete</button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Variant' : 'Add Variant'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Product</label>
            <select className="input-field" {...register('product_id', { required: true })} disabled={!!editId}>
              <option value="">Select product</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.product_name}</option>)}
            </select>
          </div>
          <Input label="Size (e.g. 100gm)" {...register('size', { required: true })} />
          <Input label="SKU" {...register('sku', { required: true })} />
          <Input label="Barcode" {...register('barcode')} />
          <Input label="MRP" type="number" step="0.01" {...register('mrp', { required: true })} />
          <Input label="Selling Price" type="number" step="0.01" {...register('selling_price', { required: true })} />
          <Input label="GST %" type="number" step="0.01" {...register('gst_percent', { required: true })} />
          <Input label="Unit" defaultValue="pcs" {...register('unit')} />
          <Input label="Weight (kg)" type="number" step="0.001" {...register('weight')} />
          <div>
            <label className="label">Rack</label>
            <select className="input-field" {...register('rack_id')}>
              <option value="">None</option>
              {racks.map((r) => <option key={r.id} value={r.id}>{r.rack_name}</option>)}
            </select>
          </div>
          <Input label="Current stock" type="number" {...register('current_stock')} />
          <Input label="Min stock alert" type="number" {...register('minimum_stock')} />
          <div className="col-span-2"><Button type="submit">{editId ? 'Update' : 'Create'}</Button></div>
        </form>
      </Modal>
    </MainLayout>
  );
}
