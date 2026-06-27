export default function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">{label}</label>}
      <select className="input-field w-full" {...props}>
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
