import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import QRPay from '../components/QRPay';
import FeeMonthsList from '../components/FeeMonthsList';
import PaymentHistory from '../components/PaymentHistory';
import { PageLoader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';

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

const StudentDashboard = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [feeRequests, setFeeRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pay');
  const [selectedMonth, setSelectedMonth] = useState(null);

  const loadData = async () => {
    try {
      const [profileRes, feeRes, paymentsRes] = await Promise.all([
        api.get('/student/me'),
        api.get('/student/fee-requests'),
        api.get('/student/payments'),
      ]);
      setProfile(profileRes.data.user);
      updateUser(profileRes.data.user);
      setFeeRequests(feeRes.data.feeRequests);
      setPayments(paymentsRes.data.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !profile) return <PageLoader />;

  const totalRequested = feeRequests.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = feeRequests.reduce((sum, f) => sum + f.amountPaid, 0);
  const totalDue = Math.max(totalRequested - totalPaid, 0);

  const handlePaymentSubmitted = async () => {
    setSelectedMonth(null);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 pb-16">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-800">
            Hi, {profile.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500">
            <BookOpen size={13} className="mr-1 inline" /> {profile.course}
          </p>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Wallet} label="Total Fees Requested" value={`₹${totalRequested}`} color="bg-gradient-to-br from-brand-500 to-brand-600" delay={0.05} />
          <StatCard icon={CheckCircle2} label="Fees Paid" value={`₹${totalPaid}`} color="bg-gradient-to-br from-emerald-500 to-emerald-600" delay={0.1} />
          <StatCard icon={AlertCircle} label="Fees Due" value={`₹${totalDue}`} color="bg-gradient-to-br from-amber-500 to-orange-500" delay={0.15} />
        </div>

        {/* Tabs */}
        <div className="mb-6 inline-flex rounded-xl bg-white/70 p-1 shadow-sm">
          {[
            { id: 'pay', label: 'Pay Fees' },
            { id: 'history', label: 'Payment History' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setSelectedMonth(null);
              }}
              className={`relative rounded-lg px-5 py-2 text-sm font-semibold transition ${
                tab === t.id ? 'text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === t.id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-500 to-purple-500"
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>

        <motion.div key={`${tab}-${selectedMonth?._id || 'list'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {tab === 'pay' ? (
            selectedMonth ? (
              <div>
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-600"
                >
                  <ArrowLeft size={15} /> Back to all months
                </button>
                <QRPay feeRequest={selectedMonth} onPaymentSubmitted={handlePaymentSubmitted} />
              </div>
            ) : (
              <FeeMonthsList feeRequests={feeRequests} onSelect={setSelectedMonth} />
            )
          ) : (
            <PaymentHistory payments={payments} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
