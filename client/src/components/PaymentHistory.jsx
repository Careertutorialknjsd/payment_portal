import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Download, Clock, CheckCircle2, XCircle, Receipt } from 'lucide-react';
import api from '../api/axios';

const statusConfig = {
  Pending: { icon: Clock, className: 'status-pending' },
  Approved: { icon: CheckCircle2, className: 'status-approved' },
  Rejected: { icon: XCircle, className: 'status-rejected' },
};

const PaymentHistory = ({ payments }) => {
  const handleDownload = async (payment) => {
    try {
      const res = await api.get(`/payments/${payment._id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${payment.receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download receipt');
    }
  };

  if (!payments?.length) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center shadow-card">
        <Receipt className="mb-3 text-gray-300" size={40} />
        <p className="text-sm font-medium text-gray-500">No payments yet</p>
        <p className="text-xs text-gray-400">Your submitted payments will appear here</p>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden rounded-2xl shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-white/50 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Month</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">UTR</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => {
              const cfg = statusConfig[p.status];
              return (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-100 transition hover:bg-brand-50/40"
                >
                  <td className="px-5 py-3.5 text-gray-600">
                    {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-700">{p.monthLabel}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">₹{p.amount}</td>
                  <td className="px-5 py-3.5 text-gray-500">{p.utr || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.className}`}>
                      <cfg.icon size={12} /> {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {p.status === 'Approved' ? (
                      <button
                        onClick={() => handleDownload(p)}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
                      >
                        <Download size={12} /> Receipt
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
