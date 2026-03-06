import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/Dashboard.css';

const KPI_CARDS = [
  { key: 'totalStudents', title: 'Total Students', color: 'blue', icon: '👥' },
  { key: 'activeCourses', title: 'Active Courses', color: 'green', icon: '📚' },
  { key: 'pendingAssignments', title: 'Pending Assignments for Evaluation', color: 'amber', icon: '📋' },
];

const QUICK_LINKS = [
  { to: '/batches', label: 'Batch Management', icon: '📁' },
  { to: '/students', label: 'Student Management', icon: '👥' },
  { to: '/assignments', label: 'Assignments', icon: '📝' },
  { to: '/attendance', label: 'Attendance', icon: '📅' },
  { to: '/support', label: 'Support Requests', icon: '💬' },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await axiosInstance.get('/dashboard');
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!data) return null;

  const stats = data.basicStats || {};
  const attendancePct = data.attendanceAnalytics?.averageAttendancePercentage ?? 0;
  const avgMarks = data.marksAnalytics?.averageMarks ?? 0;
  const upcomingDeadlines = data.upcomingDeadlines || [];

  const kpiValues = {
    totalStudents: stats.totalStudents ?? 0,
    activeCourses: stats.activeCourses ?? 0,
    pendingAssignments: stats.pendingAssignmentsForEvaluation ?? 0,
  };

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Dashboard</h1>

      <section className="dashboard-kpi">
        {KPI_CARDS.map((card) => (
          <div key={card.key} className={`kpi-card kpi-${card.color}`}>
            <span className="kpi-icon">{card.icon}</span>
            <span className="kpi-value">{kpiValues[card.key]}</span>
            <span className="kpi-title">{card.title}</span>
          </div>
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-section quick-nav-section">
          <h2>Quick Navigation</h2>
          <div className="quick-nav-grid">
            {QUICK_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="quick-nav-card">
                <span className="quick-nav-icon">{link.icon}</span>
                <span className="quick-nav-label">{link.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-section performance-section">
          <h2>Average Class Performance</h2>
          <div className="performance-cards">
            <div className="perf-card">
              <span className="perf-value">{avgMarks}</span>
              <span className="perf-label">Average Marks</span>
            </div>
            <div className="perf-card">
              <span className="perf-value">{attendancePct}%</span>
              <span className="perf-label">Average Attendance</span>
            </div>
          </div>
        </section>
      </div>

      <section className="dashboard-section deadlines-section">
        <h2>Upcoming Deadlines</h2>
        {upcomingDeadlines.length === 0 ? (
          <p className="no-deadlines">No upcoming assignment deadlines in the next 14 days.</p>
        ) : (
          <ul className="deadlines-list">
            {upcomingDeadlines.map((d) => (
              <li key={d._id} className="deadline-item">
                <span className="deadline-title">{d.title}</span>
                <span className="deadline-meta">
                  {d.batchName && `${d.batchName} · `}
                  {new Date(d.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.topPerformers?.length > 0 && (
        <section className="dashboard-section top-performers-section">
          <h2>Leaderboard (Top 5)</h2>
          <ul className="top-performers-list">
            {data.topPerformers.map((p) => (
              <li key={p.studentId || p.enrollmentId} className="top-performer-item">
                <div className="tp-rank">#{p.ranking || 'N/A'}</div>
                <div className="tp-info">
                    <span className="tp-name">{p.name}</span>
                    <span className="tp-id">{p.enrollmentId}</span>
                </div>
                <span className="tp-marks">{p.averageMarks} OGI</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
