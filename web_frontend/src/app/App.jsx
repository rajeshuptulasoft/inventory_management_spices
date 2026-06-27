import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from '../routes/AppRoutes';
import { fetchProfile, setInitialized } from '../features/auth/authSlice';
import { initTheme } from '../features/theme/themeSlice';

export default function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((s) => s.auth);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchProfile());
    } else {
      dispatch(setInitialized());
    }
  }, [dispatch, token]);

  if (token && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin h-10 w-10 border-4 border-spice-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <AppRoutes />;
}
