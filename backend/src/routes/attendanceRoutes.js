const express = require('express');
const { markAttendance, getAttendance, updateAttendance } = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', markAttendance);
router.get('/', getAttendance);
router.put('/:id', updateAttendance);

module.exports = router;
