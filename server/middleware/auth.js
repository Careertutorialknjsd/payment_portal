const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// Verifies token and loads the user; requires a specific role if provided
const protect = (role) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (role && decoded.role !== role) {
      return res.status(403).json({ message: 'Access denied for this role' });
    }

    if (decoded.role === 'student') {
      const student = await Student.findById(decoded.id).select('-password');
      if (!student) return res.status(401).json({ message: 'Student not found' });
      req.student = student;
    } else if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) return res.status(401).json({ message: 'Admin not found' });
      req.admin = admin;
    }

    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };
