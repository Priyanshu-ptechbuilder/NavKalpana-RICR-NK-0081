const mongoose = require('mongoose');

const weeklySnapshotSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  weekStartDate: {
    type: Date,
    required: true,
  },
  quizAverage: {
    type: Number,
    default: 0,
  },
  assignmentAverage: {
    type: Number,
    default: 0,
  },
  completionRate: {
    type: Number,
    default: 0,
  },
  submissionConsistency: {
    type: Number,
    default: 0,
  },
  OGI: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('WeeklySnapshot', weeklySnapshotSchema);
