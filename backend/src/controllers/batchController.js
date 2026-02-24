const Batch = require('../models/Batch');

/**
 * Create a new batch
 * POST /api/batches
 */
const createBatch = async (req, res) => {
  try {
    const { batchName, batchType, status } = req.body;

    if (!batchName || !batchType) {
      return res.status(400).json({ message: 'batchName and batchType are required' });
    }

    const batch = new Batch({
      batchName,
      batchType,
      status: status || 'ongoing',
    });

    await batch.save();

    res.status(201).json({
      message: 'Batch created successfully',
      batch,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create batch' });
  }
};

/**
 * Get all batches (optional filter by status: ?status=ongoing)
 * GET /api/batches
 */
const getAllBatches = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const batches = await Batch.find(filter).sort({ createdAt: -1 });

    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch batches' });
  }
};

/**
 * Get a single batch by ID
 * GET /api/batches/:id
 */
const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch batch' });
  }
};

/**
 * Update a batch by ID
 * PUT /api/batches/:id
 */
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const batch = await Batch.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update batch' });
  }
};

/**
 * Delete a batch by ID
 * DELETE /api/batches/:id
 */
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findByIdAndDelete(id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete batch' });
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
};
