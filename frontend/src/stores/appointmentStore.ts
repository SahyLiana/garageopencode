import { create } from 'zustand';
import api from '../services/api';
import type { Appointment } from '../types';

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  fetchAppointments: () => Promise<void>;
  createAppointment: (data: any) => Promise<void>;
  updateStatus: (id: number, status: string) => Promise<void>;
  updateAppointment: (id: number, data: Partial<Appointment>) => Promise<void>;
  payAppointment: (id: number) => Promise<void>;
  deleteAppointment: (id: number) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  loading: false,

  fetchAppointments: async () => {
    set({ loading: true });
    const { data } = await api.get('/api/appointments');
    set({ appointments: data, loading: false });
  },

  createAppointment: async (data) => {
    await api.post('/api/appointments', data);
    get().fetchAppointments();
  },

  updateStatus: async (id, status) => {
    await api.patch(`/api/appointments/${id}/status`, { status });
    get().fetchAppointments();
  },

  updateAppointment: async (id, data) => {
    await api.patch(`/api/appointments/${id}`, data);
    get().fetchAppointments();
  },

  payAppointment: async (id) => {
    await api.post(`/api/appointments/${id}/pay`);
    get().fetchAppointments();
  },

  deleteAppointment: async (id) => {
    await api.delete(`/api/appointments/${id}`);
    get().fetchAppointments();
  },
}));