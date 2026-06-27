import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { ROLE_GROUPS } from '../utils/roles';

import LoginPage from '../pages/auth/LoginPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import ProductManagement from '../pages/admin/ProductManagement';
import VariantManagement from '../pages/admin/VariantManagement';
import RackManagement from '../pages/admin/RackManagement';
import InventoryReports from '../pages/admin/InventoryReports';
import GSTBilling from '../pages/admin/GSTBilling';
import SalesReports from '../pages/admin/SalesReports';
import RawMaterials from '../pages/admin/RawMaterials';
import Settings from '../pages/admin/Settings';
import Territories from '../pages/admin/Territories';
import Distributors from '../pages/admin/Distributors';
import Commodities from '../pages/admin/Commodities';
import Wholesalers from '../pages/admin/Wholesalers';
import Dealers from '../pages/admin/Dealers';

import ProductionDashboard from '../pages/production/ProductionDashboard';
import ProductionRuns from '../pages/production/ProductionRuns';
import StockEntry from '../pages/production/StockEntry';
import BatchManagement from '../pages/production/BatchManagement';
import RackAllocation from '../pages/production/RackAllocation';
import InventoryView from '../pages/production/InventoryView';

import MarketingDashboard from '../pages/marketing/MarketingDashboard';
import PricingManagement from '../pages/marketing/PricingManagement';
import CustomerManagement from '../pages/marketing/CustomerManagement';
import OfferManagement from '../pages/marketing/OfferManagement';
import SalesAnalytics from '../pages/marketing/SalesAnalytics';

import SalesDashboard from '../pages/sales/SalesDashboard';
import SalesOrders from '../pages/sales/SalesOrders';
import Schemes from '../pages/sales/Schemes';

import FinanceDashboard from '../pages/finance/FinanceDashboard';
import Payments from '../pages/finance/Payments';
import Collections from '../pages/finance/Collections';
import OutstandingReport from '../pages/finance/OutstandingReport';

import DistributorDashboard from '../pages/distributor/DistributorDashboard';

const admin = ROLE_GROUPS.fullAdmin;
const sales = [...ROLE_GROUPS.salesLeadership, ...ROLE_GROUPS.fieldSales];
const production = ROLE_GROUPS.production;
const accounts = ROLE_GROUPS.accounts;
const distributor = ROLE_GROUPS.distributor;
const marketing = ROLE_GROUPS.marketing;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/admin" element={<ProtectedRoute roles={admin}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={admin}><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute roles={admin}><ProductManagement /></ProtectedRoute>} />
      <Route path="/admin/variants" element={<ProtectedRoute roles={admin}><VariantManagement /></ProtectedRoute>} />
      <Route path="/admin/racks" element={<ProtectedRoute roles={admin}><RackManagement /></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute roles={admin}><InventoryReports /></ProtectedRoute>} />
      <Route path="/admin/billing" element={<ProtectedRoute roles={admin}><GSTBilling /></ProtectedRoute>} />
      <Route path="/admin/sales" element={<ProtectedRoute roles={admin}><SalesReports /></ProtectedRoute>} />
      <Route path="/admin/raw-materials" element={<ProtectedRoute roles={[...admin, ...production]}><RawMaterials /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute roles={admin}><Settings /></ProtectedRoute>} />
      <Route path="/admin/territories" element={<ProtectedRoute roles={admin}><Territories /></ProtectedRoute>} />
      <Route path="/admin/distributors" element={<ProtectedRoute roles={[...admin, ...sales, ...accounts]}><Distributors /></ProtectedRoute>} />
      <Route path="/admin/wholesalers" element={<ProtectedRoute roles={[...admin, ...sales, ...accounts]}><Wholesalers /></ProtectedRoute>} />
      <Route path="/admin/dealers" element={<ProtectedRoute roles={[...admin, ...sales, ...accounts]}><Dealers /></ProtectedRoute>} />
      <Route path="/admin/commodities" element={<ProtectedRoute roles={[...admin, ...production]}><Commodities /></ProtectedRoute>} />

      <Route path="/production" element={<ProtectedRoute roles={production}><ProductionDashboard /></ProtectedRoute>} />
      <Route path="/production/production-runs" element={<ProtectedRoute roles={production}><ProductionRuns /></ProtectedRoute>} />
      <Route path="/production/stock" element={<ProtectedRoute roles={production}><StockEntry /></ProtectedRoute>} />
      <Route path="/production/batches" element={<ProtectedRoute roles={production}><BatchManagement /></ProtectedRoute>} />
      <Route path="/production/racks" element={<ProtectedRoute roles={production}><RackAllocation /></ProtectedRoute>} />
      <Route path="/production/inventory" element={<ProtectedRoute roles={production}><InventoryView /></ProtectedRoute>} />

      <Route path="/marketing" element={<ProtectedRoute roles={marketing}><MarketingDashboard /></ProtectedRoute>} />
      <Route path="/marketing/pricing" element={<ProtectedRoute roles={marketing}><PricingManagement /></ProtectedRoute>} />
      <Route path="/marketing/customers" element={<ProtectedRoute roles={marketing}><CustomerManagement /></ProtectedRoute>} />
      <Route path="/marketing/offers" element={<ProtectedRoute roles={marketing}><OfferManagement /></ProtectedRoute>} />
      <Route path="/marketing/analytics" element={<ProtectedRoute roles={marketing}><SalesAnalytics /></ProtectedRoute>} />

      <Route path="/sales" element={<ProtectedRoute roles={sales}><SalesDashboard /></ProtectedRoute>} />
      <Route path="/sales/orders" element={<ProtectedRoute roles={[...sales, ...admin]}><SalesOrders /></ProtectedRoute>} />
      <Route path="/sales/schemes" element={<ProtectedRoute roles={[...sales, ...admin]}><Schemes /></ProtectedRoute>} />
      <Route path="/sales/collections" element={<ProtectedRoute roles={[...sales, ...accounts]}><Collections /></ProtectedRoute>} />
      <Route path="/sales/analytics" element={<ProtectedRoute roles={[...sales, ...marketing]}><SalesAnalytics /></ProtectedRoute>} />

      <Route path="/finance" element={<ProtectedRoute roles={accounts}><FinanceDashboard /></ProtectedRoute>} />
      <Route path="/finance/payments" element={<ProtectedRoute roles={accounts}><Payments /></ProtectedRoute>} />
      <Route path="/finance/collections" element={<ProtectedRoute roles={[...accounts, ...sales]}><Collections /></ProtectedRoute>} />
      <Route path="/finance/outstanding" element={<ProtectedRoute roles={[...accounts, ...sales, ...distributor]}><OutstandingReport /></ProtectedRoute>} />

      <Route path="/distributor" element={<ProtectedRoute roles={distributor}><DistributorDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
