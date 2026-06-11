import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Plus, History, ChevronRight, ArrowLeft,
  Wrench, DollarSign, Clock, CheckCircle2,
  AlertCircle, ShieldCheck, Calendar, Info,
  MessageSquare, Camera
} from 'lucide-react';
import { useVehicleStore } from '../../stores/vehicleStore';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import CommentSection from '../../components/CommentSection';
import type { Vehicle, Appointment } from '../../types';
import toast from 'react-hot-toast';


type PageView = 'list' | 'history' | 'appointment-detail';

export default function MyVehiclesPage() {
  const { vehicles, loading, fetchVehicles, createVehicle } = useVehicleStore();
  const { user } = useAuthStore();
  const [view, setView] = useState<PageView>('list');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [vehicleAppointments, setVehicleAppointments] = useState<Appointment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
  });

  useEffect(() => {
    if (user) fetchVehicles(user.id);
  }, [user]);

  const handleVehicleClick = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setView('history');
    const { data } = await api.get(`/api/appointments`);
    const filtered = data.filter((a: Appointment) => a.vehicleId === vehicle.id);
    setVehicleAppointments(filtered);
  };

  const handleAppointmentClick = async (appt: Appointment) => {
    const { data } = await api.get(`/api/appointments/${appt.id}`);
    setSelectedAppointment(data);
    setView('appointment-detail');
  };

  const handleBack = () => {
    if (view === 'appointment-detail') setView('history');
    else {
      setView('list');
      setSelectedVehicle(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createVehicle({ ...form, clientId: user.id });
      setShowAddForm(false);
      setForm({ make: '', model: '', year: new Date().getFullYear(), licensePlate: '', vin: '' });
      fetchVehicles(user.id);
      toast.success('Vehicle registered successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register vehicle');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div className="flex items-center gap-5">
                <div className="bg-violet-600 dark:bg-gold-500 p-4 rounded-[28px] text-white dark:text-violet-950 shadow-2xl shadow-violet-500/20 dark:shadow-gold-500/30">
                  <Car size={36} />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-violet-950 dark:text-white tracking-tight">My Garage</h1>
                  <div className="mt-2 bg-violet-50 dark:bg-violet-950 px-4 py-2 rounded-2xl border border-violet-100 dark:border-white/10 inline-block shadow-inner">
                    <p className="text-violet-500 dark:text-white font-bold text-sm tracking-wide">Personal vehicle fleet & maintenance records</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`flex items-center gap-3 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl
                  ${showAddForm
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 hover:scale-105 active:scale-95 shadow-violet-500/30 dark:shadow-gold-500/40'}
                `}
              >
                {showAddForm ? 'Cancel Registration' : <><Plus size={20} /> Register Vehicle</>}
              </button>
            </div>

            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white dark:bg-violet-950 backdrop-blur-xl p-12 rounded-[50px] shadow-2xl border border-violet-100 dark:border-white/10 mb-16 grid grid-cols-1 md:grid-cols-2 gap-10"
              >
                {[
                  { label: 'License Plate', key: 'licensePlate', placeholder: 'ABC-1234' },
                  { label: 'Make', key: 'make', placeholder: 'Toyota, BMW, etc.' },
                  { label: 'Model', key: 'model', placeholder: 'Camry, X5, etc.' },
                  { label: 'Year', key: 'year', type: 'number' },
                ].map((field) => (
                  <div key={field.key} className="space-y-3">
                    <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4">{field.label}</label>
                    <input
                      value={(form as any)[field.key] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({
                          ...form,
                          [field.key]: field.type === 'number' ? (val === '' ? '' : parseInt(val)) : val
                        });
                      }}
                      placeholder={field.placeholder}
                      type={field.type || 'text'}
                      min={field.key === 'year' ? "1900" : undefined}
                      max={field.key === 'year' ? new Date().getFullYear() + 1 : undefined}
                      required
                      className="w-full px-8 py-5 bg-violet-50/50 dark:bg-white/5 border border-violet-100 dark:border-white/10 rounded-3xl focus:ring-4 focus:ring-violet-500/10 dark:focus:ring-gold-500/10 outline-none transition-all font-bold text-violet-950 dark:text-white text-base"
                    />
                  </div>
                ))}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.3em] ml-4">VIN (Optional)</label>
                  <input
                    value={form.vin}
                    onChange={(e) => setForm({ ...form, vin: e.target.value })}
                    placeholder="17-character Identification Number"
                    className="w-full px-8 py-5 bg-violet-50/50 dark:bg-white/5 border border-violet-100 dark:border-white/10 rounded-3xl focus:ring-4 focus:ring-violet-500/10 dark:focus:ring-gold-500/10 outline-none transition-all font-bold text-violet-950 dark:text-white text-base"
                  />
                </div>
                <button type="submit" className="md:col-span-2 bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] hover:opacity-90 transition-all active:scale-[0.98] shadow-2xl shadow-violet-500/20 dark:shadow-gold-500/30">
                  Confirm Registration
                </button>
              </motion.form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {vehicles.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  whileHover={{ y: -12, scale: 1.02 }}
                  onClick={() => handleVehicleClick(vehicle)}
                  className="bg-white dark:bg-violet-950 backdrop-blur-2xl p-10 rounded-[56px] shadow-xl border border-violet-100 dark:border-white/10 hover:shadow-2xl transition-all cursor-pointer relative group overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className="bg-violet-50 dark:bg-gold-500/20 p-5 rounded-[28px] text-violet-600 dark:text-gold-500 group-hover:bg-violet-600 dark:group-hover:bg-gold-500 group-hover:text-white dark:group-hover:text-violet-950 transition-all duration-500 shadow-lg">
                      <Car size={40} />
                    </div>
                    <span className="text-[10px] font-black text-violet-500 dark:text-gold-500 bg-violet-50/50 dark:bg-gold-500/10 px-5 py-2 rounded-full uppercase tracking-widest border border-violet-100 dark:border-gold-500/20">
                      {vehicle.year}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-violet-950 dark:text-white tracking-tighter">{vehicle.make}</h3>
                    <h4 className="text-xl font-bold text-violet-500 dark:text-violet-200 leading-none">{vehicle.model}</h4>
                    <p className="text-xs font-mono font-black text-violet-600 dark:text-gold-500 uppercase tracking-tighter bg-violet-100 dark:bg-gold-500/20 inline-block px-4 py-1.5 rounded-2xl mt-6 shadow-sm border border-violet-200 dark:border-gold-500/20">
                      {vehicle.licensePlate}
                    </p>
                  </div>
                  <div className="mt-12 pt-10 border-t border-violet-100 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      <History size={18} /> Service Records
                    </span>
                    <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-gold-500/10 flex items-center justify-center text-violet-400 dark:text-gold-500 group-hover:bg-violet-600 dark:group-hover:bg-gold-500 group-hover:text-white dark:group-hover:text-violet-950 transition-all duration-300">
                      <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'history' && selectedVehicle && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="flex items-center justify-between mb-12">
              <button onClick={handleBack} className="group flex items-center gap-4 text-[10px] font-black text-violet-500 dark:text-gold-500 hover:text-violet-950 dark:hover:text-white transition-all uppercase tracking-[0.3em]">
                <div className="w-10 h-10 rounded-full border-2 border-violet-100 dark:border-gold-500/20 flex items-center justify-center group-hover:bg-violet-600 dark:group-hover:bg-gold-500 group-hover:text-white dark:group-hover:text-violet-950 transition-all">
                  <ArrowLeft size={20} />
                </div>
                Return to Garage
              </button>
              <div className="text-right">
                <h2 className="text-4xl font-black text-violet-950 dark:text-white tracking-tighter">{selectedVehicle.make} {selectedVehicle.model}</h2>
                <div className="mt-2 bg-violet-50 dark:bg-violet-950 px-4 py-1.5 rounded-xl border border-violet-100 dark:border-white/10 inline-block shadow-inner">
                  <p className="text-xs font-mono text-violet-400 dark:text-white font-black uppercase tracking-[0.4em]">{selectedVehicle.licensePlate}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-violet-950 backdrop-blur-3xl rounded-[60px] shadow-2xl overflow-hidden border border-violet-100 dark:border-white/10">
              <div className="bg-violet-50/30 dark:bg-white/5 p-10 border-b border-violet-100 dark:border-white/10 flex items-center gap-5">
                <div className="p-4 bg-white dark:bg-violet-900/60 rounded-3xl shadow-xl text-violet-600 dark:text-gold-500">
                  <Calendar size={28} />
                </div>
                <h3 className="text-base font-black text-violet-950 dark:text-white uppercase tracking-[0.3em]">Lifecycle Maintenance History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-violet-50/10 dark:bg-white/5 border-b border-violet-100 dark:border-white/10">
                      <th className="px-10 py-6 text-[10px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-widest">Entry Date</th>
                      <th className="px-10 py-6 text-[10px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-widest">Service Unit</th>
                      <th className="px-10 py-6 text-[10px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-widest">Issue Log</th>
                      <th className="px-10 py-6 text-[10px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-widest">Status</th>
                      <th className="px-10 py-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-100/50 dark:divide-white/5">
                    {vehicleAppointments.map((a) => (
                      <tr key={a.id} className="hover:bg-violet-50/40 dark:hover:bg-white/5 transition-all group">
                        <td className="px-10 py-8">
                          <div className="text-base font-black text-violet-950 dark:text-white">{new Date(a.dateTime).toLocaleDateString()}</div>
                          <div className="text-[10px] text-violet-400 dark:text-violet-300 font-black uppercase mt-1 tracking-widest">LOG-REF #{a.id}</div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="px-5 py-2 bg-white dark:bg-violet-900/60 border border-violet-100 dark:border-gold-500/30 rounded-2xl text-[10px] font-black text-violet-600 dark:text-gold-500 uppercase tracking-widest shadow-md">
                            {a.category}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="text-sm text-violet-900 dark:text-violet-100 line-clamp-1 italic font-medium leading-relaxed max-w-xs">"{a.description}"</div>
                        </td>
                        <td className="px-10 py-8">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button
                            onClick={() => handleAppointmentClick(a)}
                            className="p-4 rounded-2xl bg-violet-50 dark:bg-gold-500/10 text-violet-500 dark:text-gold-500 hover:bg-violet-600 dark:hover:bg-gold-500 hover:text-white dark:hover:text-violet-950 transition-all shadow-lg hover:shadow-violet-200 dark:hover:shadow-gold-500/20"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'appointment-detail' && selectedAppointment && (
          <motion.div
            key="appointment-detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-violet-950 backdrop-blur-3xl rounded-[80px] shadow-2xl overflow-hidden border border-violet-100 dark:border-white/10"
          >
            <div className="p-12 border-b border-violet-100 dark:border-white/10 flex items-center justify-between bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950">
              <button
                onClick={handleBack}
                className="flex items-center gap-4 text-[10px] font-black hover:bg-black/10 dark:hover:bg-white/10 px-8 py-4 rounded-[24px] transition-all uppercase tracking-[0.3em] border border-white/20 dark:border-violet-950/20"
              >
                <ArrowLeft size={24} /> View History
              </button>
              <div className="text-right">
                <h2 className="text-4xl font-black tracking-tighter uppercase">Case File #{selectedAppointment.id}</h2>
                <div className="mt-2 bg-black/10 dark:bg-violet-950/30 px-4 py-1 rounded-xl">
                  <p className="text-[11px] opacity-80 font-black uppercase tracking-[0.4em] italic">{new Date(selectedAppointment.dateTime).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-1 p-12 border-r border-violet-100 dark:border-white/10 bg-violet-50/40 dark:bg-violet-950/60">
                <div className="space-y-16">
                  <section>
                    <h4 className="text-[10px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-[0.3em] mb-8">Metadata</h4>
                    <div className="bg-white dark:bg-violet-900/60 p-8 rounded-[40px] shadow-xl border border-violet-100 dark:border-white/10 space-y-8">
                      <div className="flex items-center gap-5">
                        <div className="bg-violet-50 dark:bg-gold-500/20 p-4 rounded-2xl text-violet-600 dark:text-gold-500 shadow-inner">
                          <Car size={32} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest mb-1 opacity-70">Vehicle Unit</p>
                          <p className="text-lg font-black text-violet-950 dark:text-white leading-none">{selectedAppointment.vehicle?.make} {selectedAppointment.vehicle?.model}</p>
                        </div>
                      </div>
                      <div className="pt-8 border-t border-violet-100 dark:border-white/10">
                        <p className="text-[10px] font-black text-violet-500 dark:text-gold-400 uppercase tracking-widest mb-2 opacity-70">Category</p>
                        <p className="text-base font-black text-violet-950 dark:text-white uppercase tracking-tighter">{selectedAppointment.category}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-[0.3em] mb-8">Asset Profile</h4>
                    {selectedAppointment.imageUrl ? (
                      <div className="relative group overflow-hidden rounded-[48px] border-[8px] border-white dark:border-violet-800 shadow-2xl aspect-square bg-gray-200">
                        <img
                          src={`http://localhost:3000/uploads/${selectedAppointment.imageUrl}?t=${new Date().getTime()}`}
                          alt="Problem proof"
                          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-125"
                        />
                      </div>
                    ) : (
                      <div className="bg-violet-50/50 dark:bg-gold-500/5 border-2 border-dashed border-violet-200 dark:border-gold-500/40 rounded-[48px]">
                        <Camera size={48} className="opacity-20" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Log Void</span>
                      </div>
                    )}
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-[0.3em] mb-8">Registry Status</h4>
                    <StatusBadge status={selectedAppointment.status} />
                  </section>
                </div>
              </div>

              <div className="lg:col-span-2 p-16 bg-white dark:bg-violet-950/20">
                <section className="mb-20">
                  <h4 className="text-[10px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-[0.4em] mb-10">Detailed Narrative</h4>
                  <div className="bg-violet-50/60 dark:bg-gold-500/5 rounded-[56px] p-12 border border-violet-100 dark:border-gold-500/10 relative overflow-hidden shadow-inner">
                    <p className="text-3xl text-violet-950 dark:text-white leading-relaxed font-black italic relative z-10 tracking-tight">
                      "{selectedAppointment.description}"
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-violet-500 dark:text-gold-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                    <MessageSquare size={24} /> Encrypted Discussion
                  </h4>
                  <div className="border-t border-violet-100 dark:border-gold-500/20 pt-12">
                    <CommentSection appointmentId={selectedAppointment.id} status={selectedAppointment.status} />
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
