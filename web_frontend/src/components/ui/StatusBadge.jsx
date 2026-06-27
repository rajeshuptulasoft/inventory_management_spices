const STATUS_STYLES = {
  active: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400',
  inactive: 'bg-slate-500/15 text-slate-600 border-slate-500/30 dark:text-slate-400',
  blocked: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400',
  pending: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400',
  approved: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400',
  rejected: 'bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400',
  delivered: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400',
  partial: 'bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400',
  cancelled: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
  draft: 'bg-slate-400/15 text-slate-500 border-slate-400/30',
  paid: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 shadow-sm shadow-emerald-500/20',
  due: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
  overdue: 'bg-red-500/20 text-red-700 border-red-500/40 ring-1 ring-red-500/30 animate-pulse dark:text-red-400',
  confirmed: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  in_transit: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
  planned: 'bg-violet-500/15 text-violet-700 border-violet-500/30',
};

const DOT_COLORS = {
  active: 'bg-emerald-500',
  pending: 'bg-amber-500',
  approved: 'bg-blue-500',
  rejected: 'bg-red-500',
  overdue: 'bg-red-500',
  paid: 'bg-emerald-500',
  delivered: 'bg-emerald-500',
};

export default function StatusBadge({ status, label, className = '' }) {
  const key = String(status || 'inactive').toLowerCase().replace(/\s+/g, '_');
  const style = STATUS_STYLES[key] || STATUS_STYLES.inactive;
  const dot = DOT_COLORS[key];
  const text = label || String(status || '—').replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${style} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {text}
    </span>
  );
}

export function OrderStatusBadge({ status }) {
  return <StatusBadge status={status} />;
}

export function PaymentStatusBadge({ status }) {
  const map = { pending: 'due', confirmed: 'paid', overdue: 'overdue' };
  return <StatusBadge status={map[status] || status} label={status} />;
}
