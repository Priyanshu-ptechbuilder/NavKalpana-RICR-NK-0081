const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// --- Teachers CRUD ---
const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Teacher already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await Teacher.create({ name, email, password: hashedPassword, role: 'teacher' });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ role: 'teacher' }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const updateData = { name, email };
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const teacher = await Teacher.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Students CRUD ---
const createStudent = async (req, res) => {
  try {
    const { name, email, password, batchId, enrollmentNo, phone, course } = req.body;
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Student already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, email, password: hashedPassword, batchId, enrollmentNo, phone, course });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('batchId', 'batchName').select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, batchId, enrollmentNo, phone, course } = req.body;
    const updateData = { name, email, batchId, enrollmentNo, phone, course };
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const student = await Student.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher,
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
};
