import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { login, clearError } from '../../features/auth/authSlice';
import { roleHomePath } from '../../utils/roles';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: 'admin@spiceerp.com', password: 'Admin@123' },
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    const role = user?.role?.role_name;
    if (role) navigate(roleHomePath(role), { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!');
      const role = result.payload?.role?.role_name;
      if (role) navigate(roleHomePath(role), { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4
      bg-gradient-to-br from-orange-50 via-white to-amber-50
      dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="modal-panel w-full max-w-md !p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/40 mb-4">🌶️</div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Spice ERP</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Inventory Management System</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <p className="text-xs text-slate-500 mt-6 text-center">
          Demo: admin@spiceerp.com / Admin@123
        </p>
      </div>
    </div>
  );
}
