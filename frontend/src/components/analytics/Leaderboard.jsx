import React, { useMemo, useState } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { getGrowthBadgeColor } from '../../utils/ogiUtils';

const SORT_OPTIONS = [
  { key: 'ogi', label: 'OGI' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'assignmentScore', label: 'Assignment Score' },
];

export default function Leaderboard() {
  const { getFilteredStudents, getStudentMetrics, filters, setFilters, batches, getCourses } = useAnalytics();
  const [sortBy, setSortBy] = useState('ogi');
  const [useWeighted, setUseWeighted] = useState(false);

  const courses = useMemo(() => getCourses(), [getCourses]);
  const filteredStudents = useMemo(() => getFilteredStudents(), [getFilteredStudents]);

  const leaderboardRows = useMemo(() => {
    const withMetrics = filteredStudents.map((s) => {
      const m = getStudentMetrics(s._id);
      return {
        student: s,
        name: s.name,
        enrollmentId: s.enrollmentId,
        ogi: m.ogi,
        attendancePct: m.attendancePct,
        assignmentAvg: m.assignmentAvg,
        quizAvg: m.quizAvg,
        classification: m.classification,
      };
    });
    const key = sortBy === 'ogi' ? 'ogi' : sortBy === 'attendance' ? 'attendancePct' : 'assignmentAvg';
    return [...withMetrics].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
  }, [filteredStudents, getStudentMetrics, sortBy]);

  return (
    <section className="analytics-section leaderboard-section">
      <h2>Leaderboard</h2>
      <div className="leaderboard-filters">
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
          Sort by
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="leaderboard-checkbox">
          <input
            type="checkbox"
            checked={useWeighted}
            onChange={(e) => setUseWeighted(e.target.checked)}
          />
          <span>Use weighted score</span>
        </label>
      </div>
      <div className="leaderboard-table-wrap">
        <table className="analytics-table leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>OGI</th>
              <th>Attendance %</th>
              <th>Assignment Avg</th>
              <th>Quiz Avg</th>
              <th>Growth</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardRows.map((row, i) => (
              <tr key={row.student._id}>
                <td className="leaderboard-rank">#{i + 1}</td>
                <td>
                  <span className="leaderboard-name">{row.name}</span>
                  {row.enrollmentId && <span className="leaderboard-enrollment">{row.enrollmentId}</span>}
                </td>
                <td>{row.ogi}</td>
                <td>{row.attendancePct}%</td>
                <td>{row.assignmentAvg}%</td>
                <td>{row.quizAvg}%</td>
                <td>
                  <span className={`student-insight-badge ${getGrowthBadgeColor(row.classification)}`}>
                    {row.classification}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leaderboardRows.length === 0 && (
        <p className="analytics-empty">No students to display.</p>
      )}
    </section>
  );
}
