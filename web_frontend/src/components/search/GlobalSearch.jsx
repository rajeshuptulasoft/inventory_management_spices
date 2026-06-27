import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const search = async (val) => {
    setQ(val);
    if (val.length < 2) { setResults(null); return; }
    const { data } = await api.get(`/search?q=${encodeURIComponent(val)}`);
    setResults(data.data);
    setOpen(true);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <input
        value={q}
        onChange={(e) => search(e.target.value)}
        onFocus={() => q.length >= 2 && setOpen(true)}
        placeholder="Search products, SKU, barcode..."
        className="w-full px-4 py-2 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-orange-500/30
          border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-orange-300 focus:bg-white
          dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-orange-500/50 dark:focus:bg-slate-800"
      />
      {open && results && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 w-full z-40 rounded-xl border shadow-lg max-h-80 overflow-y-auto
            bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            {results.variants?.map((v) => (
              <button key={v.id} type="button" className="w-full text-left px-4 py-2.5 text-sm border-b border-slate-50 dark:border-slate-700
                text-slate-700 hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-orange-500/10" onClick={() => { navigate('/admin/variants'); setOpen(false); }}>
                {v.product?.product_name} — {v.size} ({v.sku})
              </button>
            ))}
            {results.products?.map((p) => (
              <button key={p.id} type="button" className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50
                dark:text-slate-200 dark:hover:bg-orange-500/10" onClick={() => { navigate('/admin/products'); setOpen(false); }}>
                📦 {p.product_name}
              </button>
            ))}
            {!results.variants?.length && !results.products?.length && (
              <p className="p-4 text-slate-500 text-sm">No results</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
