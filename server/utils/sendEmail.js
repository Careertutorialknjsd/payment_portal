const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Send an email. Fails silently (logs error) so a broken email config
 * never blocks a core action like registration or payment approval.
 */
const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email not configured - skipping email send to', to);
      return;
    }
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const brandHeader = () => `
  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;font-family:Arial,sans-serif;font-size:22px;">${process.env.UPI_PAYEE_NAME || 'Career Tutorial'}</h1>
  </div>
`;

const wrapper = (bodyHtml) => `
  <div style="max-width:520px;margin:0 auto;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:12px;overflow:hidden;">
    ${brandHeader()}
    <div style="padding:28px;color:#1f2937;">
      ${bodyHtml}
    </div>
    <div style="padding:16px 28px;background:#f9fafb;color:#9ca3af;font-size:12px;text-align:center;">
      This is an automated message. Please do not reply to this email.
    </div>
  </div>
`;

const templates = {
  welcome: (name, course) =>
    wrapper(`
      <h2 style="margin-top:0;">Welcome, ${name}! 🎉</h2>
      <p>Your account has been created successfully for <strong>${course}</strong>.</p>
      <p>You can now log in to your student dashboard, view your fees, and make payments via UPI QR code.</p>
    `),
  paymentSubmitted: (name, amount) =>
    wrapper(`
      <h2 style="margin-top:0;">Payment Submitted ✅</h2>
      <p>Hi ${name}, we've received your payment proof of <strong>₹${amount}</strong>.</p>
      <p>Status: <strong style="color:#d97706;">Pending Verification</strong></p>
      <p>Our team will verify your payment shortly and you'll receive a confirmation email with your receipt.</p>
    `),
  paymentApproved: (name, amount, receiptId) =>
    wrapper(`
      <h2 style="margin-top:0;">Payment Approved 🎉</h2>
      <p>Hi ${name}, your payment of <strong>₹${amount}</strong> has been verified and approved.</p>
      <p>Receipt ID: <strong>${receiptId}</strong></p>
      <p>Your official receipt is attached to this email as a PDF. You can also download it anytime from your dashboard.</p>
    `),
  paymentRejected: (name, amount, reason) =>
    wrapper(`
      <h2 style="margin-top:0;">Payment Rejected ⚠️</h2>
      <p>Hi ${name}, unfortunately your payment submission of <strong>₹${amount}</strong> could not be verified.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please re-check your screenshot and resubmit, or contact the office for help.</p>
    `),
  feeRequestCreated: (name, monthLabel, amount) =>
    wrapper(`
      <h2 style="margin-top:0;">New Fee Request 📋</h2>
      <p>Hi ${name}, a fee of <strong>₹${amount}</strong> has been added for <strong>${monthLabel}</strong>.</p>
      <p>Please log in to your dashboard, scan the UPI QR code, and upload your payment screenshot to complete the payment.</p>
    `),
  feeReminder: (name, monthLabel, amountDue) =>
    wrapper(`
      <h2 style="margin-top:0;">Payment Reminder ⏰</h2>
      <p>Hi ${name}, this is a friendly reminder that <strong>₹${amountDue}</strong> is still due for <strong>${monthLabel}</strong>.</p>
      <p>Please log in to your dashboard and complete the payment at your earliest convenience.</p>
    `),
};

module.exports = { sendEmail, templates };
