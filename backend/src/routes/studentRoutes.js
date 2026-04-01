const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/studentController');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('student'));

router.get('/dashboard', getStudentDashboard);
router.get('/attendance', getStudentAttendance);
router.get('/assignments', getStudentAssignments);
router.post('/assignments/:id/submit', submitAssignment);
router.get('/quizzes', getStudentQuizzes);
router.get('/quizzes/:id', getQuizById);
router.post('/quizzes/:id/attempt', attemptQuiz);
router.get('/results', getStudentResults);
router.get('/batch', getStudentBatch);
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.put('/profile/password', updateStudentPassword);

module.exports = router;
