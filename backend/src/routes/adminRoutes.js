const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/adminAuthController');
const verifyAdminToken = require('../middleware/adminAuthMiddleware');

// POST /api/admin/login
router.post('/login', adminLogin);

// Protected Admin Routes (example of usage)
router.get('/me', verifyAdminToken, (req, res) => {
  res.status(200).json(req.admin);
});

module.exports = router;
