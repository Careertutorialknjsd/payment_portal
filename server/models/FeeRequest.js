const mongoose = require('mongoose');

const feeRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    month: { type: String, required: true }, // format: "YYYY-MM", e.g. "2026-07"
    monthLabel: { type: String, required: true }, // e.g. "July 2026"
    amount: { type: Number, required: true, min: 1 },
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Partial', 'Paid'], default: 'Pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    reminderSentAt: { type: Date },
    reminderCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One fee request per student per month
feeRequestSchema.index({ student: 1, month: 1 }, { unique: true });

feeRequestSchema.virtual('amountDue').get(function () {
  return Math.max(this.amount - this.amountPaid, 0);
});

feeRequestSchema.set('toJSON', { virtuals: true });

feeRequestSchema.methods.refreshStatus = function () {
  if (this.amountPaid >= this.amount) this.status = 'Paid';
  else if (this.amountPaid > 0) this.status = 'Partial';
  else this.status = 'Pending';
};

module.exports = mongoose.model('FeeRequest', feeRequestSchema);
