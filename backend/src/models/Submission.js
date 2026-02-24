const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  marksObtained: {
    type: Number,
  },
  feedback: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// One submission per student per assignment
submissionSchema.index({ student: 1, assignment: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
