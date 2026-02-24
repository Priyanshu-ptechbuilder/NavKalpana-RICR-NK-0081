import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/Page.css';
import '../styles/Assignments.css';

const PAGE_SIZE = 10;
const SUBMISSION_TYPES = ['PDF', 'Image', 'JPG', 'PNG', 'Document', 'Link'];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isLate(submittedAt, dueDate) {
  if (!submittedAt || !dueDate) return false;
  return new Date(submittedAt) > new Date(dueDate);
}

export default function Assignments() {
  const [batches, setBatches] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filterBatch, setFilterBatch] = useState('');
  const [filterLesson, setFilterLesson] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    lesson: '',
    submissionType: 'PDF',
    batch: '',
    dueDate: '',
    totalMarks: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewAssignment, setViewAssignment] = useState(null);
  const [viewSubmissions, setViewSubmissions] = useState([]);
  const [evaluateAssignment, setEvaluateAssignment] = useState(null);
  const [evaluateSubmissions, setEvaluateSubmissions] = useState([]);
  const [evaluateStudents, setEvaluateStudents] = useState([]);
  const [evaluateRows, setEvaluateRows] = useState({});
  const [evaluateSaving, setEvaluateSaving] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch batches error:', err);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (filterBatch) params.batch = filterBatch;
        if (filterLesson) params.lesson = filterLesson;
        const [assignmentsRes, submissionsRes] = await Promise.all([
          axiosInstance.get('/assignments', { params }),
          axiosInstance.get('/submissions'),
        ]);
        setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
        setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load data');
        setAssignments([]);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filterBatch, filterLesson]);

  const submissionsByAssignment = useMemo(() => {
    const map = {};
    submissions.forEach((s) => {
      const aid = typeof s.assignment === 'object' ? s.assignment._id : s.assignment;
      if (!map[aid]) map[aid] = [];
      map[aid].push(s);
    });
    return map;
  }, [submissions]);

  const assignmentStatus = (a) => {
    const list = submissionsByAssignment[a._id] || [];
    const due = a.dueDate ? new Date(a.dueDate) : null;
    const hasLate = list.some((s) => isLate(s.submittedAt, a.dueDate));
    const withMarks = list.filter((s) => s.marksObtained != null && s.marksObtained !== '').length;
    if (list.length === 0) return 'Not Submitted';
    if (hasLate && withMarks < list.length) return 'Late';
    if (hasLate) return 'Late';
    if (withMarks === list.length) return 'Evaluated';
    return 'Submitted';
  };

  const filteredAssignments = useMemo(() => {
    let list = [...assignments];
    if (filterStatus !== 'all') {
      list = list.filter((a) => assignmentStatus(a) === filterStatus);
    }
    list.sort((a, b) => {
      const da = new Date(a.dueDate || 0).getTime();
      const db = new Date(b.dueDate || 0).getTime();
      if (sortBy === 'deadline') return sortOrder === 'asc' ? da - db : db - da;
      const sa = assignmentStatus(a);
      const sb = assignmentStatus(b);
      return sortOrder === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return list;
  }, [assignments, filterStatus, sortBy, sortOrder, submissionsByAssignment]);

  const totalPages = Math.ceil(filteredAssignments.length / PAGE_SIZE) || 1;
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAssignments.slice(start, start + PAGE_SIZE);
  }, [filteredAssignments, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const lessons = useMemo(() => {
    const set = new Set();
    assignments.forEach((a) => a.lesson && set.add(a.lesson));
    return Array.from(set).sort();
  }, [assignments]);

  const validateForm = () => {
    return form.title.trim() && form.batch && form.dueDate && form.totalMarks !== '';
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Title, Batch, Deadline and Maximum Marks are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axiosInstance.post('/assignments', {
        title: form.title.trim(),
        description: form.description.trim(),
        lesson: form.lesson.trim(),
        submissionType: form.submissionType,
        batch: form.batch,
        dueDate: form.dueDate,
        totalMarks: Number(form.totalMarks),
      });
      setForm({ title: '', description: '', lesson: '', submissionType: 'PDF', batch: '', dueDate: '', totalMarks: '' });
      setEditingId(null);
      const params = {};
      if (filterBatch) params.batch = filterBatch;
      if (filterLesson) params.lesson = filterLesson;
      const { data } = await axiosInstance.get('/assignments', { params });
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId || !validateForm()) return;
    setSubmitting(true);
    setError('');
    try {
      await axiosInstance.put(`/assignments/${editingId}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        lesson: form.lesson.trim(),
        submissionType: form.submissionType,
        batch: form.batch,
        dueDate: form.dueDate,
        totalMarks: Number(form.totalMarks),
      });
      setForm({ title: '', description: '', lesson: '', submissionType: 'PDF', batch: '', dueDate: '', totalMarks: '' });
      setEditingId(null);
      const params = {};
      if (filterBatch) params.batch = filterBatch;
      if (filterLesson) params.lesson = filterLesson;
      const { data } = await axiosInstance.get('/assignments', { params });
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment? Submissions will be affected.')) return;
    setError('');
    try {
      await axiosInstance.delete(`/assignments/${id}`);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      setEditingId((prev) => (prev === id ? null : prev));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openView = async (a) => {
    setViewAssignment(a);
    try {
      const { data } = await axiosInstance.get('/submissions', { params: { assignment: a._id } });
      setViewSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch view submissions error:', err);
      setViewSubmissions([]);
    }
  };

  const openEdit = (a) => {
    setEditingId(a._id);
    setForm({
      title: a.title,
      description: a.description || '',
      lesson: a.lesson || '',
      submissionType: a.submissionType || 'PDF',
      batch: a.batch?._id || a.batch,
      dueDate: a.dueDate ? a.dueDate.slice(0, 10) : '',
      totalMarks: String(a.totalMarks ?? ''),
    });
  };

  const openEvaluate = async (a) => {
    setEvaluateAssignment(a);
    try {
      const [subRes, studentsRes] = await Promise.all([
        axiosInstance.get('/submissions', { params: { assignment: a._id } }),
        axiosInstance.get('/students', { params: { batch: a.batch?._id || a.batch } }),
      ]);
      const subList = Array.isArray(subRes.data) ? subRes.data : [];
      const studentList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setEvaluateSubmissions(subList);
      setEvaluateStudents(studentList);
      const rows = {};
      subList.forEach((s) => {
        const sid = typeof s.student === 'object' ? s.student._id : s.student;
        rows[sid] = { submissionId: s._id, marksObtained: s.marksObtained, feedback: s.feedback || '', submittedAt: s.submittedAt };
      });
      studentList.forEach((st) => {
        if (!rows[st._id]) rows[st._id] = { submissionId: null, marksObtained: '', feedback: '', submittedAt: null };
      });
      setEvaluateRows(rows);
    } catch (err) {
      console.error('Fetch evaluate data error:', err);
    }
  };

  const setEvaluateRow = (studentId, field, value) => {
    setEvaluateRows((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const saveEvaluation = async () => {
    if (!evaluateAssignment) return;
    setEvaluateSaving(true);
    try {
      for (const s of evaluateStudents) {
        const row = evaluateRows[s._id];
        if (!row) continue;
        if (row.submissionId) {
          await axiosInstance.put(`/submissions/${row.submissionId}`, {
            marksObtained: row.marksObtained !== '' && row.marksObtained != null ? Number(row.marksObtained) : undefined,
            feedback: row.feedback || '',
          });
        } else if (row.marksObtained !== '' || row.feedback) {
          await axiosInstance.post('/submissions', {
            student: s._id,
            assignment: evaluateAssignment._id,
            marksObtained: row.marksObtained !== '' ? Number(row.marksObtained) : undefined,
            feedback: row.feedback || '',
          });
        }
      }
      const { data } = await axiosInstance.get('/submissions', { params: { assignment: evaluateAssignment._id } });
      setEvaluateSubmissions(Array.isArray(data) ? data : []);
      const rows = {};
      (Array.isArray(data) ? data : []).forEach((s) => {
        const sid = typeof s.student === 'object' ? s.student._id : s.student;
        rows[sid] = { submissionId: s._id, marksObtained: s.marksObtained, feedback: s.feedback || '', submittedAt: s.submittedAt };
      });
      evaluateStudents.forEach((st) => {
        if (!rows[st._id]) rows[st._id] = { submissionId: null, marksObtained: '', feedback: '', submittedAt: null };
      });
      setEvaluateRows(rows);
      const allSubs = await axiosInstance.get('/submissions');
      setSubmissions(Array.isArray(allSubs.data) ? allSubs.data : []);
    } catch (err) {
      console.error('Save evaluation error:', err);
    } finally {
      setEvaluateSaving(false);
    }
  };

  return (
    <div className="page assignments-page">
      <h1>Assignment Management</h1>

      <section className="assignments-section assignment-form-section">
        <h2>{editingId ? 'Edit Assignment' : 'Create Assignment'}</h2>
        <form onSubmit={editingId ? handleUpdate : handleCreate} className="assignment-form">
          <label>
            Title *
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Assignment title"
              required
            />
          </label>
          <label>
            Description
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description"
            />
          </label>
          <label>
            Lesson / Module
            <input
              value={form.lesson}
              onChange={(e) => setForm((f) => ({ ...f, lesson: e.target.value }))}
              placeholder="e.g. Module 1"
            />
          </label>
          <label>
            Submission Type
            <select
              value={form.submissionType}
              onChange={(e) => setForm((f) => ({ ...f, submissionType: e.target.value }))}
            >
              {SUBMISSION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Batch *
            <select
              value={form.batch}
              onChange={(e) => setForm((f) => ({ ...f, batch: e.target.value }))}
              required
            >
              <option value="">Select batch</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>{b.batchName}</option>
              ))}
            </select>
          </label>
          <label>
            Deadline *
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              required
            />
          </label>
          <label>
            Maximum Marks *
            <input
              type="number"
              min="0"
              value={form.totalMarks}
              onChange={(e) => setForm((f) => ({ ...f, totalMarks: e.target.value }))}
              placeholder="100"
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" className="btn-cancel" onClick={() => { setEditingId(null); setForm({ title: '', description: '', lesson: '', submissionType: 'PDF', batch: '', dueDate: '', totalMarks: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="assignments-section assignments-filter-section">
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
            Lesson
            <select value={filterLesson} onChange={(e) => setFilterLesson(e.target.value)} className="filter-select">
              <option value="">All</option>
              {lessons.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All</option>
              <option value="Not Submitted">Not Submitted</option>
              <option value="Submitted">Submitted</option>
              <option value="Late">Late</option>
              <option value="Evaluated">Evaluated</option>
            </select>
          </label>
          <label>
            Sort
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => { const [by, order] = e.target.value.split('-'); setSortBy(by); setSortOrder(order); }}
              className="filter-select"
            >
              <option value="deadline-asc">Deadline (earliest first)</option>
              <option value="deadline-desc">Deadline (latest first)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="assignments-section assignments-table-section">
        <h2>Assignments</h2>
        {error && <p className="assignments-error">{error}</p>}
        {loading ? (
          <p className="assignments-loading">Loading...</p>
        ) : filteredAssignments.length === 0 ? (
          <p className="assignments-empty">No assignments found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Lesson / Module</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssignments.map((a) => (
                    <tr key={a._id}>
                      <td>{a.title}</td>
                      <td>{a.lesson || '—'}</td>
                      <td>{formatDate(a.dueDate)}</td>
                      <td>
                        <span className={`status-badge status-${assignmentStatus(a).toLowerCase().replace(/\s/g, '-')}`}>
                          {assignmentStatus(a)}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn-action" onClick={() => openView(a)}>View</button>
                        <button type="button" className="btn-action" onClick={() => openEdit(a)}>Edit</button>
                        <button type="button" className="btn-action btn-evaluate" onClick={() => openEvaluate(a)}>Evaluate</button>
                        <button type="button" className="btn-delete" onClick={() => handleDelete(a._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</button>
                <span className="page-info">Page {currentPage} of {totalPages}</span>
                <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </section>

      {viewAssignment && (
        <div className="modal-overlay" onClick={() => setViewAssignment(null)}>
          <div className="modal-content modal-view" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewAssignment.title}</h3>
              <button type="button" className="modal-close" onClick={() => setViewAssignment(null)}>×</button>
            </div>
            <div className="modal-body">
              {viewAssignment.description && <p className="view-description">{viewAssignment.description}</p>}
              <p className="view-meta">Deadline: {formatDate(viewAssignment.dueDate)} • Max marks: {viewAssignment.totalMarks} • Lesson: {viewAssignment.lesson || '—'}</p>
              <h4>Submissions ({viewSubmissions.length})</h4>
              {viewSubmissions.length === 0 ? (
                <p className="view-empty">No submissions yet.</p>
              ) : (
                <table className="evaluate-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Enrollment ID</th>
                      <th>Submitted</th>
                      <th>Late</th>
                      <th>Marks</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewSubmissions.map((s) => {
                      const student = typeof s.student === 'object' ? s.student : {};
                      const late = isLate(s.submittedAt, viewAssignment.dueDate);
                      return (
                        <tr key={s._id}>
                          <td>{student.name || '—'}</td>
                          <td>{student.enrollmentId || '—'}</td>
                          <td>{formatDate(s.submittedAt)}</td>
                          <td>{late ? <span className="badge-late">Late</span> : '—'}</td>
                          <td>{s.marksObtained != null ? s.marksObtained : '—'}</td>
                          <td>{s.feedback || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setViewAssignment(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {evaluateAssignment && (
        <div className="modal-overlay" onClick={() => setEvaluateAssignment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Evaluate: {evaluateAssignment.title}</h3>
              <button type="button" className="modal-close" onClick={() => setEvaluateAssignment(null)}>×</button>
            </div>
            <p className="modal-due">Due: {formatDate(evaluateAssignment.dueDate)} • Max marks: {evaluateAssignment.totalMarks}</p>
            <div className="table-wrap">
              <table className="evaluate-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Enrollment ID</th>
                    <th>Submitted</th>
                    <th>Late</th>
                    <th>Marks</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluateStudents.map((s) => {
                    const row = evaluateRows[s._id] || {};
                    const due = evaluateAssignment.dueDate;
                    const late = row.submittedAt && isLate(row.submittedAt, due);
                    return (
                      <tr key={s._id}>
                        <td>{s.name}</td>
                        <td>{s.enrollmentId}</td>
                        <td>{row.submittedAt ? formatDate(row.submittedAt) : '—'}</td>
                        <td>{late ? <span className="badge-late">Late</span> : '—'}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={evaluateAssignment.totalMarks}
                            value={row.marksObtained ?? ''}
                            onChange={(e) => setEvaluateRow(s._id, 'marksObtained', e.target.value)}
                            placeholder="Marks"
                            className="input-marks"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.feedback ?? ''}
                            onChange={(e) => setEvaluateRow(s._id, 'feedback', e.target.value)}
                            placeholder="Feedback"
                            className="input-feedback"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setEvaluateAssignment(null)}>Close</button>
              <button type="button" className="btn-submit" onClick={saveEvaluation} disabled={evaluateSaving}>
                {evaluateSaving ? 'Saving...' : 'Save & Mark as Evaluated'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
