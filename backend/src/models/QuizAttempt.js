const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedAnswer: { type: Number, required: true },
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  answers: [answerSchema],
  attemptedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
