import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', form);
      login(data.token, data.user);
      toast.success(`Welcome, ${data.user.name}`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-brand-950 px-4">
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl animate-blob" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-glow">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Console</h1>
          <p className="mt-1 text-sm text-gray-400">Manage payments &amp; students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
            <input
              type="email"
              required
              autoComplete="off"
              placeholder="Admin email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
            <input
              type={showPass ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-10 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-70"
          >
            {loading ? <Loader size={18} /> : 'Login as Admin'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          <Link to="/" className="hover:underline">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
