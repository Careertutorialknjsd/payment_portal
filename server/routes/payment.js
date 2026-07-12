const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Payment = require('../models/Payment');
const FeeRequest = require('../models/FeeRequest');
const { generateReceiptPDF } = require('../utils/generateReceipt');
const { sendEmail, templates } = require('../utils/sendEmail');

const router = express.Router();

// POST /api/payments - student submits a payment screenshot for a specific month's fee request
router.post('/', protect('student'), upload.single('screenshot'), async (req, res) => {
  try {
    const { feeRequestId, amount, utr } = req.body;

    if (!feeRequestId) return res.status(400).json({ message: 'feeRequestId is required' });
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Payment screenshot is required' });
    }

    const feeRequest = await FeeRequest.findOne({ _id: feeRequestId, student: req.student._id });
    if (!feeRequest) return res.status(404).json({ message: 'Fee request not found' });

    const amountDue = Math.max(feeRequest.amount - feeRequest.amountPaid, 0);
    if (amountDue <= 0) {
      return res.status(400).json({ message: 'This month is already fully paid' });
    }
    if (Number(amount) > amountDue) {
      return res.status(400).json({
        message: `You can pay at most ₹${amountDue} for ${feeRequest.monthLabel} — that's the amount due for this month.`,
      });
    }

    const payment = await Payment.create({
      student: req.student._id,
      feeRequest: feeRequest._id,
      studentName: req.student.name,
      course: req.student.course,
      month: feeRequest.month,
      monthLabel: feeRequest.monthLabel,
      amount: Number(amount),
      utr: utr || undefined,
      screenshot: `/uploads/${req.file.filename}`,
      status: 'Pending',
    });

    sendEmail({
      to: req.student.email,
      subject: 'Payment Submitted - Awaiting Verification',
      html: templates.paymentSubmitted(req.student.name, payment.amount),
    });

    res.status(201).json({ message: 'Payment submitted successfully. Awaiting admin approval.', payment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit payment', error: err.message });
  }
});

// GET /api/payments/:id/receipt - download PDF receipt (only if Approved)
router.get('/:id/receipt', protect('student'), async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, student: req.student._id });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.status !== 'Approved') {
      return res.status(400).json({ message: 'Receipt is only available for approved payments' });
    }

    const pdfBuffer = await generateReceiptPDF({
      receiptId: payment.receiptId,
      studentName: payment.studentName,
      course: payment.course,
      amount: payment.amount,
      date: payment.reviewedAt || payment.updatedAt,
      status: payment.status,
      email: req.student.email,
      monthLabel: payment.monthLabel,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt-${payment.receiptId}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate receipt', error: err.message });
  }
});

module.exports = router;
