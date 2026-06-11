import { create } from 'zustand';
import api from '../services/api';
import type { InventoryItem } from '../types';

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  createItem: (data: Partial<InventoryItem>) => Promise<void>;
  updateItem: (id: number, data: Partial<InventoryItem>) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  assignItem: (appointmentId: number, itemId: number, quantity: number) => Promise<void>;
  requestItem: (appointmentId: number, itemId: number, quantity: number) => Promise<void>;
  approveRequest: (usedPartId: number) => Promise<void>;
  rejectRequest: (usedPartId: number) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  loading: false,
  fetchItems: async () => {
    set({ loading: true });
    const { data } = await api.get('/api/inventory');
    set({ items: data, loading: false });
  },
  createItem: async (data) => {
    await api.post('/api/inventory', data);
    get().fetchItems();
  },
  updateItem: async (id, data) => {
    await api.patch(`/api/inventory/${id}`, data);
    get().fetchItems();
  },
  removeItem: async (id) => {
    await api.delete(`/api/inventory/${id}`);
    get().fetchItems();
  },
  assignItem: async (appointmentId, itemId, quantity) => {
    await api.post(`/api/inventory/assign/${appointmentId}`, { itemId, quantity });
    get().fetchItems();
  },
  requestItem: async (appointmentId, itemId, quantity) => {
    await api.post(`/api/inventory/request/${appointmentId}`, { itemId, quantity });
  },
  approveRequest: async (usedPartId) => {
    await api.post(`/api/inventory/approve/${usedPartId}`);
    get().fetchItems();
  },
  rejectRequest: async (usedPartId) => {
    await api.post(`/api/inventory/reject/${usedPartId}`);
  },

}));
