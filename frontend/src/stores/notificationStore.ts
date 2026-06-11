import { create } from 'zustand';
import api from '../services/api';

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: (amount?: number) => void;
  fetchUnreadCount: () => Promise<void>;
  selectedAppointmentId: number | null;
  setSelectedAppointmentId: (id: number | null) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  selectedAppointmentId: null,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnreadCount: (amount = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - amount) })),
  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      set({ unreadCount: res.data.count });
    } catch {
      // Silently fail
    }
  },
  setSelectedAppointmentId: (id) => set({ selectedAppointmentId: id }),
}));

