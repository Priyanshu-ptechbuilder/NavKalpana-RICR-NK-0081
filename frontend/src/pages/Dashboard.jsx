import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/Dashboard.css';

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

  const { basicStats = {}, attendanceAnalytics = {}, marksAnalytics = {} } = data;

  const cards = [
    { title: 'Total Batches', value: basicStats.totalBatches ?? 0 },
    { title: 'Total Students', value: basicStats.totalStudents ?? 0 },
    { title: 'Total Assignments', value: basicStats.totalAssignments ?? 0 },
    { title: 'Average Attendance %', value: attendanceAnalytics.averageAttendancePercentage ?? 0 },
    { title: 'Average Marks', value: marksAnalytics.averageMarks ?? 0 },
  ];

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <div className="dashboard-cards">
        {cards.map((card) => (
          <div key={card.title} className="stat-card">
            <span className="stat-value">{card.value}</span>
            <span className="stat-title">{card.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
