export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MARKETING_HEAD: 'marketing_head',
  ASM: 'asm',
  TM: 'tm',
  SO: 'so',
  DISTRIBUTOR: 'distributor',
  PRODUCTION_MANAGER: 'production_manager',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  ACCOUNTANT: 'accountant',
  PRODUCTION: 'production',
  MARKETING: 'marketing',
};

export const ROLE_GROUPS = {
  fullAdmin: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  salesLeadership: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING_HEAD, ROLES.MARKETING],
  fieldSales: [ROLES.ASM, ROLES.TM, ROLES.SO],
  production: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCTION_MANAGER, ROLES.PRODUCTION],
  warehouse: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.PRODUCTION_MANAGER, ROLES.PRODUCTION],
  accounts: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT],
  distributor: [ROLES.DISTRIBUTOR],
  marketing: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING_HEAD, ROLES.MARKETING],
  salesAll: [ROLES.MARKETING_HEAD, ROLES.ASM, ROLES.TM, ROLES.SO, ROLES.MARKETING],
};

export const canAccess = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles?.length) return false;
  if (allowedRoles.includes(userRole)) return true;
  if (userRole === ROLES.PRODUCTION && allowedRoles.some((r) => [ROLES.PRODUCTION, ROLES.PRODUCTION_MANAGER].includes(r))) return true;
  if (userRole === ROLES.MARKETING && allowedRoles.some((r) => [ROLES.MARKETING, ROLES.MARKETING_HEAD].includes(r))) return true;
  if (ROLE_GROUPS.fullAdmin.includes(userRole)) return true;
  return false;
};

export const roleHomePath = (role) => {
  const map = {
    super_admin: '/admin',
    admin: '/admin',
    marketing_head: '/sales',
    marketing: '/sales',
    asm: '/sales',
    tm: '/sales',
    so: '/sales',
    distributor: '/distributor',
    production_manager: '/production',
    production: '/production',
    warehouse_manager: '/warehouse',
    accountant: '/finance',
  };
  return map[role] || '/admin';
};

export const getNavLinks = (role) => {
  const admin = [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/territories', label: 'Territories', icon: '🗺️' },
    { to: '/admin/distributors', label: 'Distributors', icon: '🏪' },
    { to: '/admin/wholesalers', label: 'Wholesalers', icon: '🏬' },
    { to: '/admin/dealers', label: 'Dealers', icon: '🤝' },
    { to: '/admin/products', label: 'Products', icon: '🌶️' },
    { to: '/admin/variants', label: 'Variants', icon: '📐' },
    { to: '/admin/commodities', label: 'Commodities', icon: '🌾' },
    { to: '/admin/raw-materials', label: 'Raw Materials', icon: '🧪' },
    { to: '/sales/orders', label: 'Sales Orders', icon: '📋' },
    { to: '/sales/schemes', label: 'Schemes', icon: '🎁' },
    { to: '/finance/payments', label: 'Finance', icon: '💰' },
    { to: '/admin/inventory', label: 'Inventory', icon: '📦' },
    { to: '/admin/billing', label: 'GST Billing', icon: '🧾' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
  ];
  const sales = [
    { to: '/sales', label: 'Dashboard', icon: '📊', end: true },
    { to: '/sales/orders', label: 'Orders', icon: '📋' },
    { to: '/admin/distributors', label: 'Distributors', icon: '🏪' },
    { to: '/sales/schemes', label: 'Schemes', icon: '🎁' },
    { to: '/sales/collections', label: 'Collections', icon: '💵' },
    { to: '/sales/visits', label: 'Visits', icon: '📍' },
    { to: '/sales/analytics', label: 'Analytics', icon: '📈' },
  ];
  const finance = [
    { to: '/finance', label: 'Dashboard', icon: '📊', end: true },
    { to: '/finance/payments', label: 'Payments', icon: '💳' },
    { to: '/finance/collections', label: 'Collections', icon: '💵' },
    { to: '/finance/outstanding', label: 'Outstanding', icon: '⚠️' },
    { to: '/admin/distributors', label: 'Distributors', icon: '🏪' },
  ];
  const production = [
    { to: '/production', label: 'Dashboard', icon: '📊', end: true },
    { to: '/production/production-runs', label: 'Production', icon: '🏭' },
    { to: '/admin/commodities', label: 'Commodities', icon: '🌾' },
    { to: '/admin/raw-materials', label: 'Raw Materials', icon: '🧪' },
    { to: '/production/stock', label: 'Stock Entry', icon: '➕' },
    { to: '/production/batches', label: 'Batches', icon: '📅' },
    { to: '/production/inventory', label: 'Inventory', icon: '📦' },
  ];
  const distributor = [
    { to: '/distributor', label: 'Dashboard', icon: '📊', end: true },
    { to: '/sales/orders', label: 'My Orders', icon: '📋' },
    { to: '/distributor/stock', label: 'Stock', icon: '📦' },
    { to: '/finance/outstanding', label: 'Outstanding', icon: '⚠️' },
  ];
  const warehouse = [
    { to: '/warehouse', label: 'Dashboard', icon: '📊', end: true },
    { to: '/sales/orders', label: 'Dispatch Orders', icon: '🚚' },
    { to: '/warehouse/returns', label: 'Returns', icon: '↩️' },
    { to: '/production/inventory', label: 'Inventory', icon: '📦' },
  ];

  if (ROLE_GROUPS.fullAdmin.includes(role)) return admin;
  if (ROLE_GROUPS.accounts.includes(role)) return finance;
  if (ROLE_GROUPS.fieldSales.includes(role) || role === ROLES.MARKETING_HEAD || role === ROLES.MARKETING) return sales;
  if (ROLE_GROUPS.distributor.includes(role)) return distributor;
  if (ROLE_GROUPS.warehouse.includes(role) && role === ROLES.WAREHOUSE_MANAGER) return warehouse;
  if (ROLE_GROUPS.production.includes(role)) return production;
  return admin;
};
