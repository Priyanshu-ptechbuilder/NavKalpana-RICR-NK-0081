import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentAttendance.css';
import '../styles/StudentDashboard.css'; // Reusing nav styles

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data: res } = await axiosInstance.get('/student/attendance');
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  if (loading) return (
    <div className="attendance-page-container">
      <div className="spinner"></div>
      <p>Loading attendance data...</p>
    </div>
  );

  return (
    <div className="attendance-page-container">
      <nav className="student-nav">
        <div className="nav-logo">NavKalpana Student</div>
        <div className="nav-links">
          <Link to="/student/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/student/assignments" className="nav-item">Assignments</Link>
          <Link to="/student/quizzes" className="nav-item">Quizzes</Link>
          <Link to="/student/attendance" className="nav-item active">Attendance</Link>
          <button onClick={handleLogout} className="logout-btn-nav">Logout</button>
        </div>
      </nav>

      <header className="assignments-header">
        <h1>Attendance Overview</h1>
        <p>Keep track of your consistency and class participation.</p>
      </header>

      {error && <div className="error-msg">{error}</div>}

      {data && (
        <>
          <section className="attendance-summary-grid">
            <div className="summary-card highlight">
              <span className="label">Overall Engagement</span>
              <span className="value text-success">{data.overallPercentage}%</span>
            </div>
            <div className="summary-card">
              <span className="label">Present Days</span>
              <span className="value">{data.summary.present}</span>
            </div>
            <div className="summary-card">
              <span className="label">Late Entries</span>
              <span className="value">{data.summary.late}</span>
            </div>
            <div className="summary-card">
              <span className="label">Absences</span>
              <span className="value">{data.summary.absent}</span>
            </div>
          </section>

          <section className="attendance-visual-section">
            <div className="attendance-history-card">
              <div className="history-header">
                <h2>Recent Attendance Log</h2>
                <div className="stats-pill">Total Days Tracked: {data.summary.total}</div>
              </div>
              
              <div className="records-list">
                {data.records.length > 0 ? (
                  data.records.map((record, index) => (
                    <div key={index} className="record-row">
                      <div className="date-info">
                        <span className="day">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        <span className="meta">{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className={`status-indicator status-${record.status.toLowerCase()}`}>
                        {record.status}
                      </div>

                      <div className="remarks-text">
                        {record.remarks || 'No remarks recorded.'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No attendance records found yet.</div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
