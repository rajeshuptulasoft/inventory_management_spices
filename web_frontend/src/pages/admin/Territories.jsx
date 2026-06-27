import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

export default function Territories() {
  const [territories, setTerritories] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [stateId, setStateId] = useState('');
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = async () => {
    const [t, s] = await Promise.all([
      api.get('/fmcg/territories'),
      api.get('/fmcg/states'),
    ]);
    setTerritories(t.data.data || []);
    setStates(s.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const loadDistricts = async (sid) => {
    if (!sid) { setDistricts([]); return; }
    const { data } = await api.get(`/fmcg/districts?state_id=${sid}`);
    setDistricts(data.data || []);
  };

  const openCreate = () => {
    setEditId(null);
    reset({ name: '', code: '', district_id: '', status: 'active' });
    setStateId('');
    setDistricts([]);
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setValue('name', row.name);
    setValue('code', row.code || '');
    setValue('district_id', row.district_id || '');
    setValue('status', row.status || 'active');
    const sid = row.district?.state_id || row.district?.state?.id || '';
    setStateId(sid ? String(sid) : '');
    if (sid) loadDistricts(sid);
    setModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        district_id: data.district_id ? Number(data.district_id) : null,
      };
      if (editId) {
        await api.put(`/fmcg/territories/${editId}`, payload);
        toast.success('Territory updated');
      } else {
        await api.post('/fmcg/territories', payload);
        toast.success('Territory created');
      }
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this territory?')) return;
    try {
      await api.delete(`/fmcg/territories/${id}`);
      toast.success('Territory deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <MainLayout title="Territory Management">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
          <DashboardStatCard title="Territories" value={territories.length} icon="🗺️" color="orange" />
          <DashboardStatCard title="States" value={states.length} icon="📍" color="blue" />
          <DashboardStatCard title="Active" value={territories.filter((t) => t.status === 'active').length} icon="✅" color="green" />
        </div>
        <Button onClick={openCreate}>+ Add Territory</Button>
      </div>

      <DashboardPanel title="Territories">
        <Table>
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeader>Code</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>District</TableHeader>
              <TableHeader>State</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {territories.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.code || '—'}</TableCell>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.district?.name || '—'}</TableCell>
                <TableCell>{t.district?.state?.name || '—'}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="!py-1 !px-2 !text-xs" onClick={() => openEdit(t)}>Edit</Button>
                    <Button variant="danger" className="!py-1 !px-2 !text-xs" onClick={() => remove(t.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardPanel>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Territory' : 'Add Territory'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Territory name" {...register('name', { required: true })} />
          <Input label="Code" placeholder="MH-MUM-01" {...register('code')} />
          <Select
            label="State"
            value={stateId}
            onChange={(e) => {
              setStateId(e.target.value);
              setValue('district_id', '');
              loadDistricts(e.target.value);
            }}
          >
            <option value="">Select state</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Select label="District" {...register('district_id')}>
            <option value="">Select district</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Select label="Status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <div className="flex gap-3 justify-end mt-4">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
