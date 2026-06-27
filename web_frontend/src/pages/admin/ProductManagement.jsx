import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const imgUrl = (path) => (path?.startsWith('http') ? path : path || null);

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [galleryProduct, setGalleryProduct] = useState(null);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = async () => {
    const [p, c] = await Promise.all([
      api.get('/products?limit=50'),
      api.get('/categories'),
    ]);
    setProducts(p.data.data);
    setCategories(c.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditId(null); reset({}); setModal(true); };
  const openEdit = (p) => {
    setEditId(p.id);
    setValue('product_name', p.product_name);
    setValue('category_id', p.category_id);
    setValue('description', p.description);
    setValue('status', p.status);
    setModal(true);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => v != null && v !== '' && formData.append(k, v));
    const file = document.getElementById('product-image')?.files?.[0];
    if (file) formData.append('image', file);

    try {
      let productId = editId;
      if (editId) {
        await api.put(`/products/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const res = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        productId = res.data.data.id;
      }

      const galleryFiles = document.getElementById('product-gallery')?.files;
      if (galleryFiles?.length && productId) {
        const fd = new FormData();
        [...galleryFiles].forEach((f) => fd.append('images', f));
        await api.post(`/products/${productId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      toast.success(editId ? 'Product updated' : 'Product created');
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  const uploadMoreImages = async (productId, files) => {
    const fd = new FormData();
    [...files].forEach((f) => fd.append('images', f));
    await api.post(`/products/${productId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    toast.success('Photos uploaded');
    load();
    const updated = (await api.get(`/products/${productId}`)).data.data;
    setGalleryProduct(updated);
  };

  const remove = async (id) => {
    if (!confirm('Delete product and all variants?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Deleted');
    load();
  };

  const primaryImage = (p) => {
    const primary = p.images?.find((i) => i.is_primary) || p.images?.[0];
    return primary?.image_url || p.image;
  };

  return (
    <MainLayout title="Product Management">
      <div className="flex flex-wrap gap-3 justify-between mb-6">
        <input
          placeholder="Search products..."
          className="input-field max-w-xs"
          onChange={(e) => api.get(`/products?search=${e.target.value}`).then((r) => setProducts(r.data.data))}
        />
        <Button onClick={openCreate}>+ Add Product</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {products.map((p) => (
          <div key={p.id} className="glass-card rounded-2xl overflow-hidden border border-white/10 group hover:border-orange-500/30 transition">
            <div className="aspect-square bg-gray-800/50 relative overflow-hidden">
              {primaryImage(p) ? (
                <img src={imgUrl(primaryImage(p))} alt={p.product_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">🌶️</div>
              )}
              <span className="absolute top-2 right-2 bg-black/60 text-xs px-2 py-1 rounded-lg">{p.variants?.length || 0} variants</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white truncate">{p.product_name}</h3>
              <p className="text-xs text-gray-500">{p.category?.name || 'Uncategorized'}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setGalleryProduct(p)} className="text-xs text-orange-400 hover:underline">Photos</button>
                <button onClick={() => openEdit(p)} className="text-xs text-blue-400 hover:underline">Edit</button>
                <button onClick={() => remove(p.id)} className="text-xs text-red-400 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-4 border border-white/10">
        <h3 className="text-white font-medium mb-4">Table View</h3>
        <Table loading={loading} data={products} columns={[
          { key: 'photo', label: 'Photo', render: (r) => primaryImage(r) ? (
            <img src={imgUrl(primaryImage(r))} alt="" className="w-12 h-12 rounded-lg object-cover" />
          ) : '—' },
          { key: 'product_name', label: 'Product' },
          { key: 'category', label: 'Category', render: (r) => r.category?.name },
          { key: 'variants', label: 'Variants', render: (r) => r.variants?.length || 0 },
          { key: 'status', label: 'Status' },
        ]} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Product Name" {...register('product_name', { required: true })} />
          <div className="mb-4">
            <label className="label">Category</label>
            <select className="input-field" {...register('category_id')}>
              <option value="">Select</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Description" {...register('description')} />
          <div className="mb-4">
            <label className="label">Primary Image</label>
            <input id="product-image" type="file" accept="image/*" className="input-field" />
          </div>
          <div className="mb-4">
            <label className="label">Reference Photos (multiple)</label>
            <input id="product-gallery" type="file" accept="image/*" multiple className="input-field" />
            <p className="text-xs text-gray-500 mt-1">Upload photos for product identification & marketing reference</p>
          </div>
          <Button type="submit">Save Product</Button>
        </form>
      </Modal>

      <Modal open={!!galleryProduct} onClose={() => setGalleryProduct(null)} title={`Photos — ${galleryProduct?.product_name}`} size="lg">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {(galleryProduct?.images?.length ? galleryProduct.images : galleryProduct?.image ? [{ image_url: galleryProduct.image }] : []).map((img, i) => (
            <img key={i} src={imgUrl(img.image_url)} alt="" className="rounded-xl aspect-square object-cover border border-white/10" />
          ))}
          {!galleryProduct?.images?.length && !galleryProduct?.image && (
            <p className="col-span-full text-gray-500 text-sm">No photos yet</p>
          )}
        </div>
        <label className="label">Add more photos</label>
        <input type="file" accept="image/*" multiple className="input-field" onChange={(e) => {
          if (e.target.files?.length) uploadMoreImages(galleryProduct.id, e.target.files);
        }} />
      </Modal>
    </MainLayout>
  );
}
