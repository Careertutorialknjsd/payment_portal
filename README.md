# Career Tutorial — Student Fee Payment Portal (No Payment Gateway)

A full MERN stack fee-collection system using **static/dynamic UPI QR codes + screenshot upload + admin verification** — no Razorpay or any payment gateway required. 100% free to run, no transaction charges.

> ⚠️ Important: Because there's no payment gateway, the site **cannot auto-detect** whether a UPI payment succeeded. Students pay via any UPI app, upload a screenshot as proof, and the admin manually approves it. This is the same workflow used by most small coaching institutes.

---

## ✨ Features

**Student**
- Register / Login (JWT auth) — no self-declared fee amount at signup
- Dashboard with Total Requested, Total Paid, Total Due (aggregated across all months)
- Sees fee requests month-by-month, exactly as set by the admin (e.g. July 2026 — ₹1000)
- Can pay any month — including old due months — by selecting it from the list
- Payment amount is **hard-capped** at that month's due amount; cannot overpay a month
- Auto-generated dynamic UPI QR code scoped to the selected month and amount
- Upload payment screenshot + optional UTR number
- Payment history table with month, live status (Pending / Approved / Rejected)
- Download PDF receipt once approved
- Automated email at every stage: welcome, new fee request added, payment submitted, approved (with PDF receipt attached), rejected, and payment reminders

**Admin**
- Separate secure login
- Dashboard stats: Pending / Approved / Rejected counts, total students, total collection, today's collection
- View all pending/approved/rejected payments (with month shown), view screenshot, Approve/Reject with one click
- **Add a monthly fee for any student** — pick the student, pick the month, set the amount. Student is emailed instantly.
- **Manage Fees** panel per student: full month-wise fee history, and a one-click **Send Reminder** button for any month still due
- Search students & payments by name/email/course
- Full student directory with requested/paid/due totals per student

**Design**
- Tailwind CSS with a custom glassmorphism theme, gradient branding, animated blobs, smooth Framer Motion transitions, tab-switch animations, and shimmer buttons — built to feel premium, not templated.

---

## 🧱 Tech Stack

| Layer     | Tech                                             |
|-----------|---------------------------------------------------|
| Frontend  | React (Vite), Tailwind CSS, Framer Motion, React Router, Axios, Lucide Icons, react-hot-toast |
| Backend   | Node.js, Express                                  |
| Database  | MongoDB (Mongoose)                                |
| Auth      | JWT + bcrypt                                      |
| Uploads   | Multer (stores screenshots in `server/uploads`)   |
| PDF       | pdfkit (auto-generates receipt PDFs)              |
| Email     | Nodemailer (Gmail SMTP or any SMTP provider)       |
| QR Code   | `qrcode` npm package (generates UPI deep-link QR) |

---

## 📁 Folder Structure

```
student-payment/
├── server/                  # Express backend
│   ├── config/db.js
│   ├── models/               # Student, Admin, Payment
│   ├── middleware/           # auth.js (JWT), upload.js (Multer)
│   ├── routes/                # auth, student, admin, payment
│   ├── utils/                 # sendEmail.js, generateReceipt.js
│   ├── uploads/                # payment screenshots (gitignored)
│   ├── server.js
│   └── .env.example
└── client/                   # React frontend
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/        # Navbar, QRPay, PaymentHistory, ScreenshotModal, etc.
    │   └── pages/              # Home, StudentLogin, StudentRegister, AdminLogin,
    │                            # StudentDashboard, AdminDashboard
    └── vite.config.js
```

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js 18+
- A MongoDB database (free tier on [MongoDB Atlas](https://www.mongodb.com/atlas) works great)
- A Gmail account (or any SMTP provider) for sending emails

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/student-payment
JWT_SECRET=some_long_random_string
JWT_EXPIRE=7d

# The very first admin account is auto-created on first server start
ADMIN_EMAIL=admin@careertutorial.com
ADMIN_PASSWORD=ChangeThisPassword123
ADMIN_NAME=Career Tutorial Admin

UPI_ID=samarthdixit@oksbi
UPI_PAYEE_NAME=Career Tutorial

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password
EMAIL_FROM="Career Tutorial <youremail@gmail.com>"
```

> **Gmail App Password**: Go to your Google Account → Security → 2-Step Verification → App Passwords → generate one for "Mail". Use that 16-character password as `EMAIL_PASS` (not your normal Gmail password).

Run the backend:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

On first boot, it automatically creates one admin account from your `.env` values — log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Visit **http://localhost:5173**. The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so no CORS config is needed locally.

---

## 🔑 How Payments Work (No Gateway)

1. **Admin adds a monthly fee** for a student from the "Manage Fees" panel — e.g. ₹1000 for July 2026. The student is emailed instantly.
2. Student logs in → dashboard shows every month as a card (Pending / Partial / Paid), including any older unpaid months.
3. Student picks a month to pay → enters/confirms the amount (capped at that month's due amount — e.g. can't pay more than ₹1000 if that's what's due) → backend generates a `upi://pay?...` deep link and renders it as a QR code (via the `qrcode` package).
4. Student scans with any UPI app (GPay, PhonePe, Paytm, BHIM) and pays directly to your UPI ID — money goes straight to your bank account, no middleman.
5. Student clicks **"I Have Paid"**, uploads a screenshot (+ optional UTR number), which is stored via Multer and a `Payment` document is created with `status: "Pending"`, linked to that month's fee request. A confirmation email goes out immediately.
6. Admin reviews the screenshot in the dashboard and clicks **Approve** or **Reject**.
   - On **Approve**: a unique receipt ID is generated, that month's `amountPaid` is updated (and its status flips to Partial/Paid), a PDF receipt is generated with `pdfkit`, and it's emailed to the student automatically. The receipt also becomes downloadable from the student's dashboard.
   - On **Reject**: the student gets an email explaining the payment couldn't be verified, and can resubmit for the same month.
7. If a month stays unpaid, admin can hit **Send Reminder** anytime from the "Manage Fees" panel — this emails the student a reminder with the exact amount still due for that month.

---

## 🌐 Deployment

| Part     | Suggested platform |
|----------|---------------------|
| Frontend | Vercel / Netlify    |
| Backend  | Render / Railway     |
| Database | MongoDB Atlas        |
| Uploads  | For production, consider moving `uploads/` to a persistent volume or cloud storage (e.g. Cloudinary/S3) since most free hosts have ephemeral filesystems — Render's free tier wipes local files on redeploy. |

Steps:
1. Push `server/` and `client/` as two separate deployments (or a monorepo with two services).
2. On Render (backend): set the root directory to `server`, build command `npm install`, start command `npm start`, and add all `.env` variables in the dashboard.
3. On Vercel (frontend): set root directory to `client`, and add an environment-based API base URL if you're not using the Vite proxy in production (point `client/src/api/axios.js`'s `baseURL` to your deployed backend URL, e.g. `https://your-api.onrender.com/api`).
4. Update `CLIENT_URL` in the backend `.env` to your deployed frontend URL (for CORS).

---

## 🔒 Security Notes
- Passwords hashed with bcrypt, JWT-based auth, Helmet for HTTP headers.
- File upload restricted to images/PDF, 5MB max, via Multer.
- Server-side validation via `express-validator` on all auth routes.
- Consider adding rate-limiting (`express-rate-limit`) on auth routes before going to production.

---

## 🧩 Optional Enhancements
- WhatsApp confirmation via a WhatsApp Business API/Twilio integration
- SMS OTP verification at registration
- Admin roles (super-admin vs staff)
- Export payments/students to Excel/CSV
- Multiple UPI IDs per course/branch
#   P a y m e n t _ P a g e  
 #   P a y m e n t _ P a g e  
 #   p a y m e n t _ p o r t a l  
 