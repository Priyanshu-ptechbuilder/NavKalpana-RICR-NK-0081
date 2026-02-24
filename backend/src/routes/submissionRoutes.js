const express = require('express');
const {
  createSubmission,
  getSubmissions,
  updateSubmission,
} = require('../controllers/submissionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createSubmission);
router.get('/', getSubmissions);
router.put('/:id', updateSubmission);

module.exports = router;
