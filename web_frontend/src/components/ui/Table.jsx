export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl ${className}`}>
      <table className="erp-table w-full text-sm text-left border-collapse">{children}</table>
    </div>
  );
}

export function TableHead({ children }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={`border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04] ${className}`}>
      {children}
    </tr>
  );
}

export function TableHeader({ children }) {
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-4 py-3.5 text-slate-700 dark:text-slate-200 font-normal ${className}`}>
      {children}
    </td>
  );
}

export default function DataTable({ columns, data, loading, emptyMessage = 'No data found' }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data?.length) {
    return <p className="text-center text-slate-500 py-8 text-sm">{emptyMessage}</p>;
  }

  return (
    <Table>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => (
            <TableHeader key={col.key}>{col.label}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={row.id || i}>
            {columns.map((col) => (
              <TableCell key={col.key}>
                {col.render ? col.render(row) : row[col.key] ?? '—'}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
