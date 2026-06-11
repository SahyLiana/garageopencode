import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Plus, User as UserIcon, Car, Clock, 
  CheckCircle, AlertCircle, XCircle, ChevronRight,
  ShieldCheck, Wrench, Package, ShoppingCart, Search
} from 'lucide-react';
import api from '../../services/api';
import { useAppointmentStore } from '../../stores/appointmentStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import CommentSection from '../../components/CommentSection';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import type { User, Vehicle, InventoryItem } from '../../types';
import toast from 'react-hot-toast';

export default function AppointmentManagementPage() {
  const { 
    appointments, loading, fetchAppointments, 
    createAppointment, updateStatus, updateAppointment 
  } = useAppointmentStore();
  
  const { items: inventoryItems, fetchItems, assignItem, approveRequest, rejectRequest } = useInventoryStore();
  
  const [mechanics, setMechanics] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null);
  const [assigningTo, setAssigningTo] = useState<number | null>(null);
  const [assignForm, setAssignForm] = useState({ itemId: 0, quantity: 1 });
  const [form, setForm] = useState({ 
    clientId: 0, 
    mechanicId: 0, 
    vehicleId: 0, 
    dateTime: '', 
    category: 'OTHER', 
    description: '' 
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAppointments();
    fetchItems();
    api.get('/api/users').then(({ data }) => {
      setMechanics(data.filter((u: User) => u.role === 'MECHANIC'));
      setClients(data.filter((u: User) => u.role === 'CLIENT'));
    });
    api.get('/api/vehicles').then(({ data }) => setVehicles(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment({
        ...form,
        mechanicId: form.mechanicId || undefined
      });
      setShowForm(false);
      setForm({ clientId: 0, mechanicId: 0, vehicleId: 0, dateTime: '', category: 'OTHER', description: '' });
      fetchAppointments();
      toast.success('Appointment created successfully!');
    } catch (error) {
      toast.error('Failed to create appointment.');
    }
  };

  const handleAssignMechanic = async (apptId: number, mechanicId: number) => {
    try {
      await updateAppointment(apptId, { mechanicId });
      fetchAppointments();
      toast.success('Mechanic assigned successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign mechanic');
    }
  };

  const handleAssignPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTo || !assignForm.itemId) return;
    try {
      await assignItem(assigningTo, assignForm.itemId, assignForm.quantity);
      setAssigningTo(null);
      setAssignForm({ itemId: 0, quantity: 1 });
      fetchAppointments();
      toast.success('Part assigned successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleCancel = async () => {
    if (!confirmCancel) return;
    try {
      await updateStatus(confirmCancel, 'CANCELLED');
      setConfirmCancel(null);
      fetchAppointments();
      toast.success('Appointment cancelled successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const statuses = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const clientName = a.client?.name?.toLowerCase() || '';
        const vehicleInfo = `${a.vehicle?.make || ''} ${a.vehicle?.model || ''} ${a.vehicle?.licensePlate || ''}`.toLowerCase();
        const mechanicName = a.mechanic?.name?.toLowerCase() || '';
        return clientName.includes(search) || vehicleInfo.includes(search) || mechanicName.includes(search);
      }
      return true;
    });
  }, [appointments, statusFilter, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="bg-violet-600 dark:bg-gold-500 p-5 rounded-[32px] text-white dark:text-violet-950 shadow-2xl shadow-violet-500/20 dark:shadow-gold-500/30 transition-transform hover:scale-110 duration-500">
            <ClipboardList size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-violet-950 dark:text-white tracking-tight">Workshop Control</h1>
            <div className="mt-2 bg-violet-50 dark:bg-violet-800 px-4 py-2 rounded-2xl border border-violet-100 dark:border-violet-700 inline-block shadow-inner">
              <p className="text-violet-500 dark:text-white font-bold text-sm tracking-wide uppercase tracking-[0.2em]">Operations Registry</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`flex items-center gap-3 px-10 py-5 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl
            ${showForm 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 hover:scale-105 active:scale-95 shadow-violet-500/30 dark:shadow-gold-500/40'}
          `}
        >
          {showForm ? <XCircle size={20} /> : <Plus size={20} />}
          {showForm ? 'Abort Registration' : 'New Service Unit'}
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40" size={20} />
          <input 
            type="text" 
            placeholder="Search by client, vehicle, or mechanic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-violet-900/40 border border-violet-100 dark:border-violet-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-violet-500/10 outline-none transition-all text-violet-950 dark:text-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
              ${statusFilter === 'ALL' 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' 
                : 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-gold-400 hover:bg-violet-100 dark:hover:bg-violet-900/50'
              }`}
          >
            All
          </button>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                ${statusFilter === s 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' 
                  : 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-gold-400 hover:bg-violet-100 dark:hover:bg-violet-900/50'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden mb-16"
          >
            <form onSubmit={handleSubmit} className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-12 rounded-[60px] shadow-2xl border border-violet-100 dark:border-violet-700 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-3 block">Primary Client</label>
                  <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: +e.target.value })} required className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-3xl px-8 py-5 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-bold text-violet-950 dark:text-white">
                    <option value={0}>Select Client Registry...</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-3 block">Associated Asset</label>
                  <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: +e.target.value })} required className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-3xl px-8 py-5 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-bold text-violet-950 dark:text-white">
                    <option value={0}>Identify Vehicle Asset...</option>
                    {vehicles.filter(v => !form.clientId || v.clientId === form.clientId).map((v) => (
                      <option key={v.id} value={v.id}>{v.licensePlate} • {v.make} {v.model}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-3 block">Service Sector</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-3xl px-8 py-5 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-bold text-violet-950 dark:text-white">
                      <option value="ENGINE">Propulsion / Engine</option>
                      <option value="TRANSMISSION">Drivetrain / Trans</option>
                      <option value="SUSPENSION">Chassis / Suspension</option>
                      <option value="ELECTRICAL">Core Electrical</option>
                      <option value="BODY">Exterior / Body</option>
                      <option value="OTHER">Other Specialized</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-3 block">Assigned Expert</label>
                    <select value={form.mechanicId} onChange={(e) => setForm({ ...form, mechanicId: +e.target.value })} className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-3xl px-8 py-5 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-bold text-violet-950 dark:text-white">
                      <option value={0}>Await Assignment...</option>
                      {mechanics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-3 block">Service Narrative</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-3xl px-8 py-5 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-bold text-violet-950 dark:text-white h-40 resize-none" placeholder="Enter technical requirements or client notes..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-3 block">Scheduled Precision Date</label>
                  <input value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} type="datetime-local" required className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-3xl px-8 py-5 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-bold text-violet-950 dark:text-white" />
                </div>
              </div>
              <button type="submit" className="lg:col-span-2 bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-violet-500/20 dark:shadow-gold-500/40">
                Execute Service Deployment
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-violet-600 dark:text-gold-500 mb-8">
            <Clock size={64} />
          </motion.div>
          <p className="text-violet-400 font-black uppercase tracking-[0.4em] text-sm animate-pulse">Syncing Workshop Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-violet-400 dark:text-white/60 font-bold text-lg">
                  No appointments found matching your search/filter
                </p>
              </div>
            ) : (
              filteredAppointments.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  className={`bg-white dark:bg-violet-800 backdrop-blur-3xl rounded-[60px] shadow-2xl border-l-[12px] p-12 transition-all hover:translate-x-2 duration-500 ${!a.mechanicId ? 'border-gold-500 shadow-gold-500/10' : 'border-violet-600 dark:border-violet-400'}`}
                >
                  <div className="flex flex-col xl:flex-row gap-12">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-6 mb-8">
                      <span className="text-[10px] font-black bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-gold-500 px-6 py-2 rounded-full tracking-widest uppercase border border-violet-100 dark:border-gold-500/20 shadow-sm">
                        {a.category}
                      </span>
                      <div className="flex items-center gap-3 text-xs font-black text-violet-400 dark:text-violet-300 uppercase tracking-widest">
                          <Clock size={18} className="text-gold-500" />
                          {new Date(a.dateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                      
                      <h3 className="text-3xl font-black text-violet-950 dark:text-white mb-8 flex items-center gap-5">
                        <div className="p-3 bg-violet-50 dark:bg-white/5 rounded-2xl text-violet-600 dark:text-gold-500">
                          <Car size={32} />
                        </div>
                        {a.vehicle?.make} {a.vehicle?.model}
                        <span className="text-violet-400 dark:text-gold-500 font-mono text-lg ml-auto bg-violet-50 dark:bg-violet-950 px-6 py-1 rounded-2xl border border-violet-100 dark:border-gold-500/20">{a.vehicle?.licensePlate}</span>
                      </h3>

                      <div className="bg-violet-50/50 dark:bg-violet-950/40 p-8 rounded-[40px] border border-violet-100 dark:border-violet-700 mb-10 relative overflow-hidden group">
                        <p className="text-violet-900 dark:text-white text-lg italic font-bold leading-relaxed relative z-10">"{a.description}"</p>
                      </div>

                      {/* Assigned Parts Section */}
                      <div className="mb-10">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em]">Assigned Inventory</h4>
                        </div>
                        <div className="flex flex-col gap-4">
                          {a.usedParts && a.usedParts.length > 0 ? a.usedParts.map((up) => (
                            <div key={up.id} className="bg-white dark:bg-violet-900/40 border border-violet-100 dark:border-gold-500/20 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
                              <Package size={16} className={
                                up.status === 'APPROVED' ? 'text-green-500' :
                                up.status === 'REQUESTED' ? 'text-amber-500' : 'text-red-500'
                              } />
                              <div className="flex-1">
                                <p className="text-xs font-black text-violet-950 dark:text-white">{up.item.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-[10px] font-bold text-violet-400 dark:text-gold-500/60 uppercase">Qty: {up.quantity} • ${up.item.price.toFixed(2)}/ea</p>
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                    up.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    up.status === 'REQUESTED' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {up.status}
                                  </span>
                                </div>
                              </div>
                              
                              {up.status === 'REQUESTED' && a.status !== 'COMPLETED' && a.paymentStatus !== 'PAID' && (
                                <div className="flex items-center gap-2">
                                  <button onClick={async () => {
                                    try {
                                      await approveRequest(up.id);
                                      toast.success('Tool request approved');
                                      fetchAppointments();
                                    } catch (e: any) {
                                      toast.error(e.response?.data?.message || 'Failed to approve request');
                                    }
                                  }} className="bg-green-500 text-white text-[9px] px-3 py-2 rounded font-black uppercase tracking-widest hover:bg-green-600 transition-colors">Approve</button>
                                  <button onClick={async () => {
                                    try {
                                      await rejectRequest(up.id);
                                      toast.success('Tool request rejected');
                                      fetchAppointments();
                                    } catch (e: any) {
                                      toast.error(e.response?.data?.message || 'Failed to reject request');
                                    }
                                  }} className="bg-red-500 text-white text-[9px] px-3 py-2 rounded font-black uppercase tracking-widest hover:bg-red-600 transition-colors">Reject</button>
                                </div>
                              )}
                            </div>
                          )) : (
                            <p className="text-[10px] font-bold text-violet-300 dark:text-white/20 italic uppercase tracking-widest">No assets assigned to this unit</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-[24px] bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20">
                            <UserIcon size={28} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] mb-1">Asset Owner</p>
                            <p className="font-black text-violet-950 dark:text-white text-lg">{a.client?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-[24px] bg-gold-500 text-violet-950 flex items-center justify-center shadow-lg shadow-gold-500/20">
                            <ShieldCheck size={28} />
                          </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] mb-1">Assigned Expert</p>
                        {a.status === 'COMPLETED' || a.paymentStatus === 'PAID' ? (
                          <p className="font-black text-violet-600 dark:text-gold-500 text-lg">{a.mechanic?.name || 'Not assigned'}</p>
                        ) : (
                          <select 
                            value={a.mechanicId || ""}
                            onChange={(e) => handleAssignMechanic(a.id, +e.target.value)}
                            className="w-full bg-transparent border-none p-0 font-black text-violet-600 dark:text-gold-500 text-lg focus:ring-0 cursor-pointer hover:underline appearance-none"
                          >
                            <option value="" className="bg-white dark:bg-violet-800">Choose Specialist...</option>
                            {mechanics.map(m => (
                              <option key={m.id} value={m.id} className="bg-white dark:bg-violet-800">
                                {m.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                        </div>
                      </div>
                    </div>
                  
                    {/* Sidebar */}
                    <div className="xl:w-64 flex flex-col justify-between items-end gap-8 border-l border-violet-100 dark:border-violet-700 xl:pl-12">
                      <div className="space-y-8 w-full">
                        <div className="flex flex-col items-end gap-4">
                          <StatusBadge status={a.status} />
                          <div className="w-full relative">
                            <select 
                              value={a.status} 
                              onChange={(e) => { updateStatus(a.id, e.target.value); fetchAppointments(); }} 
                              disabled={['COMPLETED', 'CANCELLED'].includes(a.status)}
                              className={`w-full text-[10px] font-black border border-violet-100 dark:border-violet-700 rounded-2xl py-4 px-6 bg-violet-50 dark:bg-violet-950 text-violet-950 dark:text-white focus:bg-white transition-all shadow-sm uppercase tracking-widest appearance-none cursor-pointer
                                ${['COMPLETED', 'CANCELLED'].includes(a.status) ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                            >
                              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          {a.paymentStatus === 'PAID' && (
                            <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-xl border border-green-500/20">
                              <CheckCircle size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Settled</span>
                            </div>
                          )}
                        </div>
                       
                        {a.mechanicId && a.status !== 'COMPLETED' && a.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => setAssigningTo(a.id)}
                            className="w-full flex items-center justify-center gap-3 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-gold-400 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors border border-violet-100 dark:border-violet-700"
                          >
                            <Package size={16} />
                            Assign Part
                          </button>
                        )}
                      </div>

                      <div className="w-full">
                        {a.status === 'CANCEL_REQUESTED' && !['COMPLETED', 'CANCELLED'].includes(a.status) && a.paymentStatus !== 'PAID' && (
                          <button 
                            onClick={() => setConfirmCancel(a.id)}
                            className="w-full flex items-center justify-center gap-3 bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-2xl shadow-red-600/20 active:scale-95"
                          >
                            <XCircle size={18} />
                            Approve Termination
                          </button>
                        )}
                      </div>

                      <div className="hidden xl:block">
                        <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-200 dark:text-violet-700">
                          <ChevronRight size={48} />
                        </div>
                      </div>
                    </div>
                  </div>
                
                  <div className="mt-12 pt-12 border-t border-violet-100 dark:border-violet-700">
                    <CommentSection appointmentId={a.id} />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Part Assignment Modal */}
      <Modal
        isOpen={!!assigningTo}
        onClose={() => {
          setAssigningTo(null);
          setAssignForm({ itemId: 0, quantity: 1 });
        }}
        title="Assign Workshop Asset"
      >
        <form onSubmit={handleAssignPart} className="space-y-8 p-4 text-violet-950 dark:text-white">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest ml-4">Select Part from Inventory</label>
            <select 
              value={assignForm.itemId} 
              onChange={(e) => setAssignForm({ ...assignForm, itemId: +e.target.value })}
              required
              className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-3xl px-8 py-5 outline-none font-bold text-lg"
            >
              <option value={0}>Choose an item...</option>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id} disabled={item.quantity === 0}>
                  {item.name} (${item.price.toFixed(2)}) — Stock: {item.quantity}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest ml-4">Quantity to Assign</label>
            <div className="flex items-center gap-6">
              <input 
                type="number" 
                min={1} 
                value={assignForm.quantity}
                onChange={(e) => setAssignForm({ ...assignForm, quantity: +e.target.value })}
                className="flex-1 bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-3xl px-8 py-5 outline-none font-bold text-2xl tabular-nums"
              />
              <div className="p-6 bg-violet-600 dark:bg-gold-500 rounded-3xl text-white dark:text-violet-950 shadow-xl">
                <ShoppingCart size={32} />
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => {
              setAssigningTo(null);
              setAssignForm({ itemId: 0, quantity: 1 });
            }} className="flex-1 py-5 border border-violet-100 dark:border-white/10 rounded-3xl font-black text-xs uppercase tracking-widest text-violet-400 hover:text-violet-950 dark:hover:text-white transition-all">Cancel</button>
            <button type="submit" className="flex-2 px-12 py-5 bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-violet-600/20 dark:shadow-gold-500/40 hover:scale-[1.02] active:scale-95 transition-all">
              Commit Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        title="Approve Termination?"
      >
        <div className="text-center p-4">
          <div className="bg-red-500/10 w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-red-500 shadow-2xl border border-red-500/20">
            <AlertCircle size={48} />
          </div>
          <h3 className="text-2xl font-black text-violet-950 dark:text-white mb-4 tracking-tight">Confirm Termination?</h3>
          <p className="text-violet-600 dark:text-white/60 mb-10 font-bold">
            This will mark the appointment as CANCELLED. This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setConfirmCancel(null)}
              className="flex-1 py-4 border border-violet-100 dark:border-violet-700 rounded-2xl font-black text-xs uppercase tracking-widest text-violet-600 dark:text-gold-400"
            >
              Wait, No
            </button>
            <button 
              onClick={handleCancel}
              className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
            >
              Approve
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
