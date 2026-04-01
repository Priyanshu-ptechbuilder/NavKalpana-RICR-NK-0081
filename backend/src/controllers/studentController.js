const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Batch = require('../models/Batch');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');

// --- Dashboard ---
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const [attendancePresent, attendanceAbsent, totalAssignments, submittedAssignments, upcomingDeadlines] = await Promise.all([
      Attendance.countDocuments({ student: studentId, status: 'present' }),
      Attendance.countDocuments({ student: studentId, status: 'absent' }),
      Assignment.countDocuments({ batch: student.batchId }),
      Submission.countDocuments({ student: studentId }),
      Assignment.find({ batch: student.batchId, dueDate: { $gte: new Date() } }).sort({ dueDate: 1 }).limit(5)
    ]);

    const stats = {
      name: student.name,
      attendance: attendancePresent,
      absent: attendanceAbsent,
      assignments: { total: totalAssignments, submitted: submittedAssignments },
      upcomingDeadlines
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Attendance ---
const getStudentAttendance = async (req, res) => {
  try {
    const { month } = req.query; // Expecting YYYY-MM
    const studentId = req.user.id;
    
    let filter = { student: studentId };
    if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter).sort({ date: 1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Assignments ---
const getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);
    
    const assignments = await Assignment.find({ batch: student.batchId }).lean();
    const submissions = await Submission.find({ student: studentId }).lean();

    const merged = assignments.map(a => ({
      ...a,
      submission: submissions.find(s => s.assignment.toString() === a._id.toString()) || null
    }));

    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const assignmentId = req.params.id;
    
    const submission = await Submission.findOneAndUpdate(
      { student: studentId, assignment: assignmentId },
      { submittedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Quizzes ---
const getStudentQuizzes = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);
    
    const quizzes = await Quiz.find({ batch: student.batchId }).select('-questions').lean();
    const attempts = await QuizAttempt.find({ student: studentId }).lean();

    const merged = quizzes.map(q => ({
      ...q,
      attempt: attempts.find(at => at.quiz.toString() === q._id.toString()) || null
    }));

    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const attemptQuiz = async (req, res) => {
  try {
    const studentId = req.user.id;
    const quizId = req.params.id;
    const { answers } = req.body; 

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    answers.forEach(ans => {
        if (!ans) return;
        const question = quiz.questions[ans.questionIndex];
        if (question && question.correctAnswer === ans.selectedAnswer) {
            score += question.marks;
        }
    });

    const attempt = await QuizAttempt.create({
      student: studentId,
      quiz: quizId,
      score,
      totalMarks: quiz.totalMarks,
      answers
    });

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Results ---
const getStudentResults = async (req, res) => {
  try {
    const studentId = req.user.id;
    const attempts = await QuizAttempt.find({ student: studentId }).populate('quiz', 'title').sort({ attemptedAt: 1 });
    
    const chartData = attempts.map(at => ({
      name: (at.quiz?.title || 'Quiz').substring(0, 10),
      score: at.score,
      total: at.totalMarks
    }));

    res.json({ attempts, chartData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Batch Info ---
const getStudentBatch = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId).populate('batchId');
    if (!student || !student.batchId) return res.status(404).json({ message: 'Batch not assigned' });

    const classmates = await Student.find({ batchId: student.batchId._id, _id: { $ne: studentId } }).select('name email phone');
    const teachers = await Teacher.find({ role: 'teacher' }).select('name email');

    res.json({
      batch: student.batchId,
      classmates,
      teachers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Profile ---
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).populate('batchId', 'batchName').select('-password');
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const student = await Student.findByIdAndUpdate(req.user.id, { name, phone }, { new: true }).select('-password');
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const student = await Student.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentDashboard,
  getStudentAttendance,
  getStudentAssignments,
  submitAssignment,
  getStudentQuizzes,
  getQuizById,
  attemptQuiz,
  getStudentResults,
  getStudentBatch,
  getStudentProfile,
  updateStudentProfile,
  updateStudentPassword,
};
