import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useVehicleStore } from '../../stores/vehicleStore';
import type { User, Vehicle } from '../../types';
import toast from 'react-hot-toast';

export default function VehicleManagementPage() {
  const { vehicles, loading, fetchVehicles, createVehicle, updateVehicle, deleteVehicle } = useVehicleStore();
  const [clients, setClients] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({
    clientId: 0,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
  });

  useEffect(() => {
    fetchVehicles();
    api.get('/api/users').then(({ data }) => setClients(data.filter((u: User) => u.role === 'CLIENT')));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editVehicle) {
        await updateVehicle(editVehicle.id, form);
        toast.success('Vehicle updated successfully!');
      } else {
        await createVehicle(form);
        toast.success('Vehicle added successfully!');
      }
      setShowForm(false);
      setEditVehicle(null);
      setForm({ clientId: 0, make: '', model: '', year: new Date().getFullYear(), licensePlate: '', vin: '' });
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to save vehicle.');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setForm({
      clientId: vehicle.clientId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      vin: vehicle.vin || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this vehicle?')) return;
    await deleteVehicle(id);
    fetchVehicles();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditVehicle(null);
            setForm({ clientId: 0, make: '', model: '', year: new Date().getFullYear(), licensePlate: '', vin: '' });
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-violet-900/40 p-4 rounded shadow mb-4 grid grid-cols-2 gap-3">
          <select
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: +e.target.value })}
            required
            className="border rounded px-3 py-2 dark:bg-violet-950/50 dark:border-violet-700 dark:text-white"
          >
            <option value={0}>Select Client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>
          <input
            value={form.licensePlate}
            onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
            placeholder="License Plate"
            required
            className="border rounded px-3 py-2 dark:bg-violet-950/50 dark:border-violet-700 dark:text-white"
          />
          <input
            value={form.make}
            onChange={(e) => setForm({ ...form, make: e.target.value })}
            placeholder="Make (e.g. Toyota)"
            required
            className="border rounded px-3 py-2 dark:bg-violet-950/50 dark:border-violet-700 dark:text-white"
          />
          <input
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            placeholder="Model (e.g. Camry)"
            required
            className="border rounded px-3 py-2 dark:bg-violet-950/50 dark:border-violet-700 dark:text-white"
          />
          <input
            value={form.year}
            onChange={(e) => setForm({ ...form, year: +e.target.value })}
            placeholder="Year"
            type="number"
            required
            className="border rounded px-3 py-2 dark:bg-violet-950/50 dark:border-violet-700 dark:text-white"
          />
          <input
            value={form.vin}
            onChange={(e) => setForm({ ...form, vin: e.target.value })}
            placeholder="VIN (Optional)"
            className="border rounded px-3 py-2 dark:bg-violet-950/50 dark:border-violet-700 dark:text-white"
          />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded col-span-2">
            {editVehicle ? 'Update' : 'Create'} Vehicle
          </button>
        </form>
      )}

      {loading ? (
        <p className="dark:text-white/80">Loading...</p>
      ) : (
        <div className="bg-white dark:bg-violet-900/40 rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-violet-950/50">
              <tr>
                <th className="text-left p-3 dark:text-white">License Plate</th>
                <th className="text-left p-3 dark:text-white">Make/Model</th>
                <th className="text-left p-3 dark:text-white">Year</th>
                <th className="text-left p-3 dark:text-white">Owner</th>
                <th className="text-left p-3 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t dark:border-violet-700">
                  <td className="p-3 font-semibold dark:text-white">{vehicle.licensePlate}</td>
                  <td className="p-3 dark:text-white/80">{vehicle.make} {vehicle.model}</td>
                  <td className="p-3 dark:text-white/80">{vehicle.year}</td>
                  <td className="p-3 dark:text-white/80">{vehicle.client?.name || 'Unknown'}</td>
                  <td className="p-3">
                    <button onClick={() => handleEdit(vehicle)} className="text-blue-600 dark:text-gold-400 mr-2">Edit</button>
                    <button onClick={() => handleDelete(vehicle.id)} className="text-red-600 dark:text-red-400">Delete</button>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500 dark:text-white/60">No vehicles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
