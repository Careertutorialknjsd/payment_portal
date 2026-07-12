import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, GraduationCap, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const StudentLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/student/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 px-4">
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-300/30 blur-3xl animate-blob" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass relative z-10 w-full max-w-md rounded-3xl p-8 shadow-card"
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 text-white shadow-glow">
            <GraduationCap size={26} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Student Login</h1>
          <p className="mt-1 text-sm text-gray-500">Access your fee dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="email"
              required
              autoComplete="off"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type={showPass ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="shimmer-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-70"
          >
            {loading ? <Loader size={18} /> : 'Login'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          New student?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Register here
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          <Link to="/admin/login" className="hover:underline">
            Admin? Login here
          </Link>
        </p>
        <p className="mt-4 text-center text-xs">
          <Link to="/" className="text-gray-400 hover:underline">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
