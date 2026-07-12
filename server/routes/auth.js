const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const { sendEmail, templates } = require('../utils/sendEmail');

const router = express.Router();

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ---------------- STUDENT REGISTER ----------------
router.post(
  '/student/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
    body('course').trim().notEmpty().withMessage('Course is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { name, email, password, phone, course } = req.body;

      const existing = await Student.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

      const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
      const avatarColor = colors[Math.floor(Math.random() * colors.length)];

      const student = await Student.create({ name, email, password, phone, course, avatarColor });

      sendEmail({
        to: student.email,
        subject: `Welcome to ${process.env.UPI_PAYEE_NAME || 'Career Tutorial'}`,
        html: templates.welcome(student.name, student.course),
      });

      const token = signToken(student._id, 'student');
      res.status(201).json({
        token,
        user: {
          id: student._id,
          name: student.name,
          email: student.email,
          course: student.course,
          avatarColor: student.avatarColor,
          role: 'student',
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
  }
);

// ---------------- STUDENT LOGIN ----------------
router.post(
  '/student/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Email and password are required' });

    try {
      const { email, password } = req.body;
      const student = await Student.findOne({ email: email.toLowerCase() });
      if (!student) return res.status(401).json({ message: 'Invalid email or password' });

      const isMatch = await student.comparePassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

      const token = signToken(student._id, 'student');
      res.json({
        token,
        user: {
          id: student._id,
          name: student.name,
          email: student.email,
          course: student.course,
          avatarColor: student.avatarColor,
          role: 'student',
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error during login', error: err.message });
    }
  }
);

// ---------------- ADMIN LOGIN ----------------
router.post(
  '/admin/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Email and password are required' });

    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email: email.toLowerCase() });
      if (!admin) return res.status(401).json({ message: 'Invalid email or password' });

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

      const token = signToken(admin._id, 'admin');
      res.json({
        token,
        user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error during login', error: err.message });
    }
  }
);

module.exports = router;
