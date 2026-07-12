import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { QrCode, UploadCloud, CheckCircle2, IndianRupee, CalendarDays } from 'lucide-react';
import api from '../api/axios';
import Loader from './Loader';

// feeRequest: the specific month's fee entry the student chose to pay against.
// The amount a student can pay is hard-capped at feeRequest.amountDue — never more.
const QRPay = ({ feeRequest, onPaymentSubmitted }) => {
  const amountDue = Math.max(feeRequest.amount - feeRequest.amountPaid, 0);
  const [amount, setAmount] = useState(amountDue);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQR = async (amt) => {
    setQrLoading(true);
    try {
      const { data } = await api.get(`/student/qr?feeRequestId=${feeRequest._id}&amount=${amt}`);
      setQrData(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    setAmount(amountDue);
    fetchQR(amountDue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeRequest._id]);

  const handleAmountChange = (e) => {
    let val = Number(e.target.value);
    if (val > amountDue) val = amountDue; // hard cap — cannot exceed month's due amount
    if (val < 0) val = 0;
    setAmount(val);
  };

  const handleAmountBlur = () => {
    if (!amount || amount <= 0) {
      setAmount(amountDue);
      fetchQR(amountDue);
    } else {
      fetchQR(amount);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please upload your payment screenshot');
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount');
    if (Number(amount) > amountDue) return toast.error(`You cannot pay more than ₹${amountDue} for this month`);

    const formData = new FormData();
    formData.append('feeRequestId', feeRequest._id);
    formData.append('amount', amount);
    formData.append('screenshot', file);
    if (utr) formData.append('utr', utr);

    setSubmitting(true);
    try {
      await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Payment submitted! Awaiting admin approval.');
      setFile(null);
      setPreview(null);
      setUtr('');
      onPaymentSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
        <CalendarDays size={16} /> Paying for {feeRequest.monthLabel} — Due: ₹{amountDue} of ₹{feeRequest.amount}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* QR Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6 shadow-card"
        >
          <div className="mb-4 flex items-center gap-2">
            <QrCode className="text-brand-600" size={20} />
            <h3 className="font-bold text-gray-800">Pay via UPI QR</h3>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Amount to Pay (₹) — max ₹{amountDue} for this month
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="number"
                min="1"
                max={amountDue}
                value={amount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400">
              You can pay this month's due amount in full or in part — but never more than ₹{amountDue}.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-6">
            <AnimatePresence mode="wait">
              {qrLoading ? (
                <motion.div key="loading" className="flex h-56 w-56 items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
                </motion.div>
              ) : qrData ? (
                <motion.img
                  key="qr"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={qrData.qr}
                  alt="UPI QR Code"
                  className="h-56 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-md"
                />
              ) : (
                <div className="flex h-56 w-56 items-center justify-center text-center text-xs text-gray-400">
                  Enter an amount to generate your QR code
                </div>
              )}
            </AnimatePresence>
            {qrData && (
              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-gray-700">₹{qrData.amount}</p>
                <p className="text-xs text-gray-500">to {qrData.payeeName} ({qrData.upiId})</p>
                <p className="mt-2 text-[11px] text-gray-400">Scan with any UPI app — GPay, PhonePe, Paytm, BHIM</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6 shadow-card"
        >
          <div className="mb-4 flex items-center gap-2">
            <UploadCloud className="text-brand-600" size={20} />
            <h3 className="font-bold text-gray-800">Submit Payment Proof</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              htmlFor="screenshot"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 p-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
            >
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.img
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={preview}
                    alt="Screenshot preview"
                    className="max-h-48 rounded-lg object-contain shadow"
                  />
                ) : (
                  <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <UploadCloud className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm font-medium text-gray-600">Click to upload screenshot</p>
                    <p className="mt-1 text-xs text-gray-400">JPG, PNG or PDF, up to 5MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <input id="screenshot" type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
            </label>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                UPI Reference / UTR Number (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 402611223344"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="shimmer-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-70"
            >
              {submitting ? <Loader size={18} /> : (
                <>
                  <CheckCircle2 size={16} /> I Have Paid — Submit
                </>
              )}
            </motion.button>
            <p className="text-center text-[11px] text-gray-400">
              Your payment will be verified by admin within 24 hours. You'll get an email confirmation once approved.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default QRPay;
