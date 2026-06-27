import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getNavLinks } from '../utils/roles';

export default function Sidebar() {
  const role = useSelector((s) => s.auth.user?.role?.role_name);
  const links = getNavLinks(role);

  return (
    <aside className="app-sidebar w-64 min-h-screen flex flex-col shrink-0 hidden md:flex">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl text-white shadow-md shadow-orange-200 dark:shadow-orange-900/30">
            🌶️
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">Spice ERP</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 capitalize">{role?.replace('_', ' ')} portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center">
        Spice ERP v3 FMCG
      </div>
    </aside>
  );
}
