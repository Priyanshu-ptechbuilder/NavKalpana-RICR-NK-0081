const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
} = require('../controllers/batchController');

// All routes are protected
router.use(authMiddleware);

router.post('/', createBatch);
router.get('/', getAllBatches);
router.get('/:id', getBatchById);
router.put('/:id', updateBatch);
router.delete('/:id', deleteBatch);

module.exports = router;
