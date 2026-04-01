require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await connectDB();

    // 1. Clear existing Data
    await Promise.all([
      Teacher.deleteMany({}),
      Student.deleteMany({}),
      Batch.deleteMany({}),
      Attendance.deleteMany({}),
      Assignment.deleteMany({}),
      Quiz.deleteMany({}),
      QuizAttempt.deleteMany({})
    ]);

    console.log('Database cleared.');

    // 2. Create a Batch
    const batch = await Batch.create({
      batchName: "Full Stack MERN Cluster A",
      batchType: "Regular",
      status: "ongoing"
    });
    console.log('Batch created:', batch.batchName);

    // 3. Create Admin
    const adminHash = await bcrypt.hash("Admin@123", 10);
    const admin = await Teacher.create({
      name: "Global Admin",
      email: "admin@navkalpana.com",
      password: adminHash,
      role: "admin"
    });
    console.log('Admin created:', admin.email);

    // 4. Create Teacher
    const teacherHash = await bcrypt.hash("Teacher@123", 10);
    const teacher = await Teacher.create({
      name: "Dr. Priyanshu",
      email: "teacher@navkalpana.com",
      password: teacherHash,
      role: "teacher"
    });
    console.log('Teacher created:', teacher.email);

    // 5. Create Student
    const studentHash = await bcrypt.hash("Student@123", 10);
    const student = await Student.create({
      name: "Priyanshu (Student)",
      email: "student@navkalpana.com",
      password: studentHash,
      batchId: batch._id,
      enrollmentNo: "NK-STUDENT-001",
      phone: "+91 9876543210"
    });
    console.log('Student created:', student.email);

    // 6. Create Sample Attendance (Last 5 days)
    const today = new Date();
    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        date.setHours(0,0,0,0);
        
        await Attendance.create({
            student: student._id,
            batch: batch._id,
            date,
            status: i === 2 ? 'absent' : 'present',
            remarks: i === 2 ? 'Fever' : 'On-time',
            markedBy: teacher._id
        });
    }
    console.log('Sample attendance records created.');

    // 7. Create Sample Assignment
    const deadline = new Date();
    deadline.setDate(today.getDate() + 7);
    const assignment = await Assignment.create({
      title: "React Components Mastery",
      description: "Build a responsive profile card using Tailwind CSS.",
      lesson: "Phase 1: React Basics",
      batch: batch._id,
      dueDate: deadline,
      totalMarks: 100,
      createdBy: teacher._id
    });
    console.log('Sample assignment created:', assignment.title);
    const verify = await Assignment.findOne({ _id: assignment._id });
    console.log('Verify in DB:', verify ? 'YES' : 'NO');

    // 8. Create Sample Quiz
    const quiz = await Quiz.create({
      title: "Node.js Fundamentals",
      lesson: "Back-end Cluster",
      batch: batch._id,
      duration: 15, // 15 mins
      totalMarks: 20,
      questions: [
        {
            questionText: "Which of the following is core module in Node.js?",
            options: ["express", "http", "react", "mongoose"],
            correctAnswer: 1, // 'http'
            marks: 10
        },
        {
            questionText: "NPM stands for Node Package Manager?",
            options: ["True", "False"],
            correctAnswer: 0, // 'True'
            marks: 10
        }
      ],
      createdBy: teacher._id
    });
    console.log('Sample quiz created:', quiz.title);

    console.log('--- SEEDING COMPLETE ---');
    console.log('Credentials Summary:');
    console.log('Admin: admin@navkalpana.com | Admin@123');
    console.log('Teacher: teacher@navkalpana.com | Teacher@123');
    console.log('Student: student@navkalpana.com | Student@123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
