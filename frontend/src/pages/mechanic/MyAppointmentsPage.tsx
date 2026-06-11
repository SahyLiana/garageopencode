import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, ChevronRight, MessageSquare, 
  Search, Layout, List, ArrowLeft, Filter,
  CheckCircle2, Clock, PlayCircle, XCircle,
  ChevronLeft, Upload, Camera, ImageIcon, Check, X,
  Package, Plus
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../services/api';
import CommentSection from '../../components/CommentSection';
import StatusBadge from '../../components/StatusBadge';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useNotificationStore } from '../../stores/notificationStore';
import type { Appointment } from '../../types';
import toast from 'react-hot-toast';


type ViewMode = 'table' | 'kanban' | 'detail';

export default function MechanicAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { items: inventoryItems, fetchItems, requestItem } = useInventoryStore();
  const { selectedAppointmentId, setSelectedAppointmentId } = useNotificationStore();
  const [requestForm, setRequestForm] = useState({ itemId: 0, quantity: 1 });
  const itemsPerPage = 5;

  const fetchAppointments = async () => {
    const { data } = await api.get('/api/appointments');
    setAppointments(data);
    if (selectedAppointment) {
      const updated = data.find((a: Appointment) => a.id === selectedAppointment.id);
      if (updated) setSelectedAppointment(updated);
    }
  };

  useEffect(() => {
    if (selectedAppointmentId && appointments.length > 0) {
      const appt = appointments.find(a => a.id === selectedAppointmentId);
      if (appt) {
        handleSelectAppointment(appt);
        setSelectedAppointmentId(null);
      }
    }
  }, [selectedAppointmentId, appointments]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const appt = appointments.find(a => a.id === id);
    if (appt?.status === 'CANCELLED') return;
    
    try {
      await api.patch(`/api/appointments/${id}/status`, { status });
      fetchAppointments();
      toast.success(`Status updated to ${status}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadCommit = async () => {
    if (!selectedFile || !selectedAppointment) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    setIsUploading(true);
    try {
      await api.patch(`/api/appointments/${selectedAppointment.id}/image`, formData);
      await fetchAppointments();
      handleCancelPreview();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(a => {
        const matchesSearch = a.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              a.vehicle?.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [appointments, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(start, start + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  const columns = {
    'SCHEDULED': { title: 'To Do', icon: <Calendar size={18} className="text-gray-500 dark:text-white/50" /> },
    'CONFIRMED': { title: 'Confirmed', icon: <Clock size={18} className="text-blue-500 dark:text-blue-400" /> },
    'IN_PROGRESS': { title: 'In Progress', icon: <PlayCircle size={18} className="text-amber-500 dark:text-amber-400" /> },
    'COMPLETED': { title: 'Done', icon: <CheckCircle2 size={18} className="text-green-500 dark:text-green-400" /> },
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    updateStatus(+draggableId, newStatus);
  };

  const handleSelectAppointment = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setViewMode('detail');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Mechanic Workshop</h1>
          <p className="text-gray-500 dark:text-white/60 font-medium">Manage your assignments and client communication</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-violet-900/30 p-1 rounded-xl shadow-inner">
          <button 
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-white dark:bg-violet-800 shadow-sm text-blue-600 dark:text-gold-400' : 'text-gray-500 dark:text-white/60'}`}
          >
            <List size={18} /> Clients
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-violet-800 shadow-sm text-blue-600 dark:text-gold-400' : 'text-gray-500 dark:text-white/60'}`}
          >
            <Layout size={18} /> Board
          </button>
        </div>
      </header>

      {viewMode !== 'detail' && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40" size={20} />
            <input 
              type="text" 
              placeholder="Search by client or license plate..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-violet-900/40 border border-gray-200 dark:border-violet-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700 dark:text-white"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40" size={18} />
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-violet-900/40 border border-gray-200 dark:border-violet-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none font-bold text-sm text-gray-700 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              {Object.keys(columns).map(s => <option key={s} value={s}>{s}</option>)}
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {viewMode === 'table' && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-violet-900/40 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-violet-700/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-violet-950/50 border-b border-gray-100 dark:border-violet-700/50">
                    <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Vehicle</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-violet-700/30">
                  {paginatedAppointments.map((a) => (
                    <tr key={a.id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-violet-900 flex items-center justify-center text-blue-600 dark:text-gold-400 font-bold">
                            {a.client?.name[0]}
                          </div>
                          <span className="font-bold text-gray-800 dark:text-white">{a.client?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-700 dark:text-white/80">{a.vehicle?.make} {a.vehicle?.model}</div>
                        <div className="text-[10px] font-mono text-gray-400 dark:text-white/40 uppercase">{a.vehicle?.licensePlate}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-white/70 font-medium">{new Date(a.dateTime).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400 dark:text-white/40">{new Date(a.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleSelectAppointment(a)}
                          className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {viewMode === 'kanban' && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-300px)] overflow-x-auto pb-4">
                {Object.entries(columns).map(([id, column]) => (
                  <div key={id} className="flex flex-col min-w-[280px]">
                    <div className="flex items-center gap-2 mb-4 px-2">
                      {column.icon}
                      <h2 className="font-black text-gray-800 dark:text-white text-sm uppercase tracking-widest">{column.title}</h2>
                      <span className="ml-auto text-xs font-bold text-gray-400 dark:text-white/40 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                        {appointments.filter(a => a.status === id).length}
                      </span>
                    </div>
                    <Droppable droppableId={id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex-1 rounded-2xl p-3 transition-colors space-y-3 min-h-[150px]
                            ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-white/5' : 'bg-gray-50/50 dark:bg-white/5'}
                          `}
                        >
                          {appointments
                            .filter(a => a.status === id)
                            .map((a, index) => (
                              <Draggable 
                                key={a.id.toString()} 
                                draggableId={a.id.toString()} 
                                index={index}
                                isDragDisabled={a.status === 'CANCELLED'}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-white dark:bg-violet-900/40 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 group cursor-pointer transition-all
                                      ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500 scale-105' : 'hover:border-blue-200 dark:hover:border-violet-600 hover:shadow-md'}
                                    `}
                                    onClick={() => handleSelectAppointment(a)}
                                  >
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="text-[9px] font-black bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 px-2 py-0.5 rounded uppercase tracking-tighter">
                                          #{a.id}
                                        </span>
                                        <MessageSquare size={14} className="text-gray-300 dark:text-white/30" />
                                      </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-1">{a.client?.name}</h3>
                                    <p className="text-[11px] text-gray-500 dark:text-white/60 mb-3">{a.vehicle?.make} {a.vehicle?.model}</p>
                                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-white/40">
                                      <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(a.dateTime).toLocaleDateString()}
                                      </div>
                                      <StatusBadge status={a.status} />
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </motion.div>
        )}

        {viewMode === 'detail' && selectedAppointment && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white dark:bg-violet-900/40 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-violet-700/50"
          >
            <div className="p-6 border-b border-gray-50 dark:border-violet-700/50 flex items-center justify-between bg-blue-600 text-white">
              <button 
                onClick={() => setViewMode('table')}
                className="flex items-center gap-2 text-sm font-bold hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <div className="text-right">
                <h2 className="text-xl font-black tracking-tight">{selectedAppointment.client?.name}</h2>
                <p className="text-xs text-white/70 font-medium uppercase tracking-widest">Service Details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-1 p-8 border-r border-gray-50 dark:border-violet-700/50 bg-gray-50/50 dark:bg-violet-950/30">
                <div className="space-y-8">
                  <section>
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest mb-4">Assigned Assets (From Admin)</h4>
                    <div className="space-y-3">
                      {selectedAppointment.usedParts && selectedAppointment.usedParts.length > 0 ? selectedAppointment.usedParts.map(up => (
                        <div key={up.id} className="bg-white dark:bg-violet-900/40 p-3 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-3">
                          <Package size={16} className={`
                            ${up.status === 'APPROVED' ? 'text-green-500 dark:text-green-400' : ''}
                            ${up.status === 'REQUESTED' ? 'text-amber-500 dark:text-amber-400' : ''}
                            ${up.status === 'REJECTED' ? 'text-red-500 dark:text-red-400' : ''}
                          `} />
                          <div className="flex-1 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-gray-800 dark:text-white">{up.item.name}</p>
                              <p className="text-[9px] text-gray-400 dark:text-white/40 font-black uppercase">Quantity: {up.quantity}</p>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                              up.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              up.status === 'REQUESTED' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {up.status}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-[10px] text-gray-400 dark:text-white/40 italic font-bold">No parts requested or assigned</p>
                      )}
                    </div>
                  </section>

                  {/* Tool Request Form */}
                  {!['COMPLETED', 'CANCELLED'].includes(selectedAppointment.status) && selectedAppointment.paymentStatus !== 'PAID' && (
                    <section className="bg-white dark:bg-violet-900/40 p-4 rounded-2xl border border-blue-100 dark:border-violet-700/50 shadow-sm">
                      <h4 className="text-[10px] font-black text-blue-500 dark:text-gold-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Plus size={14} /> Request New Tool
                      </h4>
                      <div className="space-y-3">
                        <select 
                          value={requestForm.itemId} 
                          onChange={(e) => setRequestForm({ ...requestForm, itemId: +e.target.value })}
                          className="w-full bg-gray-50 dark:bg-violet-950/50 border border-gray-200 dark:border-violet-700 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-white"
                        >
                          <option value={0}>Select Tool from Inventory</option>
                          {inventoryItems.filter(i => i.quantity > 0).map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.quantity} in stock)</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            value={requestForm.quantity} 
                            onChange={(e) => setRequestForm({ ...requestForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-20 bg-gray-50 dark:bg-violet-950/50 border border-gray-200 dark:border-violet-700 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-white"
                            min="1"
                          />
                          <button 
                            onClick={async () => {
                              if (!requestForm.itemId) return;
                              try {
                                await requestItem(selectedAppointment.id, requestForm.itemId, requestForm.quantity);
                                toast.success('Tool requested successfully!');
                                setRequestForm({ itemId: 0, quantity: 1 });
                                fetchAppointments();
                              } catch (err: any) {
                                toast.error(err.response?.data?.message || 'Failed to request tool');
                              }
                            }}
                            className="flex-1 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors"
                          >
                            Submit Request
                          </button>
                        </div>
                      </div>
                    </section>
                  )}

                  <section>
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest mb-4">Vehicle</h4>
                    <div className="bg-white dark:bg-violet-900/40 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                      <div className="text-lg font-bold text-gray-800 dark:text-white">{selectedAppointment.vehicle?.make} {selectedAppointment.vehicle?.model}</div>
                      <div className="text-xs font-mono text-blue-600 dark:text-gold-400 bg-blue-50 dark:bg-violet-900/30 px-2 py-1 rounded-md inline-block mt-1">
                        {selectedAppointment.vehicle?.licensePlate}
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest mb-4">Service Narrative</h4>
                    <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed bg-white dark:bg-violet-900/40 p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm italic">
                      "{selectedAppointment.description}"
                    </p>
                  </section>

                  {/* Image Upload Section - Only if not COMPLETED */}
                  {selectedAppointment.status !== 'COMPLETED' && (
                    <section>
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest mb-4">Service Image</h4>
                      <div className="bg-white dark:bg-violet-900/40 p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                        {selectedAppointment.imageUrl && !previewUrl && (
                          <div className="mb-4">
                            <img 
                              src={`http://localhost:3000${selectedAppointment.imageUrl}`} 
                              alt="Appointment" 
                              className="w-full h-48 object-cover rounded-xl"
                            />
                          </div>
                        )}
                        {previewUrl && (
                          <div className="mb-4">
                            <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
                          >
                            <Camera size={14} /> {selectedAppointment.imageUrl ? 'Change Image' : 'Upload Image'}
                          </button>
                          {previewUrl && (
                            <>
                              <button
                                onClick={handleUploadCommit}
                                disabled={isUploading}
                                className="flex-1 bg-green-500 text-white py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <Check size={14} /> {isUploading ? 'Uploading...' : 'Commit'}
                              </button>
                              <button
                                onClick={handleCancelPreview}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <X size={14} /> Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </section>
                  )}

                  <section>
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest mb-4">Workflow Control</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedAppointment.status === 'CONFIRMED' && (
                        <button onClick={() => updateStatus(selectedAppointment.id, 'IN_PROGRESS')} className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20">
                          Start Service
                        </button>
                      )}
                      {selectedAppointment.status === 'IN_PROGRESS' && (
                        <button onClick={() => updateStatus(selectedAppointment.id, 'COMPLETED')} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20">
                          Complete Task
                        </button>
                      )}
                      {selectedAppointment.status !== 'COMPLETED' && selectedAppointment.status !== 'CANCELLED' && selectedAppointment.paymentStatus !== 'PAID' && (
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to request cancellation for this appointment?')) {
                              updateStatus(selectedAppointment.id, 'CANCEL_REQUESTED');
                            }
                          }} 
                          className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20"
                        >
                          Request Cancellation
                        </button>
                      )}
                      <StatusBadge status={selectedAppointment.status} />
                    </div>
                  </section>
                </div>
              </div>

              <div className="lg:col-span-2 p-8 bg-white dark:bg-violet-900/20">
                <CommentSection appointmentId={selectedAppointment.id} status={selectedAppointment.status} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
