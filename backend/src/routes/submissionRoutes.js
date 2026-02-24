const express = require('express');
const {
  createSubmission,
  getSubmissions,
} = require('../controllers/submissionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createSubmission);
router.get('/', getSubmissions);

module.exports = router;
