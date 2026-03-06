const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Admin Login
 * POST /api/admin/login
 */
const adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ message: 'adminId and password are required' });
    }

    // Find admin by adminId
    const admin = await Admin.findOne({ adminId });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid adminId or password' });
    }

    // Verify role is admin
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid adminId or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: admin._id, 
        role: "admin",
        privilegeLevel: admin.privilegeLevel 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        privilegeLevel: admin.privilegeLevel
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  adminLogin,
};
