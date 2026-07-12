import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, Plus, Bell, Clock, CheckCircle2, AlertCircle, IndianRupee, CalendarDays } from 'lucide-react';
import api from '../api/axios';
import Loader from './Loader';

const statusConfig = {
  Pending: { icon: Clock, className: 'status-pending' },
  Partial: { icon: AlertCircle, className: 'status-pending' },
  Paid: { icon: CheckCircle2, className: 'status-approved' },
};

const currentMonthValue = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const StudentFeesModal = ({ student, onClose, onChanged }) => {
  const [feeRequests, setFeeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(currentMonthValue());
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [remindingId, setRemindingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/students/${student._id}/fee-requests`);
      setFeeRequests(data.feeRequests);
    } catch (err) {
      toast.error('Failed to load fee history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student._id]);

  const handleAddFee = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount');
    setSubmitting(true);
    try {
      await api.post('/admin/fee-requests', { studentId: student._id, month, amount });
      toast.success('Fee request added & student notified via email');
      setAmount('');
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add fee request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemind = async (feeRequest) => {
    setRemindingId(feeRequest._id);
    try {
      await api.put(`/admin/fee-requests/${feeRequest._id}/remind`);
      toast.success(`Reminder sent for ${feeRequest.monthLabel}`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reminder');
    } finally {
      setRemindingId(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        >
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>

          <h3 className="mb-1 text-lg font-bold text-gray-800">{student.name}</h3>
          <p className="mb-5 text-sm text-gray-500">{student.email} • {student.course}</p>

          {/* Add fee form */}
          <form onSubmit={handleAddFee} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-500">
              <Plus size={13} /> Add Monthly Fee
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[130px]">
                <label className="mb-1 block text-[11px] font-semibold text-gray-500">Month</label>
                <div className="relative">
                  <CalendarDays className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-2 text-xs outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-[110px]">
                <label className="mb-1 block text-[11px] font-semibold text-gray-500">Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                  <input
                    type="number"
                    min="1"
                    placeholder="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-2 text-xs outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                className="shimmer-btn flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-glow disabled:opacity-70"
              >
                {submitting ? <Loader size={14} /> : 'Add'}
              </motion.button>
            </div>
          </form>

          {/* Fee history list */}
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Fee History</p>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
          ) : feeRequests.length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-400">No fee requests added yet for this student</p>
          ) : (
            <div className="space-y-2">
              {feeRequests.map((f) => {
                const due = Math.max(f.amount - f.amountPaid, 0);
                const cfg = statusConfig[f.status];
                return (
                  <div key={f._id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{f.monthLabel}</p>
                      <p className="text-[11px] text-gray-500">
                        ₹{f.amountPaid} paid of ₹{f.amount} {due > 0 && <span className="font-semibold text-amber-600">• ₹{due} due</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${cfg.className}`}>
                        <cfg.icon size={11} /> {f.status}
                      </span>
                      {due > 0 && (
                        <button
                          onClick={() => handleRemind(f)}
                          disabled={remindingId === f._id}
                          title="Send email reminder"
                          className="flex items-center gap-1 rounded-lg bg-gray-800 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
                        >
                          {remindingId === f._id ? <Loader size={11} /> : <Bell size={11} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StudentFeesModal;
