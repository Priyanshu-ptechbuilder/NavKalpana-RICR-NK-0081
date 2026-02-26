import React from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import ClassAnalytics from '../components/analytics/ClassAnalytics';
import StudentInsights from '../components/analytics/StudentInsights';
import WeeklySnapshot from '../components/analytics/WeeklySnapshot';
import Leaderboard from '../components/analytics/Leaderboard';
import '../styles/Page.css';
import '../styles/Analytics.css';

export default function AnalyticsDashboard() {
  const {
    loading,
    error,
    batches,
    filters,
    setFilters,
    getCourses,
    getModules,
    students,
    refetch,
  } = useAnalytics();

  const courses = getCourses();
  const modules = getModules();

  if (loading) {
    return (
      <div className="page analytics-dashboard-page">
        <h1>Analytics, Monitoring & Growth Intelligence</h1>
        <p className="analytics-loading">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page analytics-dashboard-page">
        <h1>Analytics, Monitoring & Growth Intelligence</h1>
        <p className="analytics-error">{error}</p>
        <button type="button" className="btn-primary" onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div className="page analytics-dashboard-page">
      <div className="analytics-dashboard-header">
        <h1>Analytics, Monitoring & Growth Intelligence</h1>
        <button type="button" className="btn-secondary analytics-refresh-btn" onClick={refetch} title="Refresh data">
          Refresh
        </button>
      </div>

      <section className="analytics-section analytics-filters">
        <h2>Filters</h2>
        <p className="analytics-section-desc">All analytics update dynamically when filters change.</p>
        <div className="filter-row">
          <label>
            Batch
            <select
              value={filters.batch}
              onChange={(e) => setFilters((f) => ({ ...f, batch: e.target.value }))}
              className="filter-select"
            >
              <option value="">All</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>{b.batchName}</option>
              ))}
            </select>
          </label>
          <label>
            Course
            <select
              value={filters.course}
              onChange={(e) => setFilters((f) => ({ ...f, course: e.target.value }))}
              className="filter-select"
            >
              <option value="">All</option>
              {courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Module
            <select
              value={filters.module}
              onChange={(e) => setFilters((f) => ({ ...f, module: e.target.value }))}
              className="filter-select"
            >
              <option value="">All</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Student search
            <input
              type="text"
              placeholder="Name or enrollment..."
              value={filters.studentSearch}
              onChange={(e) => setFilters((f) => ({ ...f, studentSearch: e.target.value }))}
              className="filter-input"
            />
          </label>
        </div>
      </section>

      <ClassAnalytics />
      <StudentInsights />
      <WeeklySnapshot />
      <Leaderboard />
    </div>
  );
}
