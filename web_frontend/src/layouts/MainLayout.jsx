import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from '../components/notifications/NotificationBell';
import GlobalSearch from '../components/search/GlobalSearch';
import { logout } from '../features/auth/authSlice';
import { toggleTheme, initTheme } from '../features/theme/themeSlice';
import Button from '../components/ui/Button';

export default function MainLayout({ children, title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const theme = useSelector((s) => s.theme.mode);

  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="app-header sticky top-0 z-20 px-4 md:px-6 py-3 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold shrink-0">{title}</h2>
          <GlobalSearch />
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <NotificationBell />
            <button
              type="button"
              onClick={() => dispatch(toggleTheme())}
              className="theme-toggle-btn p-2 rounded-lg border text-lg transition"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <span className="hidden sm:inline text-sm font-medium px-1 text-slate-600 dark:text-slate-300">{user?.name}</span>
            <Button variant="secondary" onClick={handleLogout} className="!py-1.5 !text-sm">Logout</Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto app-main">{children}</main>
      </div>
    </div>
  );
}
