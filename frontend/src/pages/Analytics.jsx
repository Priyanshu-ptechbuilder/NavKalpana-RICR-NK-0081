import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/Page.css';
import '../styles/Analytics.css';

// Dummy data for charts and lists (replace with API when available)
const DUMMY_WEEKLY_ACTIVITY = [
  { day: 'Mon', submissions: 12, attendance: 45 },
  { day: 'Tue', submissions: 18, attendance: 48 },
  { day: 'Wed', submissions: 8, attendance: 42 },
  { day: 'Thu', submissions: 22, attendance: 50 },
  { day: 'Fri', submissions: 15, attendance: 46 },
  { day: 'Sat', submissions: 5, attendance: 20 },
  { day: 'Sun', submissions: 2, attendance: 8 },
];

const DUMMY_MODULE_COMPLETION = [
  { module: 'Module 1', completed: 85 },
  { module: 'Module 2', completed: 72 },
  { module: 'Module 3', completed: 68 },
  { module: 'Module 4', completed: 90 },
  { module: 'Module 5', completed: 55 },
];

const DUMMY_ATTENDANCE_TREND = [
  { week: 'W1', rate: 78 },
  { week: 'W2', rate: 82 },
  { week: 'W3', rate: 75 },
  { week: 'W4', rate: 88 },
  { week: 'W5', rate: 85 },
];

const DUMMY_STRUGGLING = [
  { name: 'Student A', enrollmentId: 'ENR101', attendance: 45, avgMarks: 52 },
  { name: 'Student B', enrollmentId: 'ENR102', attendance: 52, avgMarks: 48 },
  { name: 'Student C', enrollmentId: 'ENR103', attendance: 58, avgMarks: 55 },
];

const DUMMY_PROGRESS = [
  { name: 'Rahul', assignments: 80, quizzes: 90 },
  { name: 'Priya', assignments: 95, quizzes: 88 },
  { name: 'Amit', assignments: 70, quizzes: 75 },
  { name: 'Sneha', assignments: 88, quizzes: 92 },
];

const DUMMY_STREAKS = [
  { name: 'Rahul', currentStreak: 5, longestStreak: 12 },
  { name: 'Priya', currentStreak: 7, longestStreak: 15 },
];

function BarChart({ data, valueKey, labelKey, maxValue, color = 'var(--chart-blue)' }) {
  const max = maxValue || Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="bar-chart">
      {data.map((item, i) => (
        <div key={i} className="bar-row">
          <span className="bar-label">{item[labelKey]}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(item[valueKey] / max) * 100}%`, background: color }}
            />
          </div>
          <span className="bar-value">{item[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterStudent, setFilterStudent] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const [dashboardRes, batchesRes, studentsRes] = await Promise.all([
          axiosInstance.get('/dashboard'),
          axiosInstance.get('/batches'),
          axiosInstance.get('/students'),
        ]);
        setDashboard(dashboardRes.data);
        setBatches(Array.isArray(batchesRes.data) ? batchesRes.data : []);
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const basicStats = dashboard?.basicStats || {};
  const attendanceAnalytics = dashboard?.attendanceAnalytics || {};
  const marksAnalytics = dashboard?.marksAnalytics || {};
  const topPerformers = dashboard?.topPerformers || [];

  const kpiCards = [
    { title: 'Total Students', value: basicStats.totalStudents ?? 0 },
    { title: 'Active Courses', value: basicStats.totalBatches ?? 0, sub: 'batches' },
    { title: 'Pending Assignments', value: basicStats.totalAssignments ?? 0, sub: 'total' },
    { title: 'Average Class Performance', value: marksAnalytics.averageMarks ?? 0, sub: 'avg marks' },
  ];

  const courses = useMemo(() => {
    const set = new Set();
    students.forEach((s) => s.course && set.add(s.course));
    return Array.from(set).sort();
  }, [students]);

  const filteredTopPerformers = useMemo(() => {
    let list = [...topPerformers];
    if (filterStudent) {
      list = list.filter((p) => p.studentId === filterStudent || p.name?.toLowerCase().includes(students.find((s) => s._id === filterStudent)?.name?.toLowerCase() || ''));
    }
    return list.slice(0, 5);
  }, [topPerformers, filterStudent, students]);

  if (loading) return <div className="analytics-page"><h1>Analytics & Growth Intelligence</h1><p className="analytics-loading">Loading...</p></div>;
  if (error) return <div className="analytics-page"><h1>Analytics & Growth Intelligence</h1><p className="analytics-error">{error}</p></div>;

  return (
    <div className="page analytics-page">
      <h1>Analytics & Growth Intelligence</h1>

      <section className="analytics-section analytics-filters">
        <h2>Filters</h2>
        <div className="filter-row">
          <label>
            Batch
            <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)} className="filter-select">
              <option value="">All</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>{b.batchName}</option>
              ))}
            </select>
          </label>
          <label>
            Course
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="filter-select">
              <option value="">All</option>
              {courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Module
            <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className="filter-select">
              <option value="">All</option>
              <option value="m1">Module 1</option>
              <option value="m2">Module 2</option>
              <option value="m3">Module 3</option>
            </select>
          </label>
          <label>
            Student
            <select value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)} className="filter-select">
              <option value="">All</option>
              {students.slice(0, 50).map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="analytics-section kpi-section">
        <h2>KPI Summary</h2>
        <div className="kpi-cards">
          {kpiCards.map((card) => (
            <div key={card.title} className="kpi-card">
              <span className="kpi-value">{card.value}</span>
              <span className="kpi-title">{card.title}</span>
              {card.sub && <span className="kpi-sub">{card.sub}</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="analytics-section charts-section">
        <h2>Charts & Trends</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Weekly Activity (Submissions)</h3>
            <BarChart data={DUMMY_WEEKLY_ACTIVITY} valueKey="submissions" labelKey="day" maxValue={25} color="#2563eb" />
          </div>
          <div className="chart-card">
            <h3>Module-wise Completion %</h3>
            <BarChart data={DUMMY_MODULE_COMPLETION} valueKey="completed" labelKey="module" maxValue={100} color="#059669" />
          </div>
          <div className="chart-card chart-full">
            <h3>Attendance Trend (Weekly %)</h3>
            <BarChart data={DUMMY_ATTENDANCE_TREND} valueKey="rate" labelKey="week" maxValue={100} color="#7c3aed" />
          </div>
        </div>
      </section>

      <section className="analytics-section performance-section">
        <h2>Student Performance Overview</h2>
        <div className="performance-grid">
          <div className="perf-card">
            <h3>Top Performers</h3>
            <ul className="perf-list">
              {filteredTopPerformers.length > 0 ? filteredTopPerformers.map((p, i) => (
                <li key={p.studentId || i}>
                  <span className="rank">#{i + 1}</span>
                  <span>{p.name || '—'}</span>
                  <span className="value">{p.averageMarks}%</span>
                </li>
              )) : (
                <li className="empty">No data</li>
              )}
            </ul>
          </div>
          <div className="perf-card alert-card">
            <h3>Low-Performing Alerts</h3>
            <ul className="perf-list">
              {DUMMY_STRUGGLING.map((s, i) => (
                <li key={i}>
                  <span>{s.name}</span>
                  <span className="value low">Att: {s.attendance}% · Avg: {s.avgMarks}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="analytics-section progress-section">
        <h2>Progress Tracker (Assignment & Quiz)</h2>
        <div className="table-wrap">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Assignment %</th>
                <th>Quiz %</th>
                <th>Combined</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_PROGRESS.map((row, i) => (
                <tr key={i}>
                  <td>{row.name}</td>
                  <td>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar" style={{ width: `${row.assignments}%` }} />
                      <span>{row.assignments}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar quiz" style={{ width: `${row.quizzes}%` }} />
                      <span>{row.quizzes}%</span>
                    </div>
                  </td>
                  <td>{Math.round((row.assignments + row.quizzes) / 2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="analytics-section streaks-section">
        <h2>Learning Streaks</h2>
        <div className="streaks-grid">
          {DUMMY_STREAKS.map((s, i) => (
            <div key={i} className="streak-card">
              <span className="streak-name">{s.name}</span>
              <span className="streak-current">Current: {s.currentStreak} days</span>
              <span className="streak-longest">Longest: {s.longestStreak} days</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
