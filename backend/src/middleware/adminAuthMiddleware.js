const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Middleware to verify admin JWT token
 * Validates role = "admin" and attaches admin to req
 */
const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Requires Admin account' });
    }

    // Fetch admin detail if needed
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found' });
    }

    // Attach to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Verify admin token error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyAdminToken;
