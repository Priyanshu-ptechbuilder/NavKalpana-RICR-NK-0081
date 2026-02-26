import React, { useMemo, useState } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import LineChart from './charts/LineChart';

// Build dummy historical snapshots per student from current metrics (simulate past weeks)
function buildDummySnapshots(studentId, getStudentMetrics, weekCount = 6) {
  const m = getStudentMetrics(studentId);
  const currentOGI = m.ogi ?? 50;
  const currentQuiz = m.quizAvg ?? 60;
  const currentAssign = m.assignmentAvg ?? 65;
  const snapshots = [];
  for (let i = weekCount - 1; i >= 0; i--) {
    const trend = 1 - (i * 0.08) + (Math.random() * 0.1);
    snapshots.push({
      weekLabel: `W${weekCount - i}`,
      weekIndex: weekCount - i,
      quizAvg: Math.round(Math.min(100, Math.max(0, (currentQuiz * trend) - i * 2))),
      assignmentAvg: Math.round(Math.min(100, Math.max(0, (currentAssign * trend) - i))),
      completionRate: Math.round(Math.min(100, (m.completionRate ?? 0) * trend - i * 3)),
      submissionConsistency: Math.round(Math.min(100, (m.submissionConsistency ?? 0) * trend)),
      ogi: Math.round(Math.min(100, Math.max(0, currentOGI * trend - i * 3))),
    });
  }
  return snapshots;
}

export default function WeeklySnapshot() {
  const { getFilteredStudents, getStudentMetrics, filters } = useAnalytics();
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const filteredStudents = useMemo(() => getFilteredStudents(), [getFilteredStudents]);
  const selectedStudent = useMemo(
    () => filteredStudents.find((s) => s._id === selectedStudentId) || filteredStudents[0],
    [filteredStudents, selectedStudentId]
  );

  const snapshots = useMemo(() => {
    if (!selectedStudent) return [];
    return buildDummySnapshots(selectedStudent._id, getStudentMetrics);
  }, [selectedStudent, getStudentMetrics]);

  const comparison = useMemo(() => {
    if (snapshots.length < 2) return { trend: 'Stable', description: 'Not enough data' };
    const first = snapshots[0].ogi;
    const last = snapshots[snapshots.length - 1].ogi;
    const diff = last - first;
    if (diff > 5) return { trend: 'Improvement', description: `OGI increased by ${diff} points` };
    if (diff < -5) return { trend: 'Declining', description: `OGI decreased by ${Math.abs(diff)} points` };
    return { trend: 'Stagnation', description: 'Performance stable' };
  }, [snapshots]);

  const ogiChartData = useMemo(
    () => snapshots.map((s) => ({ x: s.weekLabel, y: s.ogi })),
    [snapshots]
  );

  return (
    <section className="analytics-section weekly-snapshot">
      <h2>Weekly Performance Snapshot</h2>
      <p className="analytics-section-desc">Week-to-week comparison and trend detection.</p>

      <div className="weekly-snapshot-controls">
        <label>
          Student
          <select
            value={selectedStudentId || selectedStudent?._id}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="filter-select"
          >
            <option value="">Select student</option>
            {filteredStudents.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </label>
      </div>

      {selectedStudent && (
        <>
          <div className={`weekly-trend-badge trend-${comparison.trend.toLowerCase()}`}>
            <strong>{comparison.trend}</strong>: {comparison.description}
          </div>
          <div className="weekly-comparison-chart">
            <h3>OGI Week-to-Week</h3>
            <LineChart data={ogiChartData} xKey="x" yKey="y" width={500} height={200} color="#7c3aed" />
          </div>
          <div className="weekly-snapshot-table-wrap">
            <table className="analytics-table weekly-snapshot-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Quiz Avg</th>
                  <th>Assignment Avg</th>
                  <th>Completion %</th>
                  <th>Submission Consistency</th>
                  <th>OGI</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((row) => (
                  <tr key={row.weekLabel}>
                    <td>{row.weekLabel}</td>
                    <td>{row.quizAvg}</td>
                    <td>{row.assignmentAvg}</td>
                    <td>{row.completionRate}%</td>
                    <td>{row.submissionConsistency}%</td>
                    <td><strong>{row.ogi}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {filteredStudents.length === 0 && (
        <p className="analytics-empty">No students match the current filters.</p>
      )}
    </section>
  );
}
