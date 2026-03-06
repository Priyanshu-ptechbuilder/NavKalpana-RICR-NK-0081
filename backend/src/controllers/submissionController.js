const Submission = require('../models/Submission');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const calculateOGI = require('../utils/calculateOGI');

/**
 * Create a new submission (evaluate / record marks)
 * POST /api/submissions
 */
const createSubmission = async (req, res) => {
  try {
    const { student, assignment, marksObtained, feedback } = req.body;

    if (!student || !assignment) {
      return res.status(400).json({
        message: 'student and assignment are required',
      });
    }

    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(400).json({ message: 'Student not found' });
    }

    const assignmentExists = await Assignment.findById(assignment);
    if (!assignmentExists) {
      return res.status(400).json({ message: 'Assignment not found' });
    }

    const duplicate = await Submission.findOne({ student, assignment });
    if (duplicate) {
      return res.status(400).json({
        message: 'Submission already exists for this student and assignment',
      });
    }

    const submission = await Submission.create({
      student,
      assignment: assignment,
      marksObtained: marksObtained !== undefined ? Number(marksObtained) : undefined,
      feedback: feedback || '',
    });

    // Mirror to Assignment.submissions array
    await Assignment.findByIdAndUpdate(assignment, {
      $push: {
        submissions: {
          studentId: student,
          fileUrl: req.body.fileUrl || '',
          submittedAt: new Date(),
          marks: marksObtained !== undefined ? Number(marksObtained) : 0,
          feedback: feedback || '',
          status: "Evaluated" // Since it's being created/evaluated via teacher controller
        }
      }
    });

    // Recalculate OGI
    await calculateOGI(student);

    res.status(201).json({
      message: 'Submission saved successfully',
      submission,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Submission already exists for this student and assignment',
      });
    }
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get submissions (optional filters: ?student=ID, ?assignment=ID)
 * GET /api/submissions
 */
const getSubmissions = async (req, res) => {
  try {
    const { student, assignment } = req.query;

    const filter = {};
    if (student) filter.student = student;
    if (assignment) filter.assignment = assignment;

    const submissions = await Submission.find(filter)
      .populate('student', 'name enrollmentId')
      .populate('assignment', 'title dueDate totalMarks')
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update submission (marks, feedback)
 * PUT /api/submissions/:id
 */
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marksObtained, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      id,
      { $set: { marksObtained: marksObtained !== undefined ? Number(marksObtained) : undefined, feedback: feedback || '' } },
      { new: true }
    )
      .populate('student', 'name enrollmentId')
      .populate('assignment', 'title dueDate totalMarks');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update mirror in Assignment.submissions array
    await Assignment.updateOne(
      { _id: submission.assignment._id, "submissions.studentId": submission.student._id },
      {
        $set: {
          "submissions.$.marks": marksObtained !== undefined ? Number(marksObtained) : submission.marksObtained,
          "submissions.$.feedback": feedback || submission.feedback,
          "submissions.$.status": "Evaluated"
        }
      }
    );

    // Recalculate OGI
    await calculateOGI(submission.student._id);

    res.status(200).json({ message: 'Submission updated', submission });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
  updateSubmission,
};
