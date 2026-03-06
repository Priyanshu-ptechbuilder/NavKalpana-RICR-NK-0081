const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const QuizAttempt = require('../models/QuizAttempt');
const WeeklySnapshot = require('../models/WeeklySnapshot');

/**
 * Recalculate OGI and growth classification for a student
 * Formula (Weighted Average):
 * - Assignment Avg (30%)
 * - Quiz Avg (30%)
 * - Attendance % (20%)
 * - Completion Rate (15%)
 * - Submission Consistency (5%)
 * 
 * Growth rules:
 * OGI > 80 → Excellent
 * 60–80 → Improving
 * 40–60 → Stable
 * < 40 → Needs Attention
 * 
 * @param {string} studentId
 */
const calculateOGI = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) return;

    // 1. Assignment Average (Marks obtained / Total possible marks)
    const submissions = await Submission.find({ 
      student: studentId, 
      marksObtained: { $exists: true, $ne: null } 
    }).populate('assignment', 'totalMarks');
    
    let assignmentScoreSum = 0;
    submissions.forEach(s => {
      const total = s.assignment?.totalMarks || 100;
      assignmentScoreSum += (s.marksObtained / total) * 100;
    });
    const assignmentAvg = submissions.length > 0 ? assignmentScoreSum / submissions.length : 0;

    // 2. Quiz Average (Score / Total marks)
    const quizAttempts = await QuizAttempt.find({ student: studentId });
    let quizScoreSum = 0;
    quizAttempts.forEach(a => {
      const total = a.totalMarks || 100;
      quizScoreSum += (a.score / total) * 100;
    });
    const quizAvg = quizAttempts.length > 0 ? quizScoreSum / quizAttempts.length : 0;

    // 3. Attendance % (Directly from student model)
    const attendancePct = student.attendancePercentage || 0;

    // 4. Completion Rate (Count of Evaluated Submissions / Total Assignments for batch)
    const totalAssignmentsForBatch = await Assignment.countDocuments({ batch: student.batchId });
    const completionRate = totalAssignmentsForBatch > 0 
      ? (submissions.length / totalAssignmentsForBatch) * 100 
      : 0;

    // 5. Submission Consistency (Percentage of on-time submissions)
    const allStudentSubmissions = await Assignment.find({
        batch: student.batchId,
        'submissions.studentId': studentId
    }, { 'submissions.$': 1 });
    
    let onTimeCount = 0;
    let submittedCount = 0;
    allStudentSubmissions.forEach(a => {
        if (a.submissions && a.submissions[0]) {
            submittedCount++;
            if (a.submissions[0].status !== 'Late') {
                onTimeCount++;
            }
        }
    });
    const consistency = submittedCount > 0 ? (onTimeCount / submittedCount) * 100 : 100;

    // Final OGI Calculation
    const ogiValue = Math.round(
      (assignmentAvg * 0.30) + 
      (quizAvg * 0.30) + 
      (attendancePct * 0.20) + 
      (completionRate * 0.15) + 
      (consistency * 0.05)
    );

    // Growth Classification logic
    let classification = "Needs Attention";
    if (ogiValue > 80) classification = "Excellent";
    else if (ogiValue >= 60) classification = "Improving";
    else if (ogiValue >= 40) classification = "Stable";
    else classification = "Needs Attention";

    // Update Student Record
    await Student.findByIdAndUpdate(studentId, {
      OGI: ogiValue,
      growthClassification: classification
    });

    // 2. Update/Create Weekly Snapshot
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Set to Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    await WeeklySnapshot.findOneAndUpdate(
        { studentId: studentId, weekStartDate: startOfWeek },
        {
            quizAverage: quizAvg,
            assignmentAverage: assignmentAvg,
            completionRate: completionRate,
            submissionConsistency: consistency,
            OGI: ogiValue
        },
        { upsert: true, new: true }
    );

    // 3. Update Leaderboard Ranking for the whole batch
    const studentsInBatch = await Student.find({ batchId: student.batchId }).sort({ OGI: -1, name: 1 });
    const bulkOps = studentsInBatch.map((s, index) => ({
        updateOne: {
            filter: { _id: s._id },
            update: { ranking: index + 1 }
        }
    }));
    
    if (bulkOps.length > 0) {
        await Student.bulkWrite(bulkOps);
    }

  } catch (error) {
    console.error('Error calculating OGI and Rank for student:', studentId, error);
  }
};

module.exports = calculateOGI;
