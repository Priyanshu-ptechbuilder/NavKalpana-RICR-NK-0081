import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentAssignments.css';
import '../styles/StudentDashboard.css'; // Reusing nav styles

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(null); // ID of the assignment being submitted
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  const fetchAssignments = async () => {
    try {
      const { data } = await axiosInstance.get('/student/assignments');
      setAssignments(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleManualSubmit = async (assignmentId) => {
    setSubmitting(assignmentId);
    try {
      // Simulate file URL for demo purposes as requested
      const dummyFileUrl = `https://navkalpana-files.s3.amazonaws.com/submissions/${assignmentId}.pdf`;
      
      await axiosInstance.post(`/student/assignments/${assignmentId}/submit`, {
        fileUrl: dummyFileUrl
      });
      
      // Refresh the list to show new status
      await fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(null);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Submitted': return 'status-submitted';
      case 'Late': return 'status-late';
      case 'Evaluated': return 'status-evaluated';
      default: return 'status-not-submitted';
    }
  };

  if (loading) return (
    <div className="student-assignments-page">
      <div className="spinner"></div>
      <p>Fetching your coursework...</p>
    </div>
  );

  return (
    <div className="student-assignments-page">
      <nav className="student-nav">
        <div className="nav-logo">NavKalpana Student</div>
        <div className="nav-links">
          <Link to="/student/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/student/assignments" className="nav-item active">Assignments</Link>
          <Link to="/student/quizzes" className="nav-item">Quizzes</Link>
          <Link to="/student/attendance" className="nav-item">Attendance</Link>
          <button onClick={handleLogout} className="logout-btn-nav">Logout</button>
        </div>
      </nav>

      <header className="assignments-header">
        <h1>My Assignments</h1>
        <p>Manage your submissions and track your performance.</p>
      </header>

      {error && <div className="error-msg">{error}</div>}

      <div className="assignments-grid">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div key={assignment._id} className="assignment-card">
              <div className="assignment-info">
                <h3>{assignment.title}</h3>
                <div className="assignment-meta">
                  <span>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <span>📋 {assignment.totalMarks} Marks</span>
                  <span>📚 {assignment.lesson || 'General'}</span>
                </div>
                
                {assignment.status === 'Evaluated' && (
                  <div className="evaluated-info">
                    <span className="marks-display text-primary">Score: {assignment.marks} / {assignment.totalMarks}</span>
                    <p className="feedback-text">Teacher Feedback: &quot;{assignment.feedback || 'No feedback provided yet.'}&quot;</p>
                  </div>
                )}
              </div>

              <div className="submit-action">
                <span className={`status-badge ${getStatusClass(assignment.status)}`}>
                  {assignment.status}
                </span>
                
                {(assignment.status === 'Not Submitted') && (
                  <button 
                    className="submit-btn" 
                    onClick={() => handleManualSubmit(assignment._id)}
                    disabled={submitting === assignment._id}
                  >
                    {submitting === assignment._id ? 'Submitting...' : 'Upload Work'}
                  </button>
                )}
                
                {(assignment.status === 'Submitted' || assignment.status === 'Late') && (
                  <span className="success-message">Already Submitted at {new Date(assignment.submittedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No assignments currently available for your batch.</div>
        )}
      </div>
    </div>
  );
}
