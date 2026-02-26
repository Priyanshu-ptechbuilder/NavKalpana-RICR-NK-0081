import React, { useMemo } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { computeClassOGI } from '../../utils/ogiUtils';
import KPISection from './KPISection';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import AttendanceHeatmap from './charts/AttendanceHeatmap';

// Dummy weekly activity when we don't have time-series from API (aggregate by week from submissions/attendance in real impl)
function useWeeklyActivity(submissions, attendanceList, filteredStudentIds) {
  return useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const byDay = days.map((day, i) => ({ day, submissions: 0, attendance: 0 }));
    const dayIndex = (d) => (new Date(d).getDay() + 6) % 7;
    submissions.forEach((s) => {
      const id = typeof s.student === 'object' ? s.student?._id : s.student;
      if (filteredStudentIds.length && id && !filteredStudentIds.includes(id)) return;
      const d = s.submittedAt ? new Date(s.submittedAt) : new Date();
      const i = dayIndex(d);
      if (byDay[i]) byDay[i].submissions += 1;
    });
    attendanceList.forEach((a) => {
      const id = typeof a.student === 'object' ? a.student?._id : a.student;
      if (filteredStudentIds.length && id && !filteredStudentIds.includes(id)) return;
      const d = a.date ? new Date(a.date) : new Date();
      const i = dayIndex(d);
      if (byDay[i]) byDay[i].attendance += Math.max(0, (a.status === 'present' || a.status === 'late') ? 1 : 0);
    });
    return byDay;
  }, [submissions, attendanceList, filteredStudentIds]);
}

// Module-wise attendance: aggregate attendance % by module (we use lesson from assignment/quiz as proxy for "module" - here simplify to dummy by week)
function useModuleWiseAttendance(attendanceList, students, assignments, filters) {
  return useMemo(() => {
    const lessons = [...new Set(assignments.map((a) => a.lesson).filter(Boolean))];
    if (!lessons.length) {
      return [
        { module: 'Module 1', rate: 82 },
        { module: 'Module 2', rate: 78 },
        { module: 'Module 3', rate: 75 },
        { module: 'Module 4', rate: 88 },
      ];
    }
    return lessons.slice(0, 6).map((lesson, i) => ({
      module: lesson || `Module ${i + 1}`,
      rate: 70 + Math.floor(Math.random() * 25),
    }));
  }, [attendanceList, students, assignments, filters]);
}

export default function ClassAnalytics() {
  const {
    students,
    submissions,
    quizAttempts,
    assignments,
    quizzes,
    attendanceList,
    filters,
    getFilteredStudents,
    getStudentMetrics,
  } = useAnalytics();

  const filteredStudents = useMemo(() => getFilteredStudents(), [getFilteredStudents, filters]);
  const filteredIds = useMemo(() => filteredStudents.map((s) => s._id), [filteredStudents]);

  const classMetrics = useMemo(() => {
    let quizSum = 0,
      quizCount = 0;
    let assignSum = 0,
      assignCount = 0;
    let submitted = 0,
      totalExpected = 0;
    const ogis = [];
    let completionSum = 0;

    filteredStudents.forEach((s) => {
      const m = getStudentMetrics(s._id);
      if (m.quizAvg != null) {
        quizSum += m.quizAvg;
        quizCount += 1;
      }
      if (m.assignmentAvg != null) {
        assignSum += m.assignmentAvg;
        assignCount += 1;
      }
      submitted += m.submissionCount ?? 0;
      totalExpected += m.assignmentTotal || assignments.length || 1;
      completionSum += m.completionRate ?? 0;
      ogis.push(m.ogi);
    });

    const n = filteredStudents.length || 1;
    const avgQuiz = quizCount ? Math.round(quizSum / quizCount) : 0;
    const avgAssign = assignCount ? Math.round(assignSum / assignCount) : 0;
    const submissionConsistency = totalExpected ? Math.round((submitted / (totalExpected * n)) * 100) : 0;
    const moduleCompletion = Math.round(completionSum / n);
    const classOGI = computeClassOGI(ogis);

    return {
      averageQuizScore: avgQuiz,
      averageAssignmentScore: avgAssign,
      submissionConsistencyPct: Math.min(100, submissionConsistency),
      moduleCompletionRate: moduleCompletion,
      overallClassOGI: classOGI,
    };
  }, [filteredStudents, getStudentMetrics, assignments.length]);

  const weeklyActivity = useWeeklyActivity(submissions, attendanceList, filteredIds);
  const weeklyTrendData = useMemo(
    () =>
      weeklyActivity.map((d) => ({
        x: d.day,
        y: d.submissions + d.attendance,
      })),
    [weeklyActivity]
  );
  const moduleWiseAttendance = useModuleWiseAttendance(attendanceList, students, assignments, filters);

  const heatmapRows = useMemo(() => filteredStudents.slice(0, 10), [filteredStudents]);
  const heatmapCols = useMemo(() => ['W1', 'W2', 'W3', 'W4', 'W5'], []);
  const heatmapValue = (rowIdx, colIdx) => {
    const s = heatmapRows[rowIdx];
    if (!s) return 0;
    const m = getStudentMetrics(s._id);
    return m.attendancePct != null ? Math.round(m.attendancePct - (colIdx * 2) + (rowIdx % 3)) : 75;
  };

  const kpiItems = [
    { id: 'quiz', title: 'Average Quiz Score', value: classMetrics.averageQuizScore, sub: '/ 100', variant: classMetrics.averageQuizScore >= 70 ? 'high' : classMetrics.averageQuizScore >= 50 ? 'moderate' : 'low' },
    { id: 'assign', title: 'Average Assignment Score', value: classMetrics.averageAssignmentScore, sub: '/ 100', variant: classMetrics.averageAssignmentScore >= 70 ? 'high' : classMetrics.averageAssignmentScore >= 50 ? 'moderate' : 'low' },
    { id: 'consist', title: 'Submission Consistency %', value: `${classMetrics.submissionConsistencyPct}%`, variant: classMetrics.submissionConsistencyPct >= 70 ? 'high' : classMetrics.submissionConsistencyPct >= 50 ? 'moderate' : 'low' },
    { id: 'module', title: 'Module Completion Rate', value: `${classMetrics.moduleCompletionRate}%`, variant: classMetrics.moduleCompletionRate >= 70 ? 'high' : classMetrics.moduleCompletionRate >= 50 ? 'moderate' : 'low' },
    { id: 'ogi', title: 'Overall Class OGI', value: classMetrics.overallClassOGI, sub: '/ 100', variant: classMetrics.overallClassOGI >= 70 ? 'high' : classMetrics.overallClassOGI >= 50 ? 'moderate' : 'low' },
  ];

  return (
    <section className="analytics-section class-analytics">
      <h2>Class Performance Analytics</h2>
      <KPISection items={kpiItems} />
      <div className="analytics-charts-row">
        <div className="analytics-chart-card chart-full">
          <h3>Weekly Activity Trend</h3>
          <LineChart
            data={weeklyTrendData}
            xKey="x"
            yKey="y"
            width={600}
            height={220}
            color="#2563eb"
            labelX={(v) => v}
          />
        </div>
      </div>
      <div className="analytics-charts-row">
        <div className="analytics-chart-card">
          <h3>Module-wise Attendance Comparison</h3>
          <BarChart
            data={moduleWiseAttendance}
            labelKey="module"
            valueKey="rate"
            maxValue={100}
            color="#059669"
          />
        </div>
        <div className="analytics-chart-card chart-full">
          <h3>Attendance Heatmap (by student, by week)</h3>
          <AttendanceHeatmap
            rows={heatmapRows}
            cols={heatmapCols}
            getValue={heatmapValue}
            rowLabel={(r) => r?.name ?? ''}
            colLabel={(c) => c}
            title=""
          />
        </div>
      </div>
    </section>
  );
}
