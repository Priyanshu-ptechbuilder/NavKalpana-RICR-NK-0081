import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentDashboard.css';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await axiosInstance.get('/student/dashboard');
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="student-dashboard-loading">
      <div className="spinner"></div>
      <p>Synchronizing your performance data...</p>
    </div>
  );
  
  if (error) return <div className="page-error">{error}</div>;
  if (!data) return null;

  const getTrendColor = () => data.comparison.trend === 'up' ? '#10b981' : '#ef4444';
  const getGrowthColor = () => {
    switch(data.growthClassification) {
        case 'Excellent': return '#8b5cf6';
        case 'Improving': return '#10b981';
        case 'Stable': return '#3b82f6';
        default: return '#ef4444';
    }
  };

  return (
    <div className="student-dashboard-container">
      <nav className="student-nav">
        <div className="nav-logo">NavKalpana Student</div>
        <div className="nav-links">
          <Link to="/student/dashboard" className="nav-item active">Dashboard</Link>
          <Link to="/student/assignments" className="nav-item">Assignments</Link>
          <Link to="/student/quizzes" className="nav-item">Quizzes</Link>
          <Link to="/student/attendance" className="nav-item">Attendance</Link>
          <button onClick={handleLogout} className="logout-btn-nav">Logout</button>
        </div>
      </nav>

      <header className="student-header">
        <div className="header-content">
          <h1>Hello, {user?.name || 'Student'}</h1>
          <p className="welcome-text">Your learning journey at a glance.</p>
        </div>
        <div className="batch-pill">
            <span className="icon">🎓</span>
            <span className="label">{data.batchInfo?.batchName || 'No Batch'}</span>
        </div>
      </header>

      <section className="kpi-grid">
        <div className="kpi-card main-ogi">
          <div className="kpi-main">
            <span className="label">Overall Grade Index</span>
            <span className="value">{data.OGI}</span>
            <div className="trend" style={{ color: getTrendColor() }}>
              {data.comparison.trend === 'up' ? '↗' : '↘'} 
              {Math.abs(data.OGI - data.comparison.previousOGI)} pts from last week
            </div>
          </div>
          <div className="kpi-sub">
            <span className="status-pill" style={{ backgroundColor: getGrowthColor() }}>
                {data.growthClassification}
            </span>
          </div>
        </div>

        <div className="stats-sub-grid">
            <div className="kpi-card mini">
                <span className="icon">📅</span>
                <span className="label">Attendance</span>
                <span className="value">{data.attendancePercentage}%</span>
            </div>
            <div className="kpi-card mini">
                <span className="icon">📋</span>
                <span className="label">Pending Assignments</span>
                <span className="value">{data.pendingAssignmentsCount}</span>
            </div>
            <div className="kpi-card mini">
                <span className="icon">❓</span>
                <span className="label">Pending Quizzes</span>
                <span className="value">{data.pendingQuizzesCount}</span>
            </div>
        </div>
      </section>

      <div className="dashboard-content-grid">
        <section className="dashboard-section deadlines-section">
          <h2>Upcoming Deadlines</h2>
          <div className="deadlines-list">
            {data.upcomingDeadlines?.length > 0 ? (
                data.upcomingDeadlines.map(deadline => (
                    <div key={deadline._id} className="deadline-item">
                        <div className="deadline-info">
                            <span className="title">{deadline.title}</span>
                            <span className="meta">{deadline.totalMarks} Marks</span>
                        </div>
                        <div className="deadline-date">
                            <span className="day">{new Date(deadline.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="empty-state">No upcoming deadlines found. Keep it up!</div>
            )}
          </div>
        </section>

        <section className="dashboard-section summary-section">
          <h2>Weekly Insight</h2>
          <div className="summary-card">
            <p>
                {data.comparison.trend === 'up' 
                    ? "Great work! Your OGI has increased since the last update. High engagement in quizzes is driving your progress."
                    : "Your OGI saw a slight dip. Focus on completing pending assignments to maintain your growth status."}
            </p>
            <div className="batch-details">
                <h3>Batch Details</h3>
                <ul>
                    <li><strong>ID:</strong> {data.batchInfo?._id?.slice(-6).toUpperCase()}</li>
                    <li><strong>Name:</strong> {data.batchInfo?.batchName}</li>
                    <li><strong>Role:</strong> {user?.role}</li>
                </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
