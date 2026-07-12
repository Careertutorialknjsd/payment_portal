const express = require('express');
const { protect } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const FeeRequest = require('../models/FeeRequest');
const { generateReceiptPDF } = require('../utils/generateReceipt');
const { sendEmail, templates } = require('../utils/sendEmail');

const router = express.Router();

const monthLabelFromKey = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

// GET /api/admin/me
router.get('/me', protect('admin'), async (req, res) => {
  res.json({ user: { ...req.admin.toObject(), role: 'admin' } });
});

// GET /api/admin/stats - dashboard summary
router.get('/stats', protect('admin'), async (req, res) => {
  try {
    const [pending, approvedPayments, rejected, totalStudents] = await Promise.all([
      Payment.countDocuments({ status: 'Pending' }),
      Payment.find({ status: 'Approved' }),
      Payment.countDocuments({ status: 'Rejected' }),
      Student.countDocuments(),
    ]);

    const totalCollection = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todaysCollection = approvedPayments
      .filter((p) => new Date(p.reviewedAt || p.updatedAt) >= startOfDay)
      .reduce((sum, p) => sum + p.amount, 0);

    const feeRequests = await FeeRequest.find();
    const totalDue = feeRequests.reduce((sum, f) => sum + Math.max(f.amount - f.amountPaid, 0), 0);

    res.json({
      pendingCount: pending,
      approvedCount: approvedPayments.length,
      rejectedCount: rejected,
      totalStudents,
      totalCollection,
      todaysCollection,
      totalDue,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
});

// GET /api/admin/payments?status=Pending&search=xyz
router.get('/payments', protect('admin'), async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) filter.status = status;
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { receiptId: { $regex: search, $options: 'i' } },
        { monthLabel: { $regex: search, $options: 'i' } },
      ];
    }
    const payments = await Payment.find(filter).populate('student', 'name email phone course').sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments', error: err.message });
  }
});

// GET /api/admin/students?search=xyz
router.get('/students', protect('admin'), async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const students = await Student.find(filter).sort({ createdAt: -1 }).lean();

    // Attach a fees summary (total requested / paid / due) per student
    const feeRequests = await FeeRequest.find({ student: { $in: students.map((s) => s._id) } });
    const summaryByStudent = {};
    feeRequests.forEach((f) => {
      const key = f.student.toString();
      if (!summaryByStudent[key]) summaryByStudent[key] = { totalRequested: 0, totalPaid: 0 };
      summaryByStudent[key].totalRequested += f.amount;
      summaryByStudent[key].totalPaid += f.amountPaid;
    });

    const studentsWithSummary = students.map((s) => ({
      ...s,
      feesSummary: summaryByStudent[s._id.toString()] || { totalRequested: 0, totalPaid: 0 },
    }));

    res.json({ students: studentsWithSummary });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students', error: err.message });
  }
});

// GET /api/admin/students/:id/fee-requests - a specific student's month-wise fee history
router.get('/students/:id/fee-requests', protect('admin'), async (req, res) => {
  try {
    const feeRequests = await FeeRequest.find({ student: req.params.id }).sort({ month: -1 });
    res.json({ feeRequests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee requests', error: err.message });
  }
});

// POST /api/admin/fee-requests - admin creates/sets a fee amount for a student for a given month
router.post('/fee-requests', protect('admin'), async (req, res) => {
  try {
    const { studentId, month, amount } = req.body; // month format: "YYYY-MM"
    if (!studentId || !month || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'studentId, month and a valid amount are required' });
    }
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const existing = await FeeRequest.findOne({ student: studentId, month });
    if (existing) {
      return res.status(409).json({ message: `A fee request for ${monthLabelFromKey(month)} already exists for this student` });
    }

    const feeRequest = await FeeRequest.create({
      student: studentId,
      month,
      monthLabel: monthLabelFromKey(month),
      amount: Number(amount),
      createdBy: req.admin._id,
    });

    sendEmail({
      to: student.email,
      subject: `New Fee Request - ${feeRequest.monthLabel}`,
      html: templates.feeRequestCreated(student.name, feeRequest.monthLabel, feeRequest.amount),
    });

    res.status(201).json({ message: 'Fee request created and student notified', feeRequest });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create fee request', error: err.message });
  }
});

// PUT /api/admin/fee-requests/:id/remind - send a payment reminder email for a pending/partial month
router.put('/fee-requests/:id/remind', protect('admin'), async (req, res) => {
  try {
    const feeRequest = await FeeRequest.findById(req.params.id).populate('student');
    if (!feeRequest) return res.status(404).json({ message: 'Fee request not found' });

    const amountDue = Math.max(feeRequest.amount - feeRequest.amountPaid, 0);
    if (amountDue <= 0) return res.status(400).json({ message: 'This month is already fully paid, no reminder needed' });

    feeRequest.reminderSentAt = new Date();
    feeRequest.reminderCount = (feeRequest.reminderCount || 0) + 1;
    await feeRequest.save();

    sendEmail({
      to: feeRequest.student.email,
      subject: `Payment Reminder - ${feeRequest.monthLabel}`,
      html: templates.feeReminder(feeRequest.student.name, feeRequest.monthLabel, amountDue),
    });

    res.json({ message: 'Reminder sent successfully', feeRequest });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reminder', error: err.message });
  }
});

// PUT /api/admin/payments/:id/approve
router.put('/payments/:id/approve', protect('admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('student');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.status === 'Approved') return res.status(400).json({ message: 'Payment already approved' });

    const feeRequest = await FeeRequest.findById(payment.feeRequest);
    if (!feeRequest) return res.status(404).json({ message: 'Linked fee request not found' });

    const receiptId = `RCPT-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;

    payment.status = 'Approved';
    payment.receiptId = receiptId;
    payment.reviewedAt = new Date();
    payment.reviewedBy = req.admin._id;
    await payment.save();

    feeRequest.amountPaid = Math.min(feeRequest.amountPaid + payment.amount, feeRequest.amount);
    feeRequest.refreshStatus();
    await feeRequest.save();

    const pdfBuffer = await generateReceiptPDF({
      receiptId: payment.receiptId,
      studentName: payment.studentName,
      course: payment.course,
      amount: payment.amount,
      date: payment.reviewedAt,
      status: 'Approved',
      email: payment.student.email,
      monthLabel: payment.monthLabel,
    });

    sendEmail({
      to: payment.student.email,
      subject: 'Payment Approved - Receipt Attached',
      html: templates.paymentApproved(payment.studentName, payment.amount, payment.receiptId),
      attachments: [{ filename: `Receipt-${payment.receiptId}.pdf`, content: pdfBuffer }],
    });

    res.json({ message: 'Payment approved successfully', payment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve payment', error: err.message });
  }
});

// PUT /api/admin/payments/:id/reject
router.put('/payments/:id/reject', protect('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id).populate('student');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = 'Rejected';
    payment.rejectionReason = reason || 'Payment could not be verified';
    payment.reviewedAt = new Date();
    payment.reviewedBy = req.admin._id;
    await payment.save();

    sendEmail({
      to: payment.student.email,
      subject: 'Payment Rejected',
      html: templates.paymentRejected(payment.studentName, payment.amount, payment.rejectionReason),
    });

    res.json({ message: 'Payment rejected', payment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject payment', error: err.message });
  }
});

module.exports = router;
