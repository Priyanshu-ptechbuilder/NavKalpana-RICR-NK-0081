const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Assignment = require('../models/Assignment');

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeBatches = await Batch.countDocuments({ status: 'ongoing' });
    const pendingAssignments = await Assignment.countDocuments({ status: 'pending' });

    res.status(200).json({
      totalStudents,
      activeBatches,
      pendingAssignments,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
};
