export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg' : 'btn-secondary';
  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
