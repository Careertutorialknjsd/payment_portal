import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle } from 'lucide-react';

const ScreenshotModal = ({ payment, onClose, onApprove, onReject }) => {
  if (!payment) return null;

  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(payment.screenshot);

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
          className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        >
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>

          <h3 className="mb-1 text-lg font-bold text-gray-800">{payment.studentName}</h3>
          <p className="mb-4 text-sm text-gray-500">
            {payment.course} • {payment.monthLabel} • ₹{payment.amount} {payment.utr && `• UTR: ${payment.utr}`}
          </p>

          <div className="mb-5 flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {isImage ? (
              <img src={payment.screenshot} alt="Payment proof" className="max-h-96 w-full object-contain" />
            ) : (
              <a
                href={payment.screenshot}
                target="_blank"
                rel="noreferrer"
                className="p-10 text-sm font-semibold text-brand-600 hover:underline"
              >
                Open PDF Proof
              </a>
            )}
          </div>

          {payment.status === 'Pending' && (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onApprove(payment)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <CheckCircle2 size={16} /> Approve
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onReject(payment)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                <XCircle size={16} /> Reject
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScreenshotModal;
