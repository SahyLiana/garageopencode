import { create } from 'zustand';
import api from '../services/api';
import type { Vehicle } from '../types';

interface VehicleState {
  vehicles: Vehicle[];
  loading: boolean;
  fetchVehicles: (clientId?: number) => Promise<void>;
  createVehicle: (data: any) => Promise<void>;
  updateVehicle: (id: number, data: any) => Promise<void>;
  deleteVehicle: (id: number) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: [],
  loading: false,

  fetchVehicles: async (clientId) => {
    set({ loading: true });
    const url = clientId ? `/api/vehicles?clientId=${clientId}` : '/api/vehicles';
    const { data } = await api.get(url);
    set({ vehicles: data, loading: false });
  },

  createVehicle: async (vehicleData) => {
    await api.post('/api/vehicles', vehicleData);
  },

  updateVehicle: async (id, data) => {
    await api.patch(`/api/vehicles/${id}`, data);
  },

  deleteVehicle: async (id) => {
    await api.delete(`/api/vehicles/${id}`);
  },
}));
