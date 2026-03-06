const express = require('express');
const router = express.Router();
const { studentLogin, getMe, getStudentDashboard, getMyAssignments, submitAssignment, getMyQuizzes, getQuizDetails, attemptQuiz, getMyAttendance } = require('../controllers/studentAuthController');
const verifyStudentToken = require('../middleware/studentAuthMiddleware');

// POST /api/student/login
router.post('/login', studentLogin);

// Protected Student Routes
router.get('/me', verifyStudentToken, getMe);
router.get('/dashboard', verifyStudentToken, getStudentDashboard);
router.get('/assignments', verifyStudentToken, getMyAssignments);
router.post('/assignments/:id/submit', verifyStudentToken, submitAssignment);
router.get('/quizzes', verifyStudentToken, getMyQuizzes);
router.get('/quizzes/:id', verifyStudentToken, getQuizDetails);
router.post('/quizzes/:id/attempt', verifyStudentToken, attemptQuiz);
router.get('/attendance', verifyStudentToken, getMyAttendance);

module.exports = router;
