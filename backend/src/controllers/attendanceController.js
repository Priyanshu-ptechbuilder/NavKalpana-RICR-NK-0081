const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Batch = require('../models/Batch');

// Helper: normalize date to start of day (UTC)
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Mark attendance for a student
 * POST /api/attendance
 */
const markAttendance = async (req, res) => {
  try {
    const { student, batch, date, status } = req.body;

    if (!student || !batch || !date || !status) {
      return res.status(400).json({
        message: 'student, batch, date and status are required',
      });
    }

    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ message: 'status must be present or absent' });
    }

    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(400).json({ message: 'Student not found' });
    }

    const batchExists = await Batch.findById(batch);
    if (!batchExists) {
      return res.status(400).json({ message: 'Batch not found' });
    }

    const normalizedDate = getStartOfDay(date);

    const duplicate = await Attendance.findOne({
      student,
      date: normalizedDate,
    });
    if (duplicate) {
      return res.status(400).json({
        message: 'Attendance already marked for this student on this date',
      });
    }

    const attendance = await Attendance.create({
      student,
      batch,
      date: normalizedDate,
      status,
      markedBy: req.user?.id,
    });

    // Recalculate attendance percentage for this student
    const totalClasses = await Attendance.countDocuments({ student });
    const presentCount = await Attendance.countDocuments({
      student,
      status: 'present',
    });
    const percentage =
      totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    await Student.findByIdAndUpdate(student, {
      attendancePercentage: percentage,
    });

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Attendance already marked for this student on this date',
      });
    }
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get attendance list with optional filters
 * GET /api/attendance?student=ID&batch=ID&date=YYYY-MM-DD
 */
const getAttendance = async (req, res) => {
  try {
    const { student, batch, date } = req.query;

    const filter = {};

    if (student) {
      filter.student = student;
    }

    if (batch) {
      filter.batch = batch;
    }

    if (date) {
      const startOfDay = getStartOfDay(date);
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
      filter.date = { $gte: startOfDay, $lt: endOfDay };
    }

    const attendanceList = await Attendance.find(filter)
      .populate('student', 'name enrollmentId')
      .populate('batch', 'batchName')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json(attendanceList);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
};
