import { motion } from 'framer-motion';
import { GraduationCap, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 glass shadow-sm"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 text-white shadow-glow">
            {isAdmin ? <ShieldCheck size={20} /> : <GraduationCap size={20} />}
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-gray-800">Career Tutorial</p>
            <p className="text-[11px] leading-none text-gray-500 mt-0.5">
              {isAdmin ? 'Admin Console' : 'Student Portal'}
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: user.avatarColor || '#6366f1' }}
              >
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={14} /> Logout
            </motion.button>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
