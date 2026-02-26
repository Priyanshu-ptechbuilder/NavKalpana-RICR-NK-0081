import React, { useState, useMemo } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { getGrowthBadgeColor } from '../../utils/ogiUtils';
import LineChart from './charts/LineChart';

// Dummy OGI trend over time (weeks). In production, from weekly snapshots.
function useOGITrend(studentId, getStudentMetrics) {
  return useMemo(() => {
    const m = getStudentMetrics(studentId);
    const current = m.ogi ?? 50;
    return [
      { x: 'W1', y: Math.max(0, current - 15) },
      { x: 'W2', y: Math.max(0, current - 10) },
      { x: 'W3', y: Math.max(0, current - 5) },
      { x: 'W4', y: current },
    ];
  }, [studentId, getStudentMetrics]);
}

// Dummy weekly learning hours and streak when not from API
const DUMMY_HOURS = 12;
const DUMMY_STREAK = 5;
const DUMMY_SKILLS = 8;

export default function StudentInsights({ onOpenDashboard }) {
  const { getFilteredStudents, getStudentMetrics } = useAnalytics();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredStudents = useMemo(() => getFilteredStudents(), [getFilteredStudents]);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleDownloadReport = (format) => {
    if (!selectedStudent) return;
    const m = getStudentMetrics(selectedStudent._id);
    const lines = [
      'Student Performance Report',
      `Name,${selectedStudent.name}`,
      `Enrollment,${selectedStudent.enrollmentId || ''}`,
      `OGI,${m.ogi}`,
      `Classification,${m.classification}`,
      `Quiz Avg,${m.quizAvg}`,
      `Assignment Avg,${m.assignmentAvg}`,
      `Attendance %,${m.attendancePct}`,
      `Completion %,${m.completionRate}`,
      `Submission Consistency %,${m.submissionConsistency}`,
    ];
    const content = lines.join('\n');
    if (format === 'csv') {
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-report-${selectedStudent.enrollmentId || selectedStudent._id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const w = window.open('', '_blank');
      w.document.write(`
        <html><head><title>Report - ${selectedStudent.name}</title></head>
        <body><pre>${content.replace(/</g, '&lt;')}</pre>
        <script>document.close(); window.print();</script>
        </body></html>
      `);
      w.document.close();
    }
  };

  return (
    <section className="analytics-section student-insights">
      <h2>Student Performance Monitoring</h2>
      <p className="analytics-section-desc">Click a student to open detailed insights.</p>
      <div className="student-insights-grid">
        {filteredStudents.slice(0, 24).map((student) => (
          <StudentInsightCard
            key={student._id}
            student={student}
            getStudentMetrics={getStudentMetrics}
            useOGITrend={useOGITrend}
            onSelect={() => handleStudentClick(student)}
          />
        ))}
      </div>
      {filteredStudents.length === 0 && (
        <p className="analytics-empty">No students match the current filters.</p>
      )}

      {showModal && selectedStudent && (
        <StudentInsightModal
          student={selectedStudent}
          getStudentMetrics={getStudentMetrics}
          useOGITrend={useOGITrend}
          onClose={handleCloseModal}
          onDownloadReport={handleDownloadReport}
        />
      )}
    </section>
  );
}

function StudentInsightCard({ student, getStudentMetrics, useOGITrend, onSelect }) {
  const m = getStudentMetrics(student._id);
  const trendData = useOGITrend(student._id, getStudentMetrics);
  const badgeClass = getGrowthBadgeColor(m.classification);

  return (
    <div className="student-insight-card" onClick={onSelect} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelect()}>
      <div className="student-insight-card-header">
        <span className="student-insight-name">{student.name}</span>
        <span className={`student-insight-badge ${badgeClass}`}>{m.classification}</span>
      </div>
      <div className="student-insight-ogi-mini">
        <LineChart data={trendData} xKey="x" yKey="y" width={160} height={80} showDots={false} strokeWidth={1.5} />
      </div>
      <div className="student-insight-stats">
        <span>OGI: <strong>{m.ogi}</strong></span>
        <span>Completion: <strong>{m.completionRate}%</strong></span>
        <span>Streak: <strong>{DUMMY_STREAK} days</strong></span>
      </div>
    </div>
  );
}

function StudentInsightModal({ student, getStudentMetrics, useOGITrend, onClose, onDownloadReport }) {
  const m = getStudentMetrics(student._id);
  const trendData = useOGITrend(student._id, getStudentMetrics);
  const badgeClass = getGrowthBadgeColor(m.classification);

  return (
    <div className="analytics-modal-backdrop" onClick={onClose}>
      <div className="analytics-modal student-insight-modal" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-modal-header">
          <h3>Student Insights — {student.name}</h3>
          <button type="button" className="analytics-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="analytics-modal-body">
          <div className="student-modal-badge-row">
            <span className={`student-insight-badge ${badgeClass}`}>{m.classification}</span>
            <span className="student-modal-ogi">OGI: {m.ogi}</span>
          </div>
          <div className="student-modal-chart">
            <h4>OGI Trend</h4>
            <LineChart data={trendData} xKey="x" yKey="y" width={400} height={180} />
          </div>
          <div className="student-modal-metrics">
            <div className="student-modal-metric"><span className="label">Module completion</span><span className="value">{m.completionRate}%</span></div>
            <div className="student-modal-metric"><span className="label">Weekly learning hours</span><span className="value">{DUMMY_HOURS} h</span></div>
            <div className="student-modal-metric"><span className="label">Skill acquisition count</span><span className="value">{DUMMY_SKILLS}</span></div>
            <div className="student-modal-metric"><span className="label">Learning streak</span><span className="value">{DUMMY_STREAK} days</span></div>
            <div className="student-modal-metric"><span className="label">Quiz average</span><span className="value">{m.quizAvg}%</span></div>
            <div className="student-modal-metric"><span className="label">Assignment average</span><span className="value">{m.assignmentAvg}%</span></div>
            <div className="student-modal-metric"><span className="label">Attendance</span><span className="value">{m.attendancePct}%</span></div>
          </div>
        </div>
        <div className="analytics-modal-footer">
          <button type="button" className="btn-secondary" onClick={() => onDownloadReport('csv')}>Download CSV</button>
          <button type="button" className="btn-secondary" onClick={() => onDownloadReport('pdf')}>Print / PDF</button>
          <button type="button" className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
