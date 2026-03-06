const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  lesson: {
    type: String,
    default: '',
  },
  submissionType: {
    type: String,
    default: 'PDF',
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  submissions: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      fileUrl: String,
      submittedAt: Date,
      marks: Number,
      feedback: String,
      status: {
        type: String,
        enum: ["Not Submitted", "Submitted", "Late", "Evaluated"],
        default: "Submitted"
      }
    }
  ]
});

module.exports = mongoose.model('Assignment', assignmentSchema);
