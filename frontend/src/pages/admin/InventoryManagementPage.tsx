import { useEffect, useState, useMemo } from 'react';
import { 
  Package, Plus, Search, Filter, 
  DollarSign, Hash, Edit3, Trash2, 
  X, Check, ChevronRight, AlertTriangle,
  Layers, Tag, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventoryStore } from '../../stores/inventoryStore';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

export default function InventoryManagementPage() {
  const { items, loading, fetchItems, createItem, updateItem, removeItem } = useInventoryStore();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [form, setForm] = useState({ 
    name: '', 
    price: 0, 
    quantity: 0, 
    category: 'PARTS', 
    description: '' 
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'ALL' || i.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [items, searchQuery, categoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateItem(editItem.id, form);
        toast.success('Item updated successfully!');
      } else {
        await createItem(form);
        toast.success('Item added successfully!');
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ name: '', price: 0, quantity: 0, category: 'PARTS', description: '' });
    } catch (error) {
      toast.error('Failed to save item. Please try again.');
    }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ 
      name: item.name, 
      price: item.price, 
      quantity: item.quantity, 
      category: item.category || 'PARTS', 
      description: item.description || '' 
    });
    setShowForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-violet-600 dark:bg-gold-500 p-3.5 rounded-[22px] text-white dark:text-violet-950 shadow-xl shadow-violet-500/10 dark:shadow-gold-500/20">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-violet-950 dark:text-white tracking-tight leading-none">Workshop Inventory</h1>
            <p className="text-violet-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-[0.2em] mt-1.5">Asset & Part Control</p>
          </div>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditItem(null); }}
          className="flex items-center gap-2 bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={16} /> New Stock Item
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-300 dark:text-violet-400" size={18} />
          <input 
            type="text"
            placeholder="Search parts catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-violet-800 border border-violet-100 dark:border-violet-700 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold text-violet-950 dark:text-white focus:ring-4 focus:ring-violet-500/5 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="md:w-64 relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-300 dark:text-violet-400" size={18} />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-white dark:bg-violet-800 border border-violet-100 dark:border-violet-700 rounded-2xl py-3.5 pl-12 pr-10 text-sm font-black text-violet-950 dark:text-white outline-none appearance-none cursor-pointer uppercase tracking-widest"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-violet-300">
            <ChevronRight size={18} className="rotate-90" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-violet-800 rounded-[32px] shadow-xl overflow-hidden border border-violet-100 dark:border-violet-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-violet-50/10 dark:bg-white/5 border-b border-violet-100 dark:border-white/10">
                <th className="px-8 py-5 text-[9px] font-black text-violet-400 dark:text-gold-500/70 uppercase tracking-[0.2em]">Part Details</th>
                <th className="px-8 py-5 text-[9px] font-black text-violet-400 dark:text-gold-500/70 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[9px] font-black text-violet-400 dark:text-gold-500/70 uppercase tracking-[0.2em]">Stock Level</th>
                <th className="px-8 py-5 text-[9px] font-black text-violet-400 dark:text-gold-500/70 uppercase tracking-[0.2em]">Unit Price</th>
                <th className="px-8 py-5 text-[9px] font-black text-violet-400 dark:text-gold-500/70 uppercase tracking-[0.2em] text-right">Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100/30 dark:divide-white/5">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-violet-50/40 dark:hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-400 dark:text-gold-500 border border-violet-100 dark:border-gold-500/10 group-hover:bg-violet-600 dark:group-hover:bg-gold-500 group-hover:text-white dark:group-hover:text-violet-950 transition-all">
                        <Layers size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-violet-950 dark:text-white tracking-tight">{item.name}</p>
                        <p className="text-[10px] font-bold text-violet-400 dark:text-violet-300/40 truncate max-w-[180px]">{item.description || 'No description provided'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-violet-50 dark:bg-gold-500/10 text-violet-600 dark:text-gold-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-violet-100 dark:border-gold-500/20">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black tabular-nums ${item.quantity <= 5 ? 'text-red-500 animate-pulse' : 'text-violet-950 dark:text-white'}`}>
                        {item.quantity}
                      </span>
                      {item.quantity <= 5 && <AlertTriangle size={14} className="text-red-500" />}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-violet-950 dark:text-white tabular-nums">${item.price.toFixed(2)}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2.5 rounded-xl bg-violet-50 dark:bg-white/5 text-violet-500 dark:text-violet-300 hover:bg-violet-600 dark:hover:bg-gold-500 hover:text-white dark:hover:text-violet-950 transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && !loading && (
            <div className="py-20 text-center flex flex-col items-center gap-6">
              <Search size={32} className="text-violet-200 dark:text-white/5" />
              <p className="text-violet-300 font-black uppercase tracking-[0.3em] text-[10px]">No matches in inventory</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditItem(null); }}
        title={editItem ? 'Update Stock Item' : 'New Registry Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-2 text-violet-950 dark:text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest ml-3">Item Name</label>
              <input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
                className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:ring-4 focus:ring-violet-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest ml-3">Unit Price ($)</label>
              <input 
                value={form.price || ''} 
                onChange={(e) => setForm({ ...form, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })} 
                type="number"
                step="0.01"
                required 
                className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:ring-4 focus:ring-violet-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest ml-3">Initial Quantity</label>
              <input 
                value={form.quantity || ''} 
                onChange={(e) => setForm({ ...form, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) })} 
                type="number"
                required 
                className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:ring-4 focus:ring-violet-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest ml-3">Category</label>
              <input 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value.toUpperCase() })} 
                placeholder="FLUIDS, BRAKES, etc."
                className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:ring-4 focus:ring-violet-500/5"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest ml-3">Technical Description (Optional)</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="w-full bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-700 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:ring-4 focus:ring-violet-500/5 h-24 resize-none"
              placeholder="Provide additional details if necessary..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => { setShowForm(false); setEditItem(null); }}
              className="px-6 py-4 border border-violet-100 dark:border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
            >
              Abort
            </button>
            <button 
              type="submit" 
              className="flex-1 px-8 py-4 bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              {editItem ? 'Update Asset' : 'Commit to Registry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
