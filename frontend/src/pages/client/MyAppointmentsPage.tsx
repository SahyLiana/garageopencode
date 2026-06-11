import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Car, ChevronRight, 
  Plus, AlertCircle, CheckCircle, XCircle, 
  CreditCard, Package, Receipt, ArrowRight,
  Camera, Upload, X, ImageIcon,
} from 'lucide-react';
import { useAppointmentStore } from '../../stores/appointmentStore';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import CommentSection from '../../components/CommentSection';
import StatusBadge from '../../components/StatusBadge';

export default function MyAppointmentsPage() {
  const { appointments, loading, fetchAppointments, updateStatus, payAppointment } = useAppointmentStore();
  const { user } = useAuthStore();
  const [paying, setPaying] = useState<number | null>(null);
  const [successPay, setSuccessPay] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort appointments: most recent first
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, apptId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadingId(apptId);
  };

  const handleUploadCommit = async (apptId: number) => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      await api.patch(`/api/appointments/${apptId}/image`, formData);
      await fetchAppointments();
      handleCancelPreview();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    setUploadingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePay = async (apptId: number) => {
    setPaying(apptId);
    // Mock Stripe Delay
    setTimeout(async () => {
      try {
        await payAppointment(apptId);
        setSuccessPay(true);
        setTimeout(() => setSuccessPay(false), 3000);
      } catch (err) {
        alert('Payment failed');
      } finally {
        setPaying(null);
      }
    }, 2000);
  };

  const handleRequestCancel = async (id: number) => {
    if (confirm('Request cancellation for this appointment?')) {
      await updateStatus(id, 'CANCEL_REQUESTED');
      fetchAppointments();
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="bg-violet-600 dark:bg-gold-500 p-4 rounded-3xl text-white dark:text-violet-950 shadow-xl shadow-violet-500/20 dark:shadow-gold-500/30">
            <Calendar size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-violet-950 dark:text-white tracking-tight">Service Itinerary</h1>
            <p className="text-violet-400 dark:text-white/40 font-bold text-[10px] uppercase tracking-[0.2em] mt-1.5">Your Royal Garage Schedule</p>
          </div>
        </div>
        <Link 
          to="/client/book" 
          className="flex items-center gap-3 bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} /> Schedule Unit
        </Link>
      </div>

      <AnimatePresence>
        {successPay && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 bg-green-500 text-white p-6 rounded-3xl flex items-center gap-4 shadow-xl shadow-green-500/20"
          >
            <CheckCircle size={24} />
            <p className="font-black uppercase tracking-widest text-xs">Payment Confirmed. Your records have been updated.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-32 flex flex-col items-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-violet-600 dark:text-gold-500 mb-6">
            <Clock size={48} />
          </motion.div>
          <p className="text-violet-400 font-bold uppercase tracking-widest text-[10px]">Loading Schedule...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {sortedAppointments.map((a) => (
            <motion.div
              key={a.id}
              layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-violet-800 backdrop-blur-3xl rounded-[48px] shadow-2xl border border-violet-100 dark:border-violet-700 p-10 overflow-hidden relative"
              >
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-8">
                      <StatusBadge status={a.status} />
                      <div className="flex items-center gap-2 text-[10px] font-black text-violet-400 dark:text-violet-300 uppercase tracking-widest">
                        <Clock size={14} className="text-gold-500" />
                        {new Date(a.dateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-violet-950 dark:text-white mb-6 flex items-center gap-4">
                      <div className="p-2.5 bg-violet-50 dark:bg-white/5 rounded-2xl text-violet-600 dark:text-gold-500">
                        <Car size={24} />
                      </div>
                      Appointment #{a.id}
                    </h3>

                    <p className="text-violet-900 dark:text-white/80 font-bold leading-relaxed mb-8 italic">"{a.description}"</p>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-gold-500/20 flex items-center justify-center text-violet-600 dark:text-gold-500">
                        <Plus size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-violet-400 dark:text-gold-400 uppercase tracking-widest">Technician</p>
                        <p className="font-black text-violet-950 dark:text-white text-sm">{a.mechanic?.name || 'Assigning Expert...'}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-violet-100 dark:border-violet-700 flex items-center gap-4">
                      <Link 
                        to="/client/vehicles"
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-gold-400 hover:text-violet-700 dark:hover:text-gold-300 transition-colors"
                      >
                        <ChevronRight size={14} />
                        View Vehicle History
                      </Link>
                    </div>

                    {/* Image Upload - Only if not CANCELLED */}
                    {a.status !== 'CANCELLED' && (
                      <div className="mt-6 pt-6 border-t border-violet-100 dark:border-violet-700">
                        <p className="text-[10px] font-bold text-violet-400 dark:text-violet-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Camera size={14} /> Service Photo
                        </p>
                        {a.imageUrl && (
                          <div className="mb-3">
                            <img 
                              src={`http://localhost:3000/uploads/${a.imageUrl}`}
                              alt="Appointment"
                              className="w-full max-h-48 object-cover rounded-xl border border-violet-100 dark:border-violet-700"
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleFileChange(e, a.id)}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingId === a.id}
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-gold-400 hover:text-violet-700 dark:hover:text-gold-300 transition-colors disabled:opacity-50"
                        >
                          {uploadingId === a.id ? 'Uploading...' : (a.imageUrl ? 'Change Photo' : 'Add Photo')}
                        </button>
                        {selectedFile && uploadingId === a.id && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleUploadCommit(a.id)}
                              className="text-xs font-bold uppercase tracking-wider text-green-600 hover:text-green-700 transition-colors"
                            >
                              Confirm Upload
                            </button>
                            <button
                              onClick={handleCancelPreview}
                              className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Billing Section (Only if COMPLETED) */}
                  <div className="lg:w-80 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-violet-100 dark:border-violet-700 pt-10 lg:pt-0 lg:pl-10">
                    {a.status === 'COMPLETED' ? (
                      <div className="space-y-6">
                        <div className="bg-violet-50 dark:bg-violet-950/50 p-6 rounded-3xl border border-violet-100 dark:border-gold-500/20">
                          <div className="flex items-center gap-3 mb-4 text-violet-500 dark:text-gold-500">
                            <Receipt size={20} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Service Statement</p>
                          </div>
                          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                            {a.usedParts?.map(up => (
                              <div key={up.id} className="flex justify-between text-[10px] font-bold text-violet-400 dark:text-white/40">
                                <span>{up.item.name} x{up.quantity}</span>
                                <span>${(up.item.price * up.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-4 border-t border-violet-200 dark:border-white/10 flex justify-between items-center">
                            <p className="text-sm font-black text-violet-950 dark:text-white uppercase">Total Amount</p>
                            <p className="text-2xl font-black text-violet-600 dark:text-gold-500 tabular-nums">${a.totalAmount?.toFixed(2)}</p>
                          </div>
                        </div>

                        {a.paymentStatus === 'PAID' ? (
                          <div className="bg-green-500 text-white py-4 rounded-[20px] text-center font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-lg shadow-green-500/20">
                            <CheckCircle size={18} /> Account Settled
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePay(a.id)}
                            disabled={!!paying}
                            className={`w-full bg-violet-950 dark:bg-gold-500 text-white dark:text-violet-950 py-5 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3
                              ${paying === a.id ? 'opacity-70 cursor-wait' : ''}
                            `}
                          >
                            {paying === a.id ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><CreditCard size={18} /></motion.div>
                            ) : (
                              <CreditCard size={18} />
                            )}
                            {paying === a.id ? 'Authorizing...' : 'Settle via Stripe'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                        <div className="p-4 bg-violet-50 dark:bg-white/5 rounded-full text-violet-200 dark:text-white/10">
                          <Receipt size={40} />
                        </div>
                        <p className="text-[10px] font-black text-violet-300 dark:text-white/20 uppercase tracking-widest">Awaiting Completion for Billing</p>
                        {a.status === 'SCHEDULED' && a.paymentStatus !== 'PAID' && (
                          <button 
                            onClick={() => handleRequestCancel(a.id)}
                            className="text-[9px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-all"
                          >
                            Request Cancellation
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                 <div className="mt-10 pt-10 border-t border-violet-100 dark:border-violet-700">
                   <CommentSection appointmentId={a.id} />
                 </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
     </div>
   );
}