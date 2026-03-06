const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  enrollmentId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "student",
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  status: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing",
  },
  attendancePercentage: {
    type: Number,
    default: 0,
  },
  OGI: {
    type: Number,
    default: 0,
  },
  growthClassification: {
    type: String,
    default: "Stable",
  },
  createdByTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },
  ranking: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
