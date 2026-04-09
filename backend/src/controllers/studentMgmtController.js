const Student = require('../models/Student');
const Batch = require('../models/Batch');

/**
 * Create a new student
 * POST /api/students
 */
const createStudent = async (req, res) => {
  try {
    const { name, email, course, batch } = req.body;
    let enrollmentNo = req.body.enrollmentNo || req.body.enrollmentId;

    if (!name || !email || !enrollmentNo || !course || !batch) {
      return res.status(400).json({
        message: 'name, email, enrollmentNo, course and batch are required',
      });
    }

    const batchExists = await Batch.findById(batch);
    if (!batchExists) {
      return res.status(400).json({ message: 'Batch not found' });
    }

    const student = new Student({
      name,
      email,
      enrollmentNo,
      course,
      batchId: batch,
      password: await bcrypt.hash('Student@123', 10), // Default password if not provided
    });

    await student.save();
    await student.populate('batchId', 'batchName _id');

    res.status(201).json({
      message: 'Student created successfully',
      student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Enrollment No or Email already exists' });
    }
    res.status(500).json({ message: error.message || 'Failed to create student' });
  }
};

/**
 * Get all students (optional: ?status=, ?course=, ?search=)
 * GET /api/students
 */
const getAllStudents = async (req, res) => {
  try {
    const { status, course, batch, search } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (course) {
      filter.course = course;
    }

    if (batch) {
      filter.batchId = batch;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentNo: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .populate('batchId', 'batchName _id')
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch students' });
  }
};

/**
 * Get a single student by ID
 * GET /api/students/:id
 */
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).populate('batchId', 'batchName _id');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch student' });
  }
};

/**
 * Update a student by ID
 * PUT /api/students/:id
 */
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.batch) {
      const batchExists = await Batch.findById(updates.batch);
      if (!batchExists) {
        return res.status(400).json({ message: 'Batch not found' });
      }
      updates.batchId = updates.batch;
      delete updates.batch;
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('batchId', 'batchName _id');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'enrollmentId already exists' });
    }
    res.status(500).json({ message: error.message || 'Failed to update student' });
  }
};

/**
 * Delete a student by ID
 * DELETE /api/students/:id
 */
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete student' });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
