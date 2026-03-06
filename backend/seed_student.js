const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Batch = require('./src/models/Batch');
const Course = require('./src/models/Course');
const Student = require('./src/models/Student');

async function createDummyData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-portal');
    console.log('Connected to MongoDB');

    // 1. Create Dummy Course if none exists
    let course = await Course.findOne();
    if (!course) {
      course = await Course.create({
        courseName: 'Web Development Bootcamp',
        description: 'A comprehensive full-stack development course.',
        duration: '6 Months'
      });
      console.log('Created dummy course:', course.courseName);
    }

    // 2. Create Dummy Batch if none exists
    let batch = await Batch.findOne();
    if (!batch) {
      batch = await Batch.create({
        batchName: 'W-FEB-2026-A',
        batchType: 'Full-time',
        status: 'ongoing'
      });
      console.log('Created dummy batch:', batch.batchName);
    }

    // 3. Create Dummy Student
    const dummyEnrollment = 'STU-TEST-001';
    const dummyPassword = 'studentPassword123';
    
    // Check if student already exists
    let student = await Student.findOne({ enrollmentId: dummyEnrollment });
    if (student) {
      await student.deleteOne(); // Re-create to ensure fresh data
      console.log('Removed existing test student.');
    }

    const hashedPassword = await bcrypt.hash(dummyPassword, 10);
    
    student = await Student.create({
      name: 'John Doe (Test Student)',
      email: 'test.student@example.com',
      enrollmentId: dummyEnrollment,
      password: hashedPassword,
      batchId: batch._id,
      courseId: course._id,
      attendancePercentage: 85,
      OGI: 75,
      growthClassification: 'Improving',
      role: 'student'
    });

    const Quiz = require('./src/models/Quiz');
    let quiz = await Quiz.findOne({ title: 'Full Stack Fundamentals' });
    if (!quiz) {
        quiz = await Quiz.create({
            title: 'Full Stack Fundamentals',
            batch: batch._id,
            duration: 10,
            totalMarks: 3,
            questions: [
                {
                    questionText: "Which of these is a database management system?",
                    options: ["React", "Express", "MongoDB", "Node"],
                    correctAnswer: 2,
                    marks: 1
                },
                {
                    questionText: "What does HTML stand for?",
                    options: ["Hyper Title Markup Language", "Hyper Text Markup Language", "High Tech Multi Language", "None of these"],
                    correctAnswer: 1,
                    marks: 1
                },
                {
                    questionText: "Is JavaScript single-threaded?",
                    options: ["Yes", "No", "Only on Sundays", "It depends"],
                    correctAnswer: 0,
                    marks: 1
                }
            ]
        });
        console.log('Created dummy quiz:', quiz.title);
    }

    console.log('\n--- TEST SYSTEM READY ---');
    console.log(`Enrollment ID: ${dummyEnrollment}`);
    console.log(`Password:      ${dummyPassword}`);
    console.log(`Test Quiz:     ${quiz.title}`);
    console.log('----------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('Error creating dummy data:', err);
    process.exit(1);
  }
}

createDummyData();
