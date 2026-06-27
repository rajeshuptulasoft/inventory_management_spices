export default function DashboardPanel({ title, subtitle, children, className = '', action }) {
  return (
    <div className={`dashboard-panel rounded-2xl border shadow-sm bg-white border-slate-200/90 dark:bg-slate-800/90 dark:border-slate-700 ${className}`}>
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
