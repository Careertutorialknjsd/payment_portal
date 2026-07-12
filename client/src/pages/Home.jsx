import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, QrCode, UploadCloud, BadgeCheck, Mail } from 'lucide-react';

const features = [
  { icon: QrCode, title: 'Instant UPI QR', desc: 'Generate a dynamic UPI QR code for the exact fee amount in one tap.' },
  { icon: UploadCloud, title: 'Upload Proof', desc: 'Pay via any UPI app, then upload your payment screenshot instantly.' },
  { icon: BadgeCheck, title: 'Admin Verified', desc: 'Every payment is manually verified by the institute admin for accuracy.' },
  { icon: Mail, title: 'Email Receipts', desc: 'Get automated email confirmations and a downloadable PDF receipt.' },
];

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50">
      {/* animated background blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute top-40 right-0 h-80 w-80 rounded-full bg-pink-300/30 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-20 pb-10 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 text-white shadow-glow animate-float"
        >
          <GraduationCap size={32} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
        >
          <span className="gradient-text">Career Tutorial</span> Fee Portal
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 max-w-xl text-base text-gray-600 sm:text-lg"
        >
          Pay your course fees via UPI, upload your screenshot, and get a verified digital
          receipt — no payment gateway charges, fully transparent.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="shimmer-btn rounded-xl px-7 py-3 text-sm font-semibold text-white shadow-glow transition hover:animate-shimmer"
            >
              Student Login
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl border-2 border-brand-500 px-7 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
            >
              New Student? Register
            </motion.button>
          </Link>
          <Link to="/admin/login">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <ShieldCheck size={16} /> Admin Login
            </motion.button>
          </Link>
        </motion.div>

        <div className="mt-20 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass rounded-2xl p-6 text-left shadow-card"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <f.icon size={20} />
              </div>
              <h3 className="text-sm font-bold text-gray-800">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-16 text-xs text-gray-400">
          100% legal &amp; free UPI collection workflow — no Razorpay, no gateway charges.
        </p>
      </div>
    </div>
  );
};

export default Home;
