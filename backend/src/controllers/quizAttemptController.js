const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Student = require('../models/Student');
const calculateOGI = require('../utils/calculateOGI');

const submitAttempt = async (req, res) => {
  try {
    const { student, quiz, answers } = req.body;
    if (!student || !quiz || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'student, quiz and answers array are required' });
    }
    const quizDoc = await Quiz.findById(quiz);
    if (!quizDoc) return res.status(404).json({ message: 'Quiz not found' });
    const studentExists = await Student.findById(student);
    if (!studentExists) return res.status(400).json({ message: 'Student not found' });

    const existingCount = await QuizAttempt.countDocuments({ student, quiz });
    if (existingCount >= (quizDoc.attemptLimit || 1)) {
      return res.status(400).json({ message: 'Attempt limit reached for this quiz' });
    }

    let score = 0;
    const questions = quizDoc.questions || [];
    answers.forEach((a) => {
      const q = questions[a.questionIndex];
      if (q && q.correctAnswer === a.selectedAnswer) score += q.marks || 1;
    });
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const attempt = await QuizAttempt.create({
      student,
      quiz,
      score,
      totalMarks: totalMarks || quizDoc.totalMarks,
      answers,
    });

    // Mirror to Quiz.attempts array
    await Quiz.findByIdAndUpdate(quiz, {
      $push: {
        attempts: {
          studentId: student,
          score,
          answers,
          attemptedAt: new Date()
        }
      }
    });

    // Recalculate OGI
    await calculateOGI(student);

    res.status(201).json({ message: 'Attempt submitted', attempt });
  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttempts = async (req, res) => {
  try {
    const { quiz, student } = req.query;
    const filter = {};
    if (quiz) filter.quiz = quiz;
    if (student) filter.student = student;
    const attempts = await QuizAttempt.find(filter)
      .populate('student', 'name enrollmentId')
      .populate('quiz', 'title totalMarks')
      .sort({ attemptedAt: -1 });
    res.status(200).json(attempts);
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitAttempt, getAttempts };
