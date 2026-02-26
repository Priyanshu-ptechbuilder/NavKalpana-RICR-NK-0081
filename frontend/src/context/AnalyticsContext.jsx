import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { computeOGI, getGrowthClassification } from '../utils/ogiUtils';

const AnalyticsContext = createContext(null);

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
}

/**
 * Centralized analytics state. Refetch when assignment evaluation, quiz result,
 * attendance, module completion, or enrollment changes (call refetch from those modules or on focus).
 */
export function AnalyticsProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);

  const [filters, setFilters] = useState({
    batch: '',
    course: '',
    module: '',
    studentSearch: '',
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        dashboardRes,
        batchesRes,
        studentsRes,
        assignmentsRes,
        quizzesRes,
        submissionsRes,
        attemptsRes,
        attendanceRes,
      ] = await Promise.allSettled([
        axiosInstance.get('/dashboard'),
        axiosInstance.get('/batches'),
        axiosInstance.get('/students'),
        axiosInstance.get('/assignments'),
        axiosInstance.get('/quizzes'),
        axiosInstance.get('/submissions'),
        axiosInstance.get('/quiz-attempts'),
        axiosInstance.get('/attendance'),
      ]);

      setDashboard(dashboardRes.status === 'fulfilled' ? dashboardRes.value?.data : null);
      setBatches(batchesRes.status === 'fulfilled' && Array.isArray(batchesRes.value?.data) ? batchesRes.value.data : []);
      setStudents(studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value?.data) ? studentsRes.value.data : []);
      setAssignments(assignmentsRes.status === 'fulfilled' && Array.isArray(assignmentsRes.value?.data) ? assignmentsRes.value.data : []);
      setQuizzes(quizzesRes.status === 'fulfilled' && Array.isArray(quizzesRes.value?.data) ? quizzesRes.value.data : []);
      setSubmissions(submissionsRes.status === 'fulfilled' && Array.isArray(submissionsRes.value?.data) ? submissionsRes.value.data : []);
      setQuizAttempts(attemptsRes.status === 'fulfilled' && Array.isArray(attemptsRes.value?.data) ? attemptsRes.value.data : []);
      setAttendanceList(attendanceRes.status === 'fulfilled' && Array.isArray(attendanceRes.value?.data) ? attendanceRes.value.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const value = {
    loading,
    error,
    dashboard,
    batches,
    students,
    assignments,
    quizzes,
    submissions,
    quizAttempts,
    attendanceList,
    filters,
    setFilters,
    refetch,
    // Helpers derived from raw data (filtered by filters when used in components)
    getCourses: () => {
      const set = new Set();
      students.forEach((s) => s.course && set.add(s.course));
      return Array.from(set).sort();
    },
    getModules: () => {
      const set = new Set();
      assignments.forEach((a) => a.lesson && set.add(a.lesson));
      quizzes.forEach((q) => q.lesson && set.add(q.lesson));
      return Array.from(set).sort();
    },
    getFilteredStudents: () => {
      let list = [...students];
      if (filters.batch) list = list.filter((s) => s.batch?._id === filters.batch || s.batch === filters.batch);
      if (filters.course) list = list.filter((s) => s.course === filters.course);
      if (filters.studentSearch) {
        const q = filters.studentSearch.toLowerCase();
        list = list.filter(
          (s) =>
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.enrollmentId && s.enrollmentId.toLowerCase().includes(q))
        );
      }
      return list;
    },
    getStudentMetrics: (studentId) => {
      const subs = submissions.filter((s) => s.student?._id === studentId || s.student === studentId);
      const attempts = quizAttempts.filter((a) => a.student?._id === studentId || a.student === studentId);
      const student = students.find((s) => s._id === studentId);
      const assignmentAvg =
        subs.filter((s) => s.marksObtained != null).length > 0
          ? Math.round(
              subs.filter((s) => s.marksObtained != null).reduce((a, s) => a + (s.marksObtained ?? 0), 0) /
                subs.filter((s) => s.marksObtained != null).length
            )
          : null;
      const totalMarksQuiz = attempts.reduce((a, t) => a + (t.totalMarks || 0), 0);
      const scoreQuiz = attempts.reduce((a, t) => a + (t.score || 0), 0);
      const quizAvg =
        attempts.length > 0 && totalMarksQuiz > 0
          ? Math.round((scoreQuiz / totalMarksQuiz) * 100)
          : null;
      const attendancePct = student?.attendancePercentage ?? 0;
      const submittedCount = subs.length;
      const withMarks = subs.filter((s) => s.marksObtained != null).length;
      const submissionConsistency = assignments.length > 0 ? Math.round((submittedCount / assignments.length) * 100) : 0;
      const completionRate = assignments.length > 0 ? Math.round((withMarks / assignments.length) * 100) : 0;
      const ogi = computeOGI({
        quizAvg: quizAvg ?? 0,
        assignmentAvg: assignmentAvg ?? 0,
        attendancePct,
        completionRate,
        submissionConsistency,
      });
      const classification = getGrowthClassification(ogi);
      return {
        assignmentAvg: assignmentAvg ?? 0,
        quizAvg: quizAvg ?? 0,
        attendancePct,
        submissionConsistency,
        completionRate,
        ogi,
        classification,
        submissionCount: submittedCount,
        assignmentTotal: assignments.length,
        quizAttemptCount: attempts.length,
      };
    },
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
