import { useEffect, useState, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Filter, 
  Mail, Phone, Shield, Edit3, Trash2, 
  X, Check, User, ChevronRight, MoreVertical,
  Briefcase, Crown, UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import type { User as UserType } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    phone: '', 
    role: 'CLIENT' 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editUser) {
        const { password, ...rest } = form;
        await api.patch(`/api/users/${editUser.id}`, password ? form : rest);
        toast.success('User updated successfully!');
      } else {
        await api.post('/api/users', form);
        toast.success('User created successfully!');
      }
      setShowForm(false);
      setEditUser(null);
      setForm({ email: '', password: '', name: '', phone: '', role: 'CLIENT' });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleEdit = (user: UserType) => {
    setEditUser(user);
    setForm({ 
      email: user.email, 
      password: '', 
      name: user.name, 
      phone: user.phone || '', 
      role: user.role 
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently remove this user?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.success('User removed successfully!');
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to delete user.');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return Crown;
      case 'MECHANIC': return Briefcase;
      default: return UserCircle;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Page Header - Compact */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-violet-600 dark:bg-gold-500 p-3.5 rounded-[22px] text-white dark:text-violet-950 shadow-xl shadow-violet-500/10 dark:shadow-gold-500/20">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-violet-950 dark:text-white tracking-tight leading-none">Citizen Registry</h1>
            <p className="text-violet-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-[0.2em] mt-1.5">Access Management</p>
          </div>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditUser(null); }}
          className="flex items-center gap-2 bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <UserPlus size={16} /> Deploy User
        </button>
      </div>

      {/* Control Bar - Compact */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-300 dark:text-violet-400" size={18} />
          <input 
            type="text"
            placeholder="Search registry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-violet-800 border border-violet-100 dark:border-violet-700 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold text-violet-950 dark:text-white focus:ring-4 focus:ring-violet-500/5 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="md:w-64 relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-300 dark:text-violet-400" size={18} />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-white dark:bg-violet-800 border border-violet-100 dark:border-violet-700 rounded-2xl py-3.5 pl-12 pr-10 text-sm font-black text-violet-950 dark:text-white outline-none appearance-none cursor-pointer uppercase tracking-widest"
          >
            <option value="ALL">All Sectors</option>
            <option value="ADMIN">Command</option>
            <option value="MECHANIC">Specialists</option>
            <option value="CLIENT">Citizens</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-violet-300">
            <ChevronRight size={18} className="rotate-90" />
          </div>
        </div>
      </div>

      {/* Registry Table - Compact */}
      <div className="bg-white dark:bg-violet-800 rounded-[32px] shadow-xl overflow-hidden border border-violet-100 dark:border-violet-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-violet-50/10 dark:bg-white/5 border-b border-violet-100 dark:border-white/10">
                <th className="px-8 py-5 text-[9px] font-black text-violet-400 dark:text-gold-500/70 uppercase tracking-[0.2em]">Profile</th>
                <th className="px-8 py-5 text-[9px] font-black text-violet-400 dark:text-gold-500/70 uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-5 text-[9px] font-black text-violet-400 dark:text-gold-500/70 uppercase tracking-[0.2em]">Channel</th>
                <th className="px-8 py-5 text-[9px] font-black text-violet-400 dark:text-gold-500/70 uppercase tracking-[0.2em] text-right">Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100/30 dark:divide-white/5">
              {filteredUsers.map((u) => {
                const RoleIcon = getRoleIcon(u.role);
                return (
                  <tr key={u.id} className="hover:bg-violet-50/40 dark:hover:bg-white/5 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-400 dark:text-gold-500 border border-violet-100 dark:border-gold-500/10 group-hover:bg-violet-600 dark:group-hover:bg-gold-500 group-hover:text-white dark:group-hover:text-violet-950 transition-all">
                          <User size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-violet-950 dark:text-white tracking-tight">{u.name}</p>
                          <p className="text-[10px] font-bold text-violet-400 dark:text-violet-300/40 truncate max-w-[180px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <RoleIcon size={14} className="text-violet-300 dark:text-gold-500/40" />
                        <StatusBadge status={u.role} />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[11px] font-black text-violet-900 dark:text-white uppercase tracking-tighter tabular-nums opacity-60">
                        {u.phone || 'N/A'}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleEdit(u)}
                          className="p-2.5 rounded-xl bg-violet-50 dark:bg-white/5 text-violet-500 dark:text-violet-300 hover:bg-violet-600 dark:hover:bg-gold-500 hover:text-white dark:hover:text-violet-950 transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && !loading && (
            <div className="py-20 text-center flex flex-col items-center gap-6">
              <Search size={32} className="text-violet-200 dark:text-white/5" />
              <p className="text-violet-300 font-black uppercase tracking-[0.3em] text-[10px]">No matches in registry</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditUser(null); }}
        title={editUser ? 'Modify Identity' : 'Deploy Identity'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-2 text-violet-950 dark:text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest ml-3">Full Name</label>
              <input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
                className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:ring-4 focus:ring-violet-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest ml-3">Secure Email</label>
              <input 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                type="email" 
                required 
                className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:ring-4 focus:ring-violet-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest ml-3">Access Key</label>
              <input 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                type="password"
                minLength={editUser ? 0 : 6} 
                className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:ring-4 focus:ring-violet-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest ml-3">Phone Line</label>
              <input 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:ring-4 focus:ring-violet-500/5"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest ml-3">Registry Sector</label>
            <div className="flex gap-2">
              {['CLIENT', 'MECHANIC', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    form.role === r 
                      ? 'bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 border-transparent' 
                      : 'bg-violet-50 dark:bg-violet-950 border-violet-100 dark:border-violet-700 opacity-60'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => { setShowForm(false); setEditUser(null); }}
              className="px-6 py-4 border border-violet-100 dark:border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
            >
              Abort
            </button>
            <button 
              type="submit" 
              className="flex-1 px-8 py-4 bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              {editUser ? 'Modify Identity' : 'Confirm Deployment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}