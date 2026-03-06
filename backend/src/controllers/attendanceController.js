const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const calculateOGI = require('../utils/calculateOGI');

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

    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ message: 'status must be present, absent or late' });
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
      remarks: req.body.remarks || '',
      markedBy: req.user?.id,
    });

    // Recalculate attendance percentage for this student
    const totalClasses = await Attendance.countDocuments({ student });
    const presentCount = await Attendance.countDocuments({
      student,
      status: { $in: ['present', 'late'] },
    });
    const percentage =
      totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    await Student.findByIdAndUpdate(student, {
      attendancePercentage: percentage,
    });

    // Recalculate OGI
    await calculateOGI(student);

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
 * Update attendance (same day only)
 * PUT /api/attendance/:id
 */
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const recordDate = new Date(attendance.date);
    recordDate.setUTCHours(0, 0, 0, 0);
    if (recordDate.getTime() !== today.getTime()) {
      return res.status(400).json({ message: 'Can only edit attendance for today' });
    }

    const tenMinsMs = 10 * 60 * 1000;
    if (Date.now() - new Date(attendance.createdAt).getTime() > tenMinsMs) {
      return res.status(400).json({ message: 'Edit allowed only within 10 minutes of submission' });
    }

    if (status && !['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ message: 'status must be present, absent or late' });
    }

    if (status) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;
    await attendance.save();

    const studentId = attendance.student.toString();
    const totalClasses = await Attendance.countDocuments({ student: studentId });
    const presentCount = await Attendance.countDocuments({
      student: studentId,
      status: { $in: ['present', 'late'] },
    });
    const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
    await Student.findByIdAndUpdate(studentId, { attendancePercentage: percentage });

    // Recalculate OGI
    await calculateOGI(studentId);

    res.status(200).json({ message: 'Attendance updated', attendance });
  } catch (error) {
    console.error('Update attendance error:', error);
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
  updateAttendance,
};
