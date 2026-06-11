import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'MECHANIC') return <Navigate to="/mechanic/appointments" replace />;
  return <Navigate to="/client/appointments" replace />;
}