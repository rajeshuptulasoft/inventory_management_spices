import { useEffect, useState } from 'react';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Table from '../../components/ui/Table';

export default function InventoryView() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?limit=100').then((r) => {
      setVariants(r.data.data.flatMap((p) => (p.variants || []).map((v) => ({
        ...v, product_name: p.product_name, low: v.current_stock <= v.minimum_stock,
      }))));
      setLoading(false);
    });
  }, []);

  return (
    <MainLayout title="Inventory View">
      <div className="card">
        <Table loading={loading} data={variants} columns={[
          { key: 'product_name', label: 'Product' },
          { key: 'size', label: 'Variant' },
          { key: 'sku', label: 'SKU' },
          { key: 'current_stock', label: 'Stock', render: (r) => (
            <span className={r.low ? 'text-red-600 font-semibold' : ''}>{r.current_stock}</span>
          )},
          { key: 'rack', label: 'Rack', render: (r) => r.rack?.rack_name || '—' },
        ]} />
      </div>
    </MainLayout>
  );
}
