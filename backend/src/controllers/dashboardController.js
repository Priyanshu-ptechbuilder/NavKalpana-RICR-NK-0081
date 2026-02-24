const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const getDashboardStats = async (req, res) => {
  try {
    // Basic counts (run in parallel)
    const [
      totalBatches,
      totalStudents,
      totalAssignments,
      totalSubmissions,
    ] = await Promise.all([
      Batch.countDocuments(),
      Student.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments(),
    ]);

    // Average attendance percentage from students
    const attendanceResult = await Student.aggregate([
      { $group: { _id: null, avg: { $avg: '$attendancePercentage' } } },
    ]);
    const averageAttendancePercentage = attendanceResult[0]?.avg != null
      ? Math.round(attendanceResult[0].avg)
      : 0;

    // Average marks from submissions (only where marksObtained exists)
    const marksResult = await Submission.aggregate([
      { $match: { marksObtained: { $exists: true, $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$marksObtained' } } },
    ]);
    const averageMarks = marksResult[0]?.avg != null
      ? Math.round(marksResult[0].avg)
      : 0;

    // Top 5 students by average marks (aggregation)
    const topPerformersAgg = await Submission.aggregate([
      { $match: { marksObtained: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$student',
          averageMarks: { $avg: '$marksObtained' },
        },
      },
      { $sort: { averageMarks: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentDoc',
        },
      },
      { $unwind: '$studentDoc' },
      {
        $project: {
          studentId: '$_id',
          name: '$studentDoc.name',
          enrollmentId: '$studentDoc.enrollmentId',
          averageMarks: { $round: ['$averageMarks', 0] },
        },
      },
    ]);

    const topPerformers = topPerformersAgg.map((p) => ({
      studentId: p.studentId,
      name: p.name,
      enrollmentId: p.enrollmentId,
      averageMarks: p.averageMarks,
    }));

    // Assignment completion rate: % of students who have at least one submission
    const studentsWithSubmission = await Submission.distinct('student');
    const assignmentCompletionRate = totalStudents > 0
      ? Math.round((studentsWithSubmission.length / totalStudents) * 100)
      : 0;

    res.status(200).json({
      basicStats: {
        totalBatches,
        totalStudents,
        totalAssignments,
        totalSubmissions,
      },
      attendanceAnalytics: {
        averageAttendancePercentage,
      },
      marksAnalytics: {
        averageMarks,
      },
      topPerformers,
      assignmentCompletionRate,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
};
