import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Car, MessageSquare, Camera,
  CheckCircle2, AlertCircle, ArrowRight,
  Clock, ShieldCheck, ChevronDown, Plus, Users, Wrench
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { Vehicle, User } from '../../types';
import toast from 'react-hot-toast';

export default function BookAppointmentPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({
    vehicleId: '',
    dateTime: '',
    category: 'OTHER',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStaff = user?.role === 'ADMIN' || user?.role === 'MECHANIC';

  useEffect(() => {
    if (isStaff) {
      api.get('/api/users').then(({ data }) => {
        setClients(data.filter((u: User) => u.role === 'CLIENT'));
      });
    } else if (user?.role === 'CLIENT') {
      setSelectedClientId(user.id.toString());
    }
  }, [user, isStaff]);

  useEffect(() => {
    if (selectedClientId) {
      api.get(`/api/vehicles?clientId=${selectedClientId}`).then(({ data }) => setVehicles(data));
      setForm(prev => ({ ...prev, vehicleId: '' }));
    }
  }, [selectedClientId]);

  const categories = [
    { value: 'ENGINE', label: 'Engine / Drivetrain' },
    { value: 'TRANSMISSION', label: 'Transmission' },
    { value: 'SUSPENSION', label: 'Suspension / Brakes' },
    { value: 'ELECTRICAL', label: 'Electrical / Electronics' },
    { value: 'BODY', label: 'Body / Interior' },
    { value: 'OTHER', label: 'Other / I don\'t know' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId) {
      setError('Please select a vehicle');
      return;
    }

    const formData = new FormData();
    formData.append('clientId', selectedClientId);
    formData.append('vehicleId', form.vehicleId);
    formData.append('dateTime', form.dateTime);
    formData.append('category', form.category);
    formData.append('description', form.description);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/api/appointments', formData);
      toast.success('Appointment booked successfully!');
      setSuccess(true);
      setForm({ vehicleId: '', dateTime: '', category: 'OTHER', description: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
      if (isStaff) setSelectedClientId('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to book appointment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-20 text-center"
      >
        <div className="bg-green-50 dark:bg-green-500/10 w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-green-600 dark:text-green-400 shadow-xl shadow-green-100 dark:shadow-green-500/10">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black text-violet-950 dark:text-white mb-4 tracking-tight">Booking Received!</h1>
        <p className="text-violet-400 dark:text-gold-200 text-lg font-medium max-w-md mx-auto mb-10">
          The service request has been successfully registered in the system.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-violet-950 dark:bg-gold-500 text-white dark:text-violet-950 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl"
        >
          Book Another Service
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col lg:flex-row gap-16">
      <div className="lg:w-1/3">
        <div className="sticky top-28">
          <div className="bg-violet-600 dark:bg-gold-500 p-5 rounded-[28px] text-white dark:text-violet-950 shadow-2xl shadow-violet-200 dark:shadow-gold-500/20 inline-block mb-8">
            <Calendar size={40} />
          </div>
          <h1 className="text-4xl font-black text-violet-950 dark:text-white tracking-tight leading-tight mb-6">
            {isStaff ? 'Staff Booking Portal' : <>Schedule Your <span className="text-violet-600 dark:text-gold-500 underline decoration-[12px] decoration-violet-100 dark:decoration-gold-500/20 underline-offset-4">Maintenance</span></>}
          </h1>
          <p className="text-violet-400 dark:text-gold-200 text-lg font-medium leading-relaxed mb-10">
            {isStaff
              ? 'Register a new service request for a customer. Select the client first to view their vehicles.'
              : 'Provide details about your vehicle\'s issue and pick a time that works for you. Our experts will handle the rest.'
            }
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-violet-50 dark:bg-gold-500/5 border border-violet-100 dark:border-gold-500/10">
              <div className="bg-white dark:bg-violet-950 p-2 rounded-xl shadow-sm text-violet-600 dark:text-gold-500">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-black text-violet-950 dark:text-white text-xs uppercase tracking-widest">Official Records</h4>
                <p className="text-xs text-violet-400 dark:text-gold-500/60 font-bold mt-1">All bookings are logged in vehicle history</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-2/3">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-violet-900/40 p-12 rounded-[50px] shadow-2xl border border-violet-100 dark:border-gold-500/10 space-y-10 relative overflow-hidden">
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 dark:bg-violet-950/80 backdrop-blur-[4px] z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-violet-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black text-violet-600 dark:text-gold-500 uppercase tracking-[0.3em]">Processing Request...</p>
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-500/10 p-5 rounded-2xl flex items-center gap-4 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20"
            >
              <AlertCircle size={24} />
              <p className="text-sm font-black uppercase tracking-tight">{error}</p>
            </motion.div>
          )}

          {isStaff && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-violet-400 dark:text-gold-500 uppercase tracking-[0.2em] ml-3 flex items-center gap-2">
                <Users size={14} /> Select Customer Account
              </label>
              <div className="relative">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                  className="w-full pl-6 pr-14 py-5 bg-violet-50/50 dark:bg-violet-950/50 border border-violet-100 dark:border-gold-500/10 rounded-[24px] focus:ring-4 focus:ring-violet-500/20 dark:focus:ring-gold-500/20 outline-none transition-all appearance-none font-black text-violet-950 dark:text-white text-sm"
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-violet-300 dark:text-gold-500 pointer-events-none" size={24} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-violet-400 dark:text-gold-500 uppercase tracking-[0.2em] ml-3 flex items-center gap-2">
                <Car size={14} /> Vehicle
              </label>
              <div className="relative">
                <select
                  value={form.vehicleId}
                  onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                  required
                  disabled={!selectedClientId}
                  className="w-full pl-6 pr-14 py-5 bg-violet-50/50 dark:bg-violet-950/50 border border-violet-100 dark:border-gold-500/10 rounded-[24px] focus:ring-4 focus:ring-violet-500/20 dark:focus:ring-gold-500/20 outline-none transition-all appearance-none font-black text-violet-950 dark:text-white text-sm disabled:opacity-40"
                >
                  <option value="">{selectedClientId ? 'Select vehicle' : 'Select client first'}</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-violet-300 dark:text-gold-500 pointer-events-none" size={24} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-violet-400 dark:text-gold-500 uppercase tracking-[0.2em] ml-3 flex items-center gap-2">
                <Wrench size={14} /> Service Type
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  className="w-full pl-6 pr-14 py-5 bg-violet-50/50 dark:bg-violet-950/50 border border-violet-100 dark:border-gold-500/10 rounded-[24px] focus:ring-4 focus:ring-violet-500/20 dark:focus:ring-gold-500/20 outline-none transition-all appearance-none font-black text-violet-950 dark:text-white text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-violet-300 dark:text-gold-500 pointer-events-none" size={24} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-violet-400 dark:text-gold-500 uppercase tracking-[0.2em] ml-3 flex items-center gap-2">
              <MessageSquare size={14} /> Brief Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What seems to be the problem?"
              required
              rows={4}
              className="w-full px-8 py-5 bg-violet-50/50 dark:bg-violet-950/50 border border-violet-100 dark:border-gold-500/10 rounded-[32px] focus:ring-4 focus:ring-violet-500/20 dark:focus:ring-gold-500/20 outline-none transition-all font-bold text-violet-950 dark:text-white text-base placeholder:text-violet-200 dark:placeholder:text-violet-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-violet-400 dark:text-gold-500 uppercase tracking-[0.2em] ml-3 flex items-center gap-2">
                <Clock size={14} /> Schedule Date & Time
              </label>
              <input
                value={form.dateTime}
                onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                type="datetime-local"
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-8 py-5 bg-violet-50/50 dark:bg-violet-950/50 border border-violet-100 dark:border-gold-500/10 rounded-[24px] focus:ring-4 focus:ring-violet-500/20 dark:focus:ring-gold-500/20 outline-none transition-all font-black text-violet-950 dark:text-white text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-violet-400 dark:text-gold-500 uppercase tracking-[0.2em] ml-3 flex items-center gap-2">
                <Camera size={14} /> Problem Documentation
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-5 px-6 border-2 border-dashed rounded-[24px] cursor-pointer flex items-center justify-between transition-all
                  ${previewUrl
                    ? 'border-violet-300 bg-violet-50/50 dark:border-gold-500/40 dark:bg-gold-500/10'
                    : 'border-violet-100 dark:border-gold-500/10 hover:border-violet-600 dark:hover:border-gold-500 bg-violet-50/20 dark:bg-violet-950/20'}
                `}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} className="w-10 h-10 rounded-xl object-cover shadow-lg border-2 border-white dark:border-violet-800" />
                  ) : (
                    <Camera className="text-violet-300 dark:text-gold-500" size={24} />
                  )}
                  <span className={`text-[10px] font-black uppercase tracking-widest truncate ${previewUrl ? 'text-violet-600 dark:text-gold-500' : 'text-violet-300 dark:text-gold-500/40'}`}>
                    {selectedFile ? selectedFile.name : 'Upload Proof'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Plus size={20} className={previewUrl ? 'text-violet-600 dark:text-gold-500' : 'text-violet-300 dark:text-gold-500/20'} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 py-6 px-10 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] hover:opacity-90 shadow-2xl shadow-violet-200 dark:shadow-gold-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {isStaff ? 'Register Staff Booking' : 'Confirm Service Request'} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}