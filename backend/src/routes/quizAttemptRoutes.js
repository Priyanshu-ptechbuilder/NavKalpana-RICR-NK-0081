const express = require('express');
const { submitAttempt, getAttempts } = require('../controllers/quizAttemptController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.post('/', submitAttempt);
router.get('/', getAttempts);

module.exports = router;
