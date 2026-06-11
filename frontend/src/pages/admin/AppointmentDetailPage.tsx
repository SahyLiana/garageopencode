import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Car, Clock, Wrench, ShieldCheck,
  Package, ShoppingCart, Trash2, CheckCircle, 
  AlertCircle, XCircle, Send, MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import { useAppointmentStore } from '../../stores/appointmentStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import CommentSection from '../../components/CommentSection';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import type { User, Vehicle, InventoryItem, Appointment } from '../../types';
import toast from 'react-hot-toast';

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateStatus, updateAppointment } = useAppointmentStore();
  const { items: inventoryItems, fetchItems, assignItem, approveRequest, rejectRequest } = useInventoryStore();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [mechanics, setMechanics] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    clientId: 0,
    mechanicId: 0,
    vehicleId: 0,
    dateTime: '',
    category: 'OTHER',
    description: ''
  });
  
  const [assigningPart, setAssigningPart] = useState(false);
  const [assignForm, setAssignForm] = useState({ itemId: 0, quantity: 1 });
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    fetchAppointment();
    fetchItems();
    api.get('/api/users').then(({ data }) => {
      setMechanics(data.filter((u: User) => u.role === 'MECHANIC'));
      setClients(data.filter((u: User) => u.role === 'CLIENT'));
    });
    api.get('/api/vehicles').then(({ data }) => setVehicles(data));
  }, [id]);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/appointments/${id}`);
      setAppointment(data);
      setEditForm({
        clientId: data.clientId || 0,
        mechanicId: data.mechanicId || 0,
        vehicleId: data.vehicleId || 0,
        dateTime: data.dateTime ? new Date(data.dateTime).toISOString().slice(0, 16) : '',
        category: data.category || 'OTHER',
        description: data.description || ''
      });
    } catch (error) {
      toast.error('Failed to load appointment');
      navigate('/admin/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateStatus(+id!, status);
      fetchAppointment();
      toast.success('Status updated successfully!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAppointment(+id!, editForm);
      setIsEditing(false);
      fetchAppointment();
      toast.success('Appointment updated successfully!');
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const handleAssignPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.itemId) return;
    try {
      await assignItem(+id!, assignForm.itemId, assignForm.quantity);
      setAssigningPart(false);
      setAssignForm({ itemId: 0, quantity: 1 });
      fetchAppointment();
      toast.success('Part assigned successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign part');
    }
  };

  const handleCancelAppointment = async () => {
    try {
      await updateStatus(+id!, 'CANCELLED');
      setConfirmCancel(false);
      fetchAppointment();
      toast.success('Appointment cancelled successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="flex flex-col items-center justify-center py-32">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }} 
            className="text-violet-600 dark:text-gold-500 mb-8"
          >
            <Clock size={64} />
          </motion.div>
          <p className="text-violet-400 font-black uppercase tracking-[0.4em] text-sm animate-pulse">
            Loading appointment...
          </p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="text-center py-12">
          <p className="text-violet-950 dark:text-white text-xl font-bold">Appointment not found</p>
        </div>
      </div>
    );
  }

  const statuses = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/appointments')}
          className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-violet-600 dark:text-gold-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-violet-950 dark:text-white">
            Appointment #{appointment.id}
          </h1>
          <p className="text-violet-500 dark:text-gold-400 text-sm font-bold uppercase tracking-widest">
            {appointment.category}
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing && appointment.status !== 'COMPLETED' && appointment.paymentStatus !== 'PAID' && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-700 transition-colors"
            >
              Edit Appointment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Appointment Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-8 rounded-[32px] border border-violet-100 dark:border-violet-700 shadow-2xl"
          >
              <div className="flex items-center justify-between mb-6">
                <StatusBadge status={appointment.status} />
                <select 
                  value={appointment.status} 
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={['COMPLETED', 'CANCELLED'].includes(appointment.status)}
                  className={`text-[10px] font-black border border-violet-100 dark:border-violet-700 rounded-2xl py-3 px-6 bg-violet-50 dark:bg-violet-950 text-violet-950 dark:text-white focus:ring-0 outline-none uppercase tracking-widest appearance-none cursor-pointer
                    ${['COMPLETED', 'CANCELLED'].includes(appointment.status) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {statuses.map((s) => <option key={s} value={s} className="bg-white dark:bg-violet-800">{s}</option>)}
                </select>
              </div>

            <h2 className="text-2xl font-black text-violet-950 dark:text-white mb-4 flex items-center gap-3">
              <Car size={24} className="text-violet-600 dark:text-gold-400" />
              {appointment.vehicle?.make} {appointment.vehicle?.model}
              <span className="text-violet-400 dark:text-gold-400 font-mono text-sm ml-auto bg-violet-50 dark:bg-violet-950 px-4 py-1 rounded-xl">
                {appointment.vehicle?.licensePlate}
              </span>
            </h2>

            <div className="bg-violet-50/50 dark:bg-violet-950/40 p-6 rounded-3xl mb-6">
              <p className="text-violet-900 dark:text-white italic font-medium leading-relaxed">"{appointment.description}"</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-gold-400 font-bold">
                  {appointment.client?.name?.[0]}
                </div>
                <div>
                  <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">Client</p>
                  <p className="font-bold text-violet-950 dark:text-white">{appointment.client?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gold-500 text-violet-950 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest">Mechanic</p>
                  {isEditing ? (
                    <select 
                      value={editForm.mechanicId || ''} 
                      onChange={(e) => setEditForm({ ...editForm, mechanicId: +e.target.value })}
                      className="w-full bg-transparent border-none p-0 font-bold text-violet-600 dark:text-gold-500 text-sm focus:ring-0 cursor-pointer"
                    >
                      <option value="" className="bg-white dark:bg-violet-800">Assign Mechanic...</option>
                      {mechanics.map(m => (
                        <option key={m.id} value={m.id} className="bg-white dark:bg-violet-800">{m.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-bold text-violet-600 dark:text-gold-500">
                      {appointment.mechanic?.name || 'Not assigned'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm text-violet-600 dark:text-gold-400">
              <Clock size={16} />
              <span className="font-bold">
                {new Date(appointment.dateTime).toLocaleString(undefined, { 
                  dateStyle: 'full', 
                  timeStyle: 'short' 
                })}
              </span>
            </div>
          </motion.div>

          {/* Edit Form */}
          {isEditing && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSaveEdit}
              className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-8 rounded-[32px] border border-violet-100 dark:border-violet-700 shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-black text-violet-950 dark:text-white mb-4">Edit Appointment</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-2 block">Client</label>
                  <select 
                    value={editForm.clientId} 
                    onChange={(e) => setEditForm({ ...editForm, clientId: +e.target.value })}
                    className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-2xl px-6 py-3 focus:ring-4 focus:ring-violet-500/10 outline-none font-bold text-violet-950 dark:text-white"
                  >
                    <option value={0}>Select Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-2 block">Vehicle</label>
                  <select 
                    value={editForm.vehicleId} 
                    onChange={(e) => setEditForm({ ...editForm, vehicleId: +e.target.value })}
                    className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-2xl px-6 py-3 focus:ring-4 focus:ring-violet-500/10 outline-none font-bold text-violet-950 dark:text-white"
                  >
                    <option value={0}>Select Vehicle...</option>
                    {vehicles.filter(v => !editForm.clientId || v.clientId === editForm.clientId).map(v => (
                      <option key={v.id} value={v.id}>{v.licensePlate} - {v.make} {v.model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-2 block">Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-2xl px-6 py-3 focus:ring-4 focus:ring-violet-500/10 outline-none font-bold text-violet-950 dark:text-white h-32 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-2 block">Category</label>
                  <select 
                    value={editForm.category} 
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-2xl px-6 py-3 focus:ring-4 focus:ring-violet-500/10 outline-none font-bold text-violet-950 dark:text-white"
                  >
                    <option value="ENGINE">Engine</option>
                    <option value="TRANSMISSION">Transmission</option>
                    <option value="SUSPENSION">Suspension</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="BODY">Body</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4 mb-2 block">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={editForm.dateTime} 
                    onChange={(e) => setEditForm({ ...editForm, dateTime: e.target.value })}
                    className="w-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-700 rounded-2xl px-6 py-3 focus:ring-4 focus:ring-violet-500/10 outline-none font-bold text-violet-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 border border-violet-100 dark:border-violet-700 rounded-2xl font-black text-xs uppercase tracking-widest text-violet-600 dark:text-gold-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.form>
          )}

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-8 rounded-[32px] border border-violet-100 dark:border-violet-700 shadow-2xl"
          >
            <CommentSection appointmentId={appointment.id} />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Assigned Parts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-violet-800 backdrop-blur-2xl p-8 rounded-[32px] border border-violet-100 dark:border-violet-700 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-violet-950 dark:text-white flex items-center gap-2">
                <Package size={20} className="text-violet-600 dark:text-gold-400" />
                Parts
              </h3>
              {appointment.mechanicId && appointment.status !== 'COMPLETED' && appointment.paymentStatus !== 'PAID' && (
                <button
                  onClick={() => setAssigningPart(true)}
                  className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                >
                  <Plus size={16} className="text-violet-600 dark:text-gold-400" />
                </button>
              )}
            </div>

            {(appointment.status === 'COMPLETED' || appointment.paymentStatus === 'PAID') && (
              <p className="text-[10px] text-violet-400 dark:text-white/40 italic font-bold text-center py-4 border border-dashed border-violet-200 dark:border-violet-700 rounded-2xl">
                Parts management disabled for completed/paid appointments
              </p>
            )}

            <div className="space-y-3">
              {appointment.usedParts && appointment.usedParts.length > 0 ? (
                appointment.usedParts.map((up) => (
                  <div key={up.id} className="bg-violet-50 dark:bg-violet-950/40 p-4 rounded-2xl border border-violet-100 dark:border-violet-700/50">
                    <div className="flex items-center gap-3">
                      <Package size={16} className={
                        up.status === 'APPROVED' ? 'text-green-500' :
                        up.status === 'REQUESTED' ? 'text-amber-500' : 'text-red-500'
                      } />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-violet-950 dark:text-white">{up.item.name}</p>
                        <p className="text-[10px] text-violet-500 dark:text-gold-400 uppercase">Qty: {up.quantity} • ${up.item.price.toFixed(2)}/ea</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                        up.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        up.status === 'REQUESTED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {up.status}
                      </span>
                    </div>
                    {up.status === 'REQUESTED' && appointment.status !== 'COMPLETED' && appointment.paymentStatus !== 'PAID' && (
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={async () => {
                            await approveRequest(up.id);
                            toast.success('Part request approved');
                            fetchAppointment();
                          }}
                          className="flex-1 bg-green-500 text-white text-[9px] px-3 py-2 rounded font-black uppercase tracking-widest hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={async () => {
                            await rejectRequest(up.id);
                            toast.success('Part request rejected');
                            fetchAppointment();
                          }}
                          className="flex-1 bg-red-500 text-white text-[9px] px-3 py-2 rounded font-black uppercase tracking-widest hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-violet-400 dark:text-white/40 italic font-bold text-center py-4">
                  {appointment.mechanicId ? 'No parts requested yet' : 'No parts assigned yet'}
                </p>
              )}
            </div>
          </motion.div>

          {/* Cancel Button */}
          {!['COMPLETED', 'CANCELLED'].includes(appointment.status) && appointment.paymentStatus !== 'PAID' && (
            <button
              onClick={() => setConfirmCancel(true)}
              className="w-full flex items-center justify-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
            >
              <XCircle size={18} />
              Cancel Appointment
            </button>
          )}
        </div>
      </div>

      {/* Assign Part Modal */}
      <Modal
        isOpen={assigningPart}
        onClose={() => {
          setAssigningPart(false);
          setAssignForm({ itemId: 0, quantity: 1 });
        }}
        title="Assign Part to Appointment"
      >
        <form onSubmit={handleAssignPart} className="space-y-6 p-4">
          <div>
            <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest ml-4 mb-2 block">
              Select Part
            </label>
            <select 
              value={assignForm.itemId} 
              onChange={(e) => setAssignForm({ ...assignForm, itemId: +e.target.value })}
              required
              className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-6 py-3 outline-none font-bold text-violet-950 dark:text-white"
            >
              <option value={0}>Choose a part...</option>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id} disabled={item.quantity === 0}>
                  {item.name} (${item.price.toFixed(2)}) - Stock: {item.quantity}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest ml-4 mb-2 block">
              Quantity
            </label>
            <input 
              type="number" 
              min={1} 
              value={assignForm.quantity}
              onChange={(e) => setAssignForm({ ...assignForm, quantity: Math.max(1, +e.target.value) })}
              className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-6 py-3 outline-none font-bold text-violet-950 dark:text-white"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setAssigningPart(false);
                setAssignForm({ itemId: 0, quantity: 1 });
              }}
              className="flex-1 py-3 border border-violet-100 dark:border-violet-700 rounded-2xl font-black text-xs uppercase tracking-widest text-violet-600 dark:text-gold-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-700"
            >
              Assign Part
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel Appointment?"
      >
        <div className="text-center p-4">
          <div className="bg-red-500/10 w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-red-500">
            <AlertCircle size={48} />
          </div>
          <h3 className="text-2xl font-black text-violet-950 dark:text-white mb-4">Confirm Cancellation?</h3>
          <p className="text-violet-600 dark:text-white/60 mb-10 font-bold">
            This will mark the appointment as CANCELLED. This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setConfirmCancel(false)}
              className="flex-1 py-4 border border-violet-100 dark:border-violet-700 rounded-2xl font-black text-xs uppercase tracking-widest text-violet-600 dark:text-gold-400"
            >
              Keep Appointment
            </button>
            <button 
              onClick={handleCancelAppointment}
              className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700"
            >
              Cancel Appointment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
