import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState('');
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form.email, form.password, form.name, form.phone);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-violet-900/40 p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Register</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" required className="w-full border rounded px-3 py-2 mb-3 dark:bg-violet-950/50 dark:border-violet-700 dark:text-white" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" required className="w-full border rounded px-3 py-2 mb-3 dark:bg-violet-950/50 dark:border-violet-700 dark:text-white" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" required minLength={6} className="w-full border rounded px-3 py-2 mb-3 dark:bg-violet-950/50 dark:border-violet-700 dark:text-white" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="w-full border rounded px-3 py-2 mb-4 dark:bg-violet-950/50 dark:border-violet-700 dark:text-white" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
        <p className="text-center text-sm mt-4 dark:text-white/80">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline dark:text-gold-400">Login</Link>
        </p>
      </form>
    </div>
  );
}