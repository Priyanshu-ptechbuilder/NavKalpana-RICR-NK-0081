const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index in options
  explanation: { type: String, default: '' },
  marks: { type: Number, default: 1 },
}, { _id: false });

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  lesson: { type: String, default: '' },
  duration: { type: Number, required: true }, // minutes
  totalMarks: { type: Number, required: true },
  attemptLimit: { type: Number, default: 1 },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', quizSchema);
