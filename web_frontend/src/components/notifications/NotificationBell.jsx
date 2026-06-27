import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchNotifications, markNotificationRead, markAllRead, setOpen, togglePanel,
} from '../../features/notifications/notificationSlice';

const typeIcons = {
  low_stock: '📦',
  expiry: '⏰',
  payment_due: '💰',
  pending_order: '📋',
  production: '🏭',
  system: '🔔',
};

export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, unreadCount, open, loading } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleClick = (n) => {
    dispatch(markNotificationRead(n.id));
    if (n.link) navigate(n.link);
    dispatch(setOpen(false));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => dispatch(togglePanel())}
        className="relative p-2 rounded-lg border shadow-sm transition
          border-slate-200 bg-white hover:bg-slate-50
          dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-orange-500 text-white rounded-full px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => dispatch(setOpen(false))} />
          <div className="absolute right-0 mt-2 w-96 max-h-[70vh] overflow-hidden z-50 rounded-2xl border shadow-xl
            bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button type="button" onClick={() => dispatch(markAllRead())} className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium">
                  Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {loading && <p className="p-4 text-slate-500 text-sm">Loading...</p>}
              {!loading && items.length === 0 && (
                <p className="p-6 text-center text-slate-500 text-sm">No notifications</p>
              )}
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`w-full text-left p-4 border-b border-slate-50 dark:border-slate-700/50 transition
                    hover:bg-orange-50 dark:hover:bg-orange-500/10 ${!n.is_read ? 'bg-orange-50/80 dark:bg-orange-500/10' : ''}`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl">{typeIcons[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${!n.is_read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
