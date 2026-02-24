const express = require('express');
const {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createAssignment);
router.get('/', getAssignments);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

module.exports = router;
