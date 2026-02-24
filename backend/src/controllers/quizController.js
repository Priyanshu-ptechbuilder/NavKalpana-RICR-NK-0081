const Quiz = require('../models/Quiz');
const Batch = require('../models/Batch');

const createQuiz = async (req, res) => {
  try {
    const { title, batch, lesson, duration, totalMarks, attemptLimit, questions } = req.body;
    if (!title || !batch || duration === undefined || totalMarks === undefined) {
      return res.status(400).json({ message: 'title, batch, duration and totalMarks are required' });
    }
    const batchExists = await Batch.findById(batch);
    if (!batchExists) return res.status(400).json({ message: 'Batch not found' });
    const quiz = await Quiz.create({
      title,
      batch,
      lesson: lesson || '',
      duration: Number(duration),
      totalMarks: Number(totalMarks),
      attemptLimit: attemptLimit != null ? Number(attemptLimit) : 1,
      questions: Array.isArray(questions) ? questions : [],
      createdBy: req.user?.id,
    });
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const { batch, lesson } = req.query;
    const filter = {};
    if (batch) filter.batch = batch;
    if (lesson) filter.lesson = lesson;
    const quizzes = await Quiz.find(filter).populate('batch', 'batchName _id').sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('batch', 'batchName _id');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.batch) {
      const batchExists = await Batch.findById(updates.batch);
      if (!batchExists) return res.status(400).json({ message: 'Batch not found' });
    }
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('batch', 'batchName _id');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz };
