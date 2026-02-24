const express = require('express');
const { markAttendance, getAttendance } = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', markAttendance);
router.get('/', getAttendance);

module.exports = router;
