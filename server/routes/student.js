const express = require('express');
const QRCode = require('qrcode');
const { protect } = require('../middleware/auth');
const Payment = require('../models/Payment');
const FeeRequest = require('../models/FeeRequest');

const router = express.Router();

// GET /api/student/me - profile
router.get('/me', protect('student'), async (req, res) => {
  res.json({ user: { ...req.student.toObject(), role: 'student' } });
});

// GET /api/student/fee-requests - all months admin has requested fees for, newest first
router.get('/fee-requests', protect('student'), async (req, res) => {
  try {
    const feeRequests = await FeeRequest.find({ student: req.student._id }).sort({ month: -1 });
    res.json({ feeRequests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee requests', error: err.message });
  }
});

// GET /api/student/qr?feeRequestId=xxx&amount=500
// Generates a UPI QR code. The amount can never exceed what's still due for that month.
router.get('/qr', protect('student'), async (req, res) => {
  try {
    const { feeRequestId } = req.query;
    if (!feeRequestId) return res.status(400).json({ message: 'feeRequestId is required' });

    const feeRequest = await FeeRequest.findOne({ _id: feeRequestId, student: req.student._id });
    if (!feeRequest) return res.status(404).json({ message: 'Fee request not found' });

    const amountDue = Math.max(feeRequest.amount - feeRequest.amountPaid, 0);
    if (amountDue <= 0) return res.status(400).json({ message: 'This month is already fully paid' });

    let amount = Number(req.query.amount) || amountDue;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (amount > amountDue) {
      return res.status(400).json({ message: `Amount cannot exceed the due amount of ₹${amountDue} for ${feeRequest.monthLabel}` });
    }

    const upiId = process.env.UPI_ID;
    const payeeName = process.env.UPI_PAYEE_NAME || 'Career Tutorial';
    const note = `${feeRequest.monthLabel}-${req.student._id.toString().slice(-6)}`;

    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      payeeName
    )}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    const qrDataUrl = await QRCode.toDataURL(upiString, {
      width: 320,
      margin: 1,
      color: { dark: '#1f2937', light: '#ffffff' },
    });

    res.json({ qr: qrDataUrl, upiString, amount, amountDue, upiId, payeeName, monthLabel: feeRequest.monthLabel });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate QR code', error: err.message });
  }
});

// GET /api/student/payments - payment history for logged-in student
router.get('/payments', protect('student'), async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.student._id }).sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment history', error: err.message });
  }
});

module.exports = router;
