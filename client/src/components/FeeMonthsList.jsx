import { motion } from 'framer-motion';
import { CalendarDays, Clock, CheckCircle2, AlertCircle, ArrowRight, Bell } from 'lucide-react';

const statusConfig = {
  Pending: { icon: Clock, className: 'status-pending' },
  Partial: { icon: AlertCircle, className: 'status-pending' },
  Paid: { icon: CheckCircle2, className: 'status-approved' },
};

const FeeMonthsList = ({ feeRequests, onSelect }) => {
  if (!feeRequests?.length) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center shadow-card">
        <CalendarDays className="mb-3 text-gray-300" size={40} />
        <p className="text-sm font-medium text-gray-500">No fee requests yet</p>
        <p className="text-xs text-gray-400">Your admin hasn't added any monthly fee for you yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {feeRequests.map((f, i) => {
        const due = Math.max(f.amount - f.amountPaid, 0);
        const cfg = statusConfig[f.status];
        return (
          <motion.div
            key={f._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="glass flex flex-col justify-between rounded-2xl p-5 shadow-card"
          >
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-bold text-gray-800">{f.monthLabel}</p>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.className}`}>
                  <cfg.icon size={12} /> {f.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">Total: ₹{f.amount}</p>
              <p className="text-xs text-gray-500">Paid: ₹{f.amountPaid}</p>
              {due > 0 && <p className="mt-1 text-sm font-bold text-amber-600">Due: ₹{due}</p>}
            </div>

            {due > 0 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(f)}
                className="shimmer-btn mt-4 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white shadow-glow"
              >
                Pay Now <ArrowRight size={13} />
              </motion.button>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 size={13} /> Fully Paid
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default FeeMonthsList;
