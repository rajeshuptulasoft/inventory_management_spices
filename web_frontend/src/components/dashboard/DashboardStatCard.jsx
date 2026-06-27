const styles = {
  orange: {
    light: 'bg-orange-50 border-slate-200/80',
    dark: 'dark:bg-orange-950/40 dark:border-orange-900/50',
    iconL: 'bg-orange-100 text-orange-600 ring-orange-100',
    iconD: 'dark:bg-orange-900/60 dark:text-orange-400 dark:ring-orange-900/80',
  },
  amber: {
    light: 'bg-amber-50 border-slate-200/80',
    dark: 'dark:bg-amber-950/40 dark:border-amber-900/50',
    iconL: 'bg-amber-100 text-amber-700 ring-amber-100',
    iconD: 'dark:bg-amber-900/60 dark:text-amber-400 dark:ring-amber-900/80',
  },
  emerald: {
    light: 'bg-emerald-50 border-slate-200/80',
    dark: 'dark:bg-emerald-950/40 dark:border-emerald-900/50',
    iconL: 'bg-emerald-100 text-emerald-600 ring-emerald-100',
    iconD: 'dark:bg-emerald-900/60 dark:text-emerald-400 dark:ring-emerald-900/80',
  },
  sky: {
    light: 'bg-sky-50 border-slate-200/80',
    dark: 'dark:bg-sky-950/40 dark:border-sky-900/50',
    iconL: 'bg-sky-100 text-sky-600 ring-sky-100',
    iconD: 'dark:bg-sky-900/60 dark:text-sky-400 dark:ring-sky-900/80',
  },
  rose: {
    light: 'bg-rose-50 border-slate-200/80',
    dark: 'dark:bg-rose-950/40 dark:border-rose-900/50',
    iconL: 'bg-rose-100 text-rose-600 ring-rose-100',
    iconD: 'dark:bg-rose-900/60 dark:text-rose-400 dark:ring-rose-900/80',
  },
  violet: {
    light: 'bg-violet-50 border-slate-200/80',
    dark: 'dark:bg-violet-950/40 dark:border-violet-900/50',
    iconL: 'bg-violet-100 text-violet-600 ring-violet-100',
    iconD: 'dark:bg-violet-900/60 dark:text-violet-400 dark:ring-violet-900/80',
  },
};

export default function DashboardStatCard({ title, value, subtitle, icon, color = 'orange' }) {
  const s = styles[color] || styles.orange;

  return (
    <div className={`dashboard-stat-card rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow ${s.light} ${s.dark}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mt-1 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ring-4 ${s.iconL} ${s.iconD}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
