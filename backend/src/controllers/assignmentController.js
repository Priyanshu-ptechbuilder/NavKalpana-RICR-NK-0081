const Assignment = require('../models/Assignment');
const Batch = require('../models/Batch');

/**
 * Create a new assignment
 * POST /api/assignments
 */
const createAssignment = async (req, res) => {
  try {
    const { title, description, lesson, submissionType, batch, dueDate, totalMarks } = req.body;

    if (!title || !batch || !dueDate || totalMarks === undefined) {
      return res.status(400).json({
        message: 'title, batch, dueDate and totalMarks are required',
      });
    }

    const batchExists = await Batch.findById(batch);
    if (!batchExists) {
      return res.status(400).json({ message: 'Batch not found' });
    }

    const assignment = await Assignment.create({
      title,
      description: description || '',
      lesson: lesson || '',
      submissionType: submissionType || 'PDF',
      batch,
      dueDate,
      totalMarks: Number(totalMarks),
      createdBy: req.user?.id,
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all assignments (optional filter: ?batch=ID)
 * GET /api/assignments
 */
const getAssignments = async (req, res) => {
  try {
    const { batch, lesson } = req.query;

    const filter = {};
    if (batch) filter.batch = batch;
    if (lesson) filter.lesson = lesson;

    const assignments = await Assignment.find(filter)
      .populate('batch', 'batchName _id')
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update assignment by ID
 * PUT /api/assignments/:id
 */
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.batch) {
      const batchExists = await Batch.findById(updates.batch);
      if (!batchExists) {
        return res.status(400).json({ message: 'Batch not found' });
      }
    }

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('batch', 'batchName _id');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete assignment by ID
 * DELETE /api/assignments/:id
 */
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
};
