import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { canAccess, roleHomePath } from '../utils/roles';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, initialized } = useSelector((s) => s.auth);
  const token = localStorage.getItem('accessToken');

  if (!initialized || (token && loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-spice-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!token || !user) return <Navigate to="/login" replace />;

  const role = user.role?.role_name;
  if (roles && !canAccess(role, roles)) {
    return <Navigate to={roleHomePath(role)} replace />;
  }

  return children;
}
