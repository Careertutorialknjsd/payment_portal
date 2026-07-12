const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    feeRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeRequest', required: true },
    studentName: { type: String, required: true },
    course: { type: String, required: true },
    month: { type: String, required: true },
    monthLabel: { type: String, required: true },
    amount: { type: Number, required: true },
    utr: { type: String, trim: true }, // optional UPI reference number student can enter
    screenshot: { type: String, required: true }, // file path
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    rejectionReason: { type: String },
    receiptId: { type: String, unique: true, sparse: true },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
