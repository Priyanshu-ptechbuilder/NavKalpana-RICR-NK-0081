const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Attendance = require('../models/Attendance');
const calculateOGI = require('../utils/calculateOGI');

/**
 * Login student
 * POST /api/student/login
 */
const studentLogin = async (req, res) => {
  try {
    const { enrollmentId, password } = req.body;

    if (!enrollmentId || !password) {
      return res.status(400).json({ message: 'enrollmentId and password are required' });
    }

    // Find student by enrollmentId
    const student = await Student.findOne({ enrollmentId });
    if (!student) {
      return res.status(401).json({ message: 'Invalid enrollmentId or password' });
    }

    // Ensure role is "student"
    if (student.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // One check for edge case where password might not be set by teacher yet
    if (!student.password) {
      return res.status(401).json({ message: 'Account not set up. Please contact your administrator.' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid enrollmentId or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      student: {
        id: student._id,
        name: student.name,
        enrollmentId: student.enrollmentId,
        email: student.email,
        role: student.role,
        batchId: student.batchId,
        courseId: student.courseId,
      },
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get student profile
 * GET /api/student/me
 */
const getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id)
      .select('-password')
      .populate('batchId', 'batchName')
      .populate('courseId', 'courseName');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get student dashboard data
 * GET /api/student/dashboard
 */
const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).populate('batchId', 'batchName');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const [pendingAssignmentsCount, pendingQuizzesCount, upcomingAssignments, lastSnapshot] = await Promise.all([
      require('../models/Assignment').countDocuments({
        batch: student.batchId?._id,
        'submissions.studentId': { $ne: student._id }
      }),
      require('../models/Quiz').countDocuments({
        batch: student.batchId?._id,
        'attempts.studentId': { $ne: student._id }
      }),
      require('../models/Assignment').find({
        batch: student.batchId?._id,
        dueDate: { $gte: new Date() }
      }).sort({ dueDate: 1 }).limit(5).select('title dueDate totalMarks'),
      require('../models/WeeklySnapshot').findOne({
        studentId: student._id
      }).sort({ weekStartDate: -1 })
    ]);

    res.status(200).json({
      attendancePercentage: student.attendancePercentage,
      OGI: student.OGI,
      growthClassification: student.growthClassification,
      pendingAssignmentsCount,
      pendingQuizzesCount,
      batchInfo: student.batchId || null,
      upcomingDeadlines: upcomingAssignments,
      comparison: {
        previousOGI: lastSnapshot?.OGI || 0,
        trend: student.OGI >= (lastSnapshot?.OGI || 0) ? 'up' : 'down'
      }
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get assignments for the logged-in student's batch
 * GET /api/student/assignments
 */
const getMyAssignments = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Find all assignments for this student's batch
    const assignments = await Assignment.find({ batch: student.batchId })
      .sort({ dueDate: 1 })
      .select('title description dueDate totalMarks submissions lesson submissionType');

    // For each assignment, find if THIS student has a submission
    const formattedAssignments = assignments.map(a => {
      const mySubmission = a.submissions.find(s => s.studentId.toString() === student._id.toString());
      return {
        _id: a._id,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        totalMarks: a.totalMarks,
        lesson: a.lesson,
        submissionType: a.submissionType,
        status: mySubmission ? mySubmission.status : 'Not Submitted',
        marks: mySubmission ? mySubmission.marks : null,
        feedback: mySubmission ? mySubmission.feedback : null,
        submittedAt: mySubmission ? mySubmission.submittedAt : null
      };
    });

    res.status(200).json(formattedAssignments);
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Submit an assignment
 * POST /api/student/assignments/:id/submit
 */
const submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl } = req.body; // In a real app, this would be from multer/S3
    const studentId = req.student.id;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // 2. Ensure assignment belongs to student's batch
    if (assignment.batch.toString() !== student.batchId.toString()) {
      return res.status(403).json({ message: 'Assignment does not belong to your batch' });
    }

    // 3. Check if student already submitted
    const alreadySubmitted = assignment.submissions.some(s => s.studentId.toString() === studentId);
    if (alreadySubmitted) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    // 4. Detect late submission
    const status = new Date() > new Date(assignment.dueDate) ? 'Late' : 'Submitted';

    // 5. Push into assignment.submissions array
    assignment.submissions.push({
      studentId: studentId,
      fileUrl: fileUrl || 'https://example.com/submission.pdf',
      submittedAt: new Date(),
      marks: 0,
      feedback: '',
      status: status
    });

    // 6. Save assignment
    await assignment.save();

    // 7. Trigger OGI calculation
    await calculateOGI(studentId);

    res.status(201).json({ 
      message: 'Assignment submitted successfully',
      status: status
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get quizzes for the logged-in student's batch
 * GET /api/student/quizzes
 */
const getMyQuizzes = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Find all quizzes for this student's batch
    const quizzes = await Quiz.find({ batch: student.batchId })
      .sort({ createdAt: -1 })
      .select('title duration totalMarks attemptLimit lesson attempts');

    // For each quiz, count student's attempts and check if they can still attempt
    const formattedQuizzes = quizzes.map(q => {
      const myAttempts = q.attempts.filter(a => a.studentId.toString() === student._id.toString());
      return {
        _id: q._id,
        title: q.title,
        duration: q.duration,
        totalMarks: q.totalMarks,
        attemptLimit: q.attemptLimit,
        lesson: q.lesson,
        attemptsCount: myAttempts.length,
        canAttempt: myAttempts.length < (q.attemptLimit || 1),
        bestScore: myAttempts.length > 0 ? Math.max(...myAttempts.map(a => a.score)) : null
      };
    });

    res.status(200).json(formattedQuizzes);
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get full quiz details for attempting (includes questions)
 * GET /api/student/quizzes/:id
 */
const getQuizDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(req.student.id);
        
        const quiz = await Quiz.findById(id).select('-attempts');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        if (quiz.batch.toString() !== student.batchId.toString()) {
            return res.status(403).json({ message: 'Quiz does not belong to your batch' });
        }
        
        // Count existing attempts
        const fullQuiz = await Quiz.findById(id);
        const myAttemptsCount = fullQuiz.attempts.filter(a => a.studentId.toString() === student._id.toString()).length;
        if (myAttemptsCount >= (quiz.attemptLimit || 1)) {
            return res.status(400).json({ message: 'Attempt limit reached' });
        }

        // Return quiz WITHOUT correct answers
        const sanitizedQuestions = quiz.questions.map(q => ({
            questionText: q.questionText,
            options: q.options,
            marks: q.marks
        }));

        res.status(200).json({
            _id: quiz._id,
            title: quiz.title,
            duration: quiz.duration,
            questions: sanitizedQuestions
        });
    } catch (error) {
        console.error('Get quiz details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Attempt a quiz
 * POST /api/student/quizzes/:id/attempt
 */
const attemptQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // Array of { questionIndex, selectedOption }
    const studentId = req.student.id;

    const student = await Student.findById(studentId);
    const quiz = await Quiz.findById(id);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // 2. Ensure quiz belongs to student's batch
    if (quiz.batch.toString() !== student.batchId.toString()) {
      return res.status(403).json({ message: 'Quiz does not belong to your batch' });
    }

    // 3. Check attempt limit
    const myAttempts = quiz.attempts.filter(a => a.studentId.toString() === studentId);
    if (myAttempts.length >= (quiz.attemptLimit || 1)) {
      return res.status(400).json({ message: 'Attempt limit reached for this quiz' });
    }

    // 5. Auto-calculate score
    let score = 0;
    quiz.questions.forEach((q, index) => {
      const studentAnswer = answers.find(a => a.questionIndex === index);
      if (studentAnswer && studentAnswer.selectedOption === q.correctAnswer) {
        score += q.marks || 1;
      }
    });

    const attemptData = {
      studentId: studentId,
      score: score,
      answers: answers,
      attemptedAt: new Date()
    };

    // 6. Push into quiz.attempts
    quiz.attempts.push(attemptData);
    await quiz.save();

    // Also mirror to QuizAttempt collection
    await QuizAttempt.create({
        student: studentId,
        quiz: id,
        score: score,
        totalMarks: quiz.totalMarks,
        answers: answers.map(a => ({ questionIndex: a.questionIndex, selectedAnswer: a.selectedOption }))
    });

    // 8. Trigger recalculation
    await calculateOGI(studentId);

    res.status(201).json({ 
      message: 'Quiz submitted successfully',
      score,
      totalMarks: quiz.totalMarks
    });
  } catch (error) {
    console.error('Attempt quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get attendance records for the logged-in student
 * GET /api/student/attendance
 */
const getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Fetch all attendance records for this student
    const attendanceRecords = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .select('date status remarks');

    // Calculate summary
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const lateDays = attendanceRecords.filter(r => r.status === 'late').length;
    const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;

    // Treat 'late' as present for simple percentage or 0.5 present? 
    // Usually 'late' counts as present in total attendance % but marked differently.
    // Let's stick to the student's stored attendancePercentage if it's already calculated, 
    // or provide the stats for the UI to display.
    
    res.status(200).json({
      overallPercentage: student.attendancePercentage,
      summary: {
        total: totalDays,
        present: presentDays,
        late: lateDays,
        absent: absentDays
      },
      records: attendanceRecords
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  studentLogin,
  getMe,
  getStudentDashboard,
  getMyAssignments,
  submitAssignment,
  getMyQuizzes,
  getQuizDetails,
  attemptQuiz,
  getMyAttendance,
};
