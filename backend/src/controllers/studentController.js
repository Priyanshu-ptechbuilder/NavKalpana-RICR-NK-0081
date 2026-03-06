const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const calculateOGI = require('../utils/calculateOGI');

/**
 * Create a new student
 * POST /api/students
 */
const createStudent = async (req, res) => {
  try {
    const { name, email, enrollmentId, courseId, batchId, password } = req.body;

    if (!name || !email || !enrollmentId || !password) {
      return res.status(400).json({
        message: 'name, email, enrollmentId, and password are required',
      });
    }

    if (batchId) {
      const batchExists = await Batch.findById(batchId);
      if (!batchExists) {
        return res.status(400).json({ message: 'Batch not found' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      email,
      enrollmentId,
      courseId,
      batchId,
      password: hashedPassword,
      createdByTeacherId: req.user ? req.user.id : undefined,
    });

    await student.save();
    if (student.batchId) {
      await student.populate('batchId', 'batchName _id');
    }

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        enrollmentId: student.enrollmentId,
        role: student.role,
        batchId: student.batchId,
        courseId: student.courseId,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'enrollmentId or email already exists' });
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
    const { status, courseId, batchId, search } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (courseId) {
      filter.courseId = courseId;
    }

    if (batchId) {
      filter.batchId = batchId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentId: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .populate('batchId', 'batchName _id')
      .select('-password')
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

    const student = await Student.findById(id)
      .populate('batchId', 'batchName _id')
      .select('-password');

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

    if (updates.batchId) {
      const batchExists = await Batch.findById(updates.batchId);
      if (!batchExists) {
        return res.status(400).json({ message: 'Batch not found' });
      }
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('batchId', 'batchName _id')
      .select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Trigger OGI and Rank recalculation
    await calculateOGI(id);

    res.status(200).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'enrollmentId or email already exists' });
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
