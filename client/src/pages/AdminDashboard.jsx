import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  CalendarClock,
  Search,
  Eye,
  Wallet,
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { PageLoader } from '../components/Loader';
import ScreenshotModal from '../components/ScreenshotModal';
import StudentFeesModal from '../components/StudentFeesModal';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4 }}
    className="glass rounded-2xl p-5 shadow-card"
  >
    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-extrabold text-gray-800">{value}</p>
  </motion.div>
);

const statusPill = {
  Pending: 'status-pending',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState('Pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feesStudent, setFeesStudent] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [statsRes, paymentsRes, studentsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/payments'),
        api.get('/admin/students'),
      ]);
      setStats(statsRes.data);
      setPayments(paymentsRes.data.payments);
      setStudents(studentsRes.data.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleApprove = async (payment) => {
    try {
      await api.put(`/admin/payments/${payment._id}/approve`);
      toast.success('Payment approved & receipt emailed');
      setSelected(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (payment) => {
    const reason = window.prompt('Reason for rejection (optional):') || undefined;
    try {
      await api.put(`/admin/payments/${payment._id}/reject`, { reason });
      toast.success('Payment rejected');
      setSelected(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading || !stats) return <PageLoader />;

  const filteredPayments = payments
    .filter((p) => p.status === tab)
    .filter((p) =>
      search ? p.studentName.toLowerCase().includes(search.toLowerCase()) || p.course.toLowerCase().includes(search.toLowerCase()) : true
    );

  const filteredStudents = students.filter((s) =>
    search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.course.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50 pb-16">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-2xl font-extrabold text-gray-800">
          Admin Dashboard
        </motion.h1>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard icon={Clock} label="Pending" value={stats.pendingCount} color="bg-gradient-to-br from-amber-500 to-orange-500" delay={0.02} />
          <StatCard icon={CheckCircle2} label="Approved" value={stats.approvedCount} color="bg-gradient-to-br from-emerald-500 to-emerald-600" delay={0.06} />
          <StatCard icon={XCircle} label="Rejected" value={stats.rejectedCount} color="bg-gradient-to-br from-red-500 to-red-600" delay={0.1} />
          <StatCard icon={Users} label="Students" value={stats.totalStudents} color="bg-gradient-to-br from-brand-500 to-brand-600" delay={0.14} />
          <StatCard icon={IndianRupee} label="Total Collection" value={`₹${stats.totalCollection}`} color="bg-gradient-to-br from-purple-500 to-purple-600" delay={0.18} />
          <StatCard icon={CalendarClock} label="Today's Collection" value={`₹${stats.todaysCollection}`} color="bg-gradient-to-br from-pink-500 to-pink-600" delay={0.22} />
        </div>

        {/* Tabs + Search */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex flex-wrap rounded-xl bg-white/70 p-1 shadow-sm">
            {['Pending', 'Approved', 'Rejected', 'Students'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === t ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === t && (
                  <motion.div layoutId="admin-tab-bg" className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-500 to-purple-500" />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </div>
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass overflow-hidden rounded-2xl shadow-card">
          {tab === 'Students' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-white/50 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3">Requested</th>
                    <th className="px-5 py-3">Paid</th>
                    <th className="px-5 py-3">Due</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                        No students found
                      </td>
                    </tr>
                  )}
                  {filteredStudents.map((s, i) => {
                    const requested = s.feesSummary?.totalRequested || 0;
                    const paid = s.feesSummary?.totalPaid || 0;
                    const due = Math.max(requested - paid, 0);
                    return (
                      <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-gray-100 hover:bg-brand-50/40">
                        <td className="px-5 py-3.5 font-semibold text-gray-800">{s.name}</td>
                        <td className="px-5 py-3.5 text-gray-500">{s.email}</td>
                        <td className="px-5 py-3.5 text-gray-500">{s.phone}</td>
                        <td className="px-5 py-3.5 text-gray-600">{s.course}</td>
                        <td className="px-5 py-3.5 text-gray-700">₹{requested}</td>
                        <td className="px-5 py-3.5 text-emerald-600">₹{paid}</td>
                        <td className="px-5 py-3.5 font-semibold text-amber-600">₹{due}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setFeesStudent(s)}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
                          >
                            <Wallet size={12} /> Manage Fees
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-white/50 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3">Month</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                        No {tab.toLowerCase()} payments
                      </td>
                    </tr>
                  )}
                  {filteredPayments.map((p, i) => (
                    <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-gray-100 hover:bg-brand-50/40">
                      <td className="px-5 py-3.5 text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{p.studentName}</td>
                      <td className="px-5 py-3.5 text-gray-600">{p.course}</td>
                      <td className="px-5 py-3.5 text-gray-600">{p.monthLabel}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-700">₹{p.amount}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPill[p.status]}`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelected(p)}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-700"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <ScreenshotModal payment={selected} onClose={() => setSelected(null)} onApprove={handleApprove} onReject={handleReject} />
      {feesStudent && (
        <StudentFeesModal student={feesStudent} onClose={() => setFeesStudent(null)} onChanged={loadAll} />
      )}
    </div>
  );
};

export default AdminDashboard;
