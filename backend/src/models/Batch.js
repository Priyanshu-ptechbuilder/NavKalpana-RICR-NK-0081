const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: true,
  },
  batchType: {
    type: String,
    required: true,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
  progress: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'upcoming'],
    default: 'ongoing',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Batch', batchSchema);
