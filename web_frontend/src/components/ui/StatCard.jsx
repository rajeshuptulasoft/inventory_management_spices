export default function StatCard({ title, value, subtitle, icon, color = 'spice' }) {
  const colors = {
    spice: 'bg-spice-100 text-spice-700 dark:bg-spice-900/30 dark:text-spice-400',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
  };
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>}
      </div>
    </div>
  );
}
