import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DataTable from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = async () => {
    setLoading(true);
    const [u, r] = await Promise.all([
      api.get('/users?limit=200'),
      api.get('/users/roles/list'),
    ]);
    setUsers(u.data.data || []);
    setRoles(r.data.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    reset({ name: '', email: '', password: '', phone: '', role_id: '', status: 'active' });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setValue('name', row.name);
    setValue('email', row.email);
    setValue('phone', row.phone || '');
    setValue('role_id', row.role_id || row.role?.id || '');
    setValue('status', row.status || 'active');
    setValue('password', '');
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editId) {
        const payload = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          role_id: Number(data.role_id),
          status: data.status,
        };
        if (data.password) payload.password = data.password;
        await api.put(`/users/${editId}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/auth/register', {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          role_id: Number(data.role_id),
        });
        toast.success('User created');
      }
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deactivated');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  return (
    <MainLayout title="User Management">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>+ Add User</Button>
      </div>

      <div className="card">
        <DataTable
          loading={loading}
          data={users}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role', render: (r) => r.role?.role_name || '—' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(r)} className="text-orange-600 text-sm font-medium">Edit</button>
                  {r.status === 'active' && (
                    <button type="button" onClick={() => deactivate(r.id)} className="text-red-600 text-sm font-medium">Deactivate</button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" {...register('name', { required: true })} />
          <Input label="Email" type="email" {...register('email', { required: true })} disabled={!!editId} />
          <Input label={editId ? 'New password (optional)' : 'Password'} type="password" {...register('password', { required: !editId, minLength: 6 })} />
          <Input label="Phone" {...register('phone')} />
          <Select label="Role" {...register('role_id', { required: true })}>
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.role_name}</option>
            ))}
          </Select>
          {editId && (
            <Select label="Status" {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          )}
          <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
        </form>
      </Modal>
    </MainLayout>
  );
}
