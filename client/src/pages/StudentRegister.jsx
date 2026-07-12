import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, BookOpen, GraduationCap } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const fields = [
  { name: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Full Name' },
  { name: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'Email Address' },
  { name: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '9876543210' },
  { name: 'course', label: 'Course', icon: BookOpen, type: 'text', placeholder: 'e.g. Full Stack Web Dev' },
  { name: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Min. 6 characters' },
];

const StudentRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/student/register', form);
      login(data.token, data.user);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50 px-4 py-10">
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-300/30 blur-3xl animate-blob" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass relative z-10 w-full max-w-lg rounded-3xl p-8 shadow-card"
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 text-white shadow-glow">
            <GraduationCap size={26} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Student Account</h1>
          <p className="mt-1 text-sm text-gray-500">Join and start managing your fees online</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" autoComplete="off">
          {fields.map((f) => (
            <div key={f.name} className={f.name === 'password' ? 'sm:col-span-2 relative' : 'relative'}>
              <f.icon className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type={f.type}
                required
                autoComplete={f.name === 'password' ? 'new-password' : 'off'}
                min={f.type === 'number' ? 1 : undefined}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
            </div>
          ))}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="shimmer-btn sm:col-span-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-70"
          >
            {loading ? <Loader size={18} /> : 'Create Account'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Login here
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

export default StudentRegister;
