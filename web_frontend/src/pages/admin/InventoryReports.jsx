import { useEffect, useState } from 'react';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import Table from '../../components/ui/Table';

export default function InventoryReports() {
  const [data, setData] = useState({ lowStock: [], expiringSoon: [], recentMovements: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/inventory/reports').then((r) => { setData(r.data.data); setLoading(false); });
  }, []);

  return (
    <MainLayout title="Inventory Reports">
      <div className="grid gap-6">
        <div className="card">
          <h3 className="font-semibold text-red-600 mb-4">Low Stock Alerts</h3>
          <Table loading={loading} data={data.lowStock} columns={[
            { key: 'product', label: 'Product', render: (r) => `${r.product?.product_name} - ${r.size}` },
            { key: 'sku', label: 'SKU' },
            { key: 'current_stock', label: 'Stock' },
            { key: 'minimum_stock', label: 'Min' },
          ]} />
        </div>
        <div className="card">
          <h3 className="font-semibold text-orange-600 mb-4">Expiry Alerts (30 days)</h3>
          <Table loading={loading} data={data.expiringSoon} columns={[
            { key: 'batch_number', label: 'Batch' },
            { key: 'variant', label: 'Product', render: (r) => `${r.variant?.product?.product_name} - ${r.variant?.size}` },
            { key: 'expiry_date', label: 'Expiry' },
            { key: 'quantity', label: 'Qty' },
          ]} />
        </div>
      </div>
    </MainLayout>
  );
}
