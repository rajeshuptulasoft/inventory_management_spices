export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN') : '—';
