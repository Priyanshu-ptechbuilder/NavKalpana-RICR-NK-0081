const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const {
  createTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher,
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} = require('../controllers/adminController');

const router = express.Router();

// All routes are protected by admin role
router.use(authMiddleware);
router.use(requireRole('admin'));

// Teacher CRUD
router.post('/teachers', createTeacher);
router.get('/teachers', getTeachers);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Student CRUD
router.post('/students', createStudent);
router.get('/students', getStudents);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

module.exports = router;
