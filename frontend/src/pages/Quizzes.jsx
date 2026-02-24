import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/Page.css';
import '../styles/Quizzes.css';

const PAGE_SIZE = 10;

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Quizzes() {
  const [batches, setBatches] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [filterBatch, setFilterBatch] = useState('');
  const [filterLesson, setFilterLesson] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    batch: '',
    lesson: '',
    duration: '',
    totalMarks: '',
    attemptLimit: 1,
    questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }],
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewQuiz, setViewQuiz] = useState(null);
  const [evaluateQuiz, setEvaluateQuiz] = useState(null);
  const [evaluateAttempts, setEvaluateAttempts] = useState([]);
  const [attemptHistoryStudent, setAttemptHistoryStudent] = useState(null);

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
        const [quizzesRes, attemptsRes] = await Promise.all([
          axiosInstance.get('/quizzes', { params }),
          axiosInstance.get('/quiz-attempts'),
        ]);
        setQuizzes(Array.isArray(quizzesRes.data) ? quizzesRes.data : []);
        setAttempts(Array.isArray(attemptsRes.data) ? attemptsRes.data : []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load data');
        setQuizzes([]);
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filterBatch, filterLesson]);

  const attemptsByQuiz = useMemo(() => {
    const map = {};
    attempts.forEach((a) => {
      const qid = typeof a.quiz === 'object' ? a.quiz?._id : a.quiz;
      if (!qid) return;
      if (!map[qid]) map[qid] = [];
      map[qid].push(a);
    });
    return map;
  }, [attempts]);

  const quizStatus = (q) => {
    const list = attemptsByQuiz[q._id] || [];
    if (list.length === 0) return 'Not Attempted';
    return 'Attempted';
  };

  const filteredQuizzes = useMemo(() => {
    let list = [...quizzes];
    if (filterStatus !== 'all') {
      const statusMatch = filterStatus === 'Evaluated' ? 'Attempted' : filterStatus;
      list = list.filter((q) => quizStatus(q) === statusMatch);
    }
    list.sort((a, b) => {
      if (sortBy === 'title') {
        const cmp = (a.title || '').localeCompare(b.title || '');
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      if (sortBy === 'duration') {
        const da = a.duration ?? 0;
        const db = b.duration ?? 0;
        return sortOrder === 'asc' ? da - db : db - da;
      }
      const sa = quizStatus(a);
      const sb = quizStatus(b);
      return sortOrder === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return list;
  }, [quizzes, filterStatus, sortBy, sortOrder, attemptsByQuiz]);

  const totalPages = Math.ceil(filteredQuizzes.length / PAGE_SIZE) || 1;
  const paginatedQuizzes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuizzes.slice(start, start + PAGE_SIZE);
  }, [filteredQuizzes, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const lessons = useMemo(() => {
    const set = new Set();
    quizzes.forEach((q) => q.lesson && set.add(q.lesson));
    return Array.from(set).sort();
  }, [quizzes]);

  const updateQuestion = (index, field, value) => {
    setForm((prev) => {
      const qs = [...(prev.questions || [])];
      qs[index] = { ...qs[index], [field]: value };
      return { ...prev, questions: qs };
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setForm((prev) => {
      const qs = [...(prev.questions || [])];
      const opts = [...(qs[qIndex]?.options || ['', '', '', ''])];
      opts[optIndex] = value;
      qs[qIndex] = { ...qs[qIndex], options: opts };
      return { ...prev, questions: qs };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), { questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }],
    }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const computeTotalMarks = () => {
    return (form.questions || []).reduce((sum, q) => sum + (q.marks || 1), 0);
  };

  const validateForm = () => {
    if (!form.title.trim() || !form.batch || !form.duration) return false;
    const qs = form.questions || [];
    if (qs.length === 0) return false;
    for (const q of qs) {
      if (!q.questionText?.trim()) return false;
      const opts = q.options || [];
      if (opts.filter(Boolean).length < 2) return false;
    }
    return true;
  };

  const buildQuestionsPayload = () => {
    return (form.questions || []).map((q) => {
      const options = (q.options || []).slice(0, 4).map((o) => String(o || '').trim()).filter(Boolean);
      const correctAnswer = Math.max(0, Math.min(options.length - 1, Number(q.correctAnswer) || 0));
      return {
        questionText: q.questionText?.trim() || '',
        options,
        correctAnswer,
        explanation: (q.explanation || '').trim(),
        marks: 1,
      };
    }).filter((q) => q.questionText && q.options.length >= 2);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Title, Batch, Duration and at least one valid question (with 2+ options) are required.');
      return;
    }
    const questionsPayload = buildQuestionsPayload();
    if (questionsPayload.length === 0) {
      setError('Add at least one question with text and 2+ options.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axiosInstance.post('/quizzes', {
        title: form.title.trim(),
        batch: form.batch,
        lesson: form.lesson.trim(),
        duration: Number(form.duration),
        totalMarks: form.totalMarks ? Number(form.totalMarks) : questionsPayload.length,
        attemptLimit: form.attemptLimit != null ? Number(form.attemptLimit) : 1,
        questions: questionsPayload,
      });
      resetForm();
      const params = {};
      if (filterBatch) params.batch = filterBatch;
      if (filterLesson) params.lesson = filterLesson;
      const { data } = await axiosInstance.get('/quizzes', { params });
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      batch: '',
      lesson: '',
      duration: '',
      totalMarks: '',
      attemptLimit: 1,
      questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }],
    });
    setEditingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId || !validateForm()) return;
    const questionsPayload = buildQuestionsPayload();
    if (questionsPayload.length === 0) {
      setError('At least one valid question required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axiosInstance.put(`/quizzes/${editingId}`, {
        title: form.title.trim(),
        batch: form.batch,
        lesson: form.lesson.trim(),
        duration: Number(form.duration),
        totalMarks: form.totalMarks ? Number(form.totalMarks) : questionsPayload.length,
        attemptLimit: form.attemptLimit != null ? Number(form.attemptLimit) : 1,
        questions: questionsPayload,
      });
      resetForm();
      const params = {};
      if (filterBatch) params.batch = filterBatch;
      if (filterLesson) params.lesson = filterLesson;
      const { data } = await axiosInstance.get('/quizzes', { params });
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz? Attempts will be affected.')) return;
    setError('');
    try {
      await axiosInstance.delete(`/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
      setEditingId((prev) => (prev === id ? null : prev));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openEdit = (q) => {
    setEditingId(q._id);
    const questions = (q.questions || []).length
      ? q.questions.map((qn) => ({
          questionText: qn.questionText || '',
          options: (qn.options || []).length >= 4 ? qn.options.slice(0, 4) : [...(qn.options || []), '', '', ''].slice(0, 4),
          correctAnswer: qn.correctAnswer ?? 0,
          explanation: qn.explanation || '',
        }))
      : [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }];
    setForm({
      title: q.title || '',
      batch: q.batch?._id || q.batch || '',
      lesson: q.lesson || '',
      duration: String(q.duration ?? ''),
      totalMarks: String(q.totalMarks ?? ''),
      attemptLimit: q.attemptLimit ?? 1,
      questions,
    });
  };

  const openView = (q) => setViewQuiz(q);
  const openEvaluate = async (q) => {
    setEvaluateQuiz(q);
    try {
      const { data } = await axiosInstance.get('/quiz-attempts', { params: { quiz: q._id } });
      setEvaluateAttempts(Array.isArray(data) ? data : []);
    } catch (err) {
      setEvaluateAttempts([]);
    }
  };

  const classAverage = useMemo(() => {
    if (!evaluateAttempts.length) return 0;
    const sum = evaluateAttempts.reduce((s, a) => s + (a.score ?? 0), 0);
    return Math.round((sum / evaluateAttempts.length) * 10) / 10;
  }, [evaluateAttempts]);

  const openAttemptHistory = (studentId) => {
    setAttemptHistoryStudent(studentId);
  };

  const attemptHistoryList = useMemo(() => {
    if (!attemptHistoryStudent || !evaluateQuiz) return [];
    return (evaluateAttempts || []).filter((a) => {
      const sid = typeof a.student === 'object' ? a.student?._id : a.student;
      return sid === attemptHistoryStudent;
    });
  }, [attemptHistoryStudent, evaluateQuiz, evaluateAttempts]);

  return (
    <div className="page quizzes-page">
      <h1>Quiz Management</h1>

      <section className="quizzes-section quiz-form-section">
        <h2>{editingId ? 'Edit Quiz' : 'Create Quiz'}</h2>
        <form onSubmit={editingId ? handleUpdate : handleCreate} className="quiz-form">
          <div className="form-row">
            <label>
              Title *
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Quiz title" required />
            </label>
            <label>
              Batch *
              <select value={form.batch} onChange={(e) => setForm((f) => ({ ...f, batch: e.target.value }))} required>
                <option value="">Select batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>{b.batchName}</option>
                ))}
              </select>
            </label>
            <label>
              Lesson
              <input value={form.lesson} onChange={(e) => setForm((f) => ({ ...f, lesson: e.target.value }))} placeholder="e.g. Module 1" />
            </label>
            <label>
              Duration (min) *
              <input type="number" min="1" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="30" required />
            </label>
            <label>
              Total Marks
              <input type="number" min="1" value={form.totalMarks} onChange={(e) => setForm((f) => ({ ...f, totalMarks: e.target.value }))} placeholder="Auto from questions" />
            </label>
            <label>
              Attempt Limit
              <input type="number" min="1" value={form.attemptLimit} onChange={(e) => setForm((f) => ({ ...f, attemptLimit: e.target.value }))} />
            </label>
          </div>
          <div className="questions-block">
            <h3>Questions</h3>
            {(form.questions || []).map((q, idx) => (
              <div key={idx} className="question-card">
                <div className="question-header">
                  <span>Q{idx + 1}</span>
                  <button type="button" className="btn-remove-q" onClick={() => removeQuestion(idx)}>Remove</button>
                </div>
                <label>
                  Question text *
                  <input value={q.questionText} onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)} placeholder="Enter question" />
                </label>
                <label>Options (correct one by index below)</label>
                <div className="options-row">
                  {[0, 1, 2, 3].map((oi) => (
                    <input key={oi} value={(q.options || [])[oi] || ''} onChange={(e) => updateOption(idx, oi, e.target.value)} placeholder={`Option ${oi + 1}`} className="option-input" />
                  ))}
                </div>
                <label>
                  Correct answer (0-3)
                  <select value={q.correctAnswer} onChange={(e) => updateQuestion(idx, 'correctAnswer', Number(e.target.value))}>
                    {[0, 1, 2, 3].map((i) => (
                      <option key={i} value={i}>Option {i + 1}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Explanation
                  <input value={q.explanation || ''} onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)} placeholder="Optional" />
                </label>
              </div>
            ))}
            <button type="button" className="btn-add-q" onClick={addQuestion}>+ Add Question</button>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="quizzes-section quizzes-filter-section">
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
              <option value="Not Attempted">Not Attempted</option>
              <option value="Attempted">Attempted</option>
              <option value="Evaluated">Evaluated</option>
            </select>
          </label>
          <label>
            Sort
            <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [by, order] = e.target.value.split('-'); setSortBy(by); setSortOrder(order); }} className="filter-select">
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="duration-asc">Duration (low first)</option>
              <option value="duration-desc">Duration (high first)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="quizzes-section quizzes-table-section">
        <h2>Quizzes</h2>
        {error && <p className="quizzes-error">{error}</p>}
        {loading ? (
          <p className="quizzes-loading">Loading...</p>
        ) : filteredQuizzes.length === 0 ? (
          <p className="quizzes-empty">No quizzes found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="quizzes-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Lesson / Module</th>
                    <th>Duration</th>
                    <th>Total Marks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuizzes.map((q) => (
                    <tr key={q._id}>
                      <td>{q.title}</td>
                      <td>{q.lesson || '—'}</td>
                      <td>{q.duration} min</td>
                      <td>{q.totalMarks}</td>
                      <td>
                        <span className={`status-badge status-${quizStatus(q).toLowerCase().replace(/\s/g, '-')}`}>
                          {quizStatus(q)}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn-action" onClick={() => openView(q)}>View</button>
                        <button type="button" className="btn-action btn-evaluate" onClick={() => openEvaluate(q)}>Evaluate</button>
                        <button type="button" className="btn-delete" onClick={() => handleDelete(q._id)}>Delete</button>
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

      {viewQuiz && (
        <div className="modal-overlay" onClick={() => setViewQuiz(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewQuiz.title}</h3>
              <button type="button" className="modal-close" onClick={() => setViewQuiz(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="view-meta">Duration: {viewQuiz.duration} min • Total marks: {viewQuiz.totalMarks} • Attempt limit: {viewQuiz.attemptLimit || 1}</p>
              <h4>Questions ({viewQuiz.questions?.length || 0})</h4>
              {(viewQuiz.questions || []).map((qn, i) => (
                <div key={i} className="view-question">
                  <strong>Q{i + 1}.</strong> {qn.questionText}
                  <ul>
                    {(qn.options || []).map((opt, j) => (
                      <li key={j}>{opt} {j === qn.correctAnswer ? '(Correct)' : ''}</li>
                    ))}
                  </ul>
                  {qn.explanation && <p className="explanation">Explanation: {qn.explanation}</p>}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setViewQuiz(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {evaluateQuiz && (
        <div className="modal-overlay" onClick={() => { setEvaluateQuiz(null); setAttemptHistoryStudent(null); }}>
          <div className="modal-content modal-evaluate" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Evaluate: {evaluateQuiz.title}</h3>
              <button type="button" className="modal-close" onClick={() => { setEvaluateQuiz(null); setAttemptHistoryStudent(null); }}>×</button>
            </div>
            <div className="modal-body">
              <p className="view-meta">Class average: <strong>{classAverage}</strong> / {evaluateQuiz.totalMarks} ({evaluateAttempts.length} attempt(s))</p>
              <div className="table-wrap">
                <table className="evaluate-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Enrollment ID</th>
                      <th>Score</th>
                      <th>Attempted At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluateAttempts.map((a) => {
                      const student = typeof a.student === 'object' ? a.student : {};
                      return (
                        <tr key={a._id}>
                          <td>{student.name || '—'}</td>
                          <td>{student.enrollmentId || '—'}</td>
                          <td>{a.score} / {a.totalMarks}</td>
                          <td>{formatDate(a.attemptedAt)}</td>
                          <td>
                            <button type="button" className="btn-action" onClick={() => openAttemptHistory(student._id)}>History</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {evaluateAttempts.length === 0 && <p className="view-empty">No attempts yet.</p>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => { setEvaluateQuiz(null); setAttemptHistoryStudent(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {attemptHistoryStudent && evaluateQuiz && (
        <div className="modal-overlay" onClick={() => setAttemptHistoryStudent(null)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Attempt History</h3>
              <button type="button" className="modal-close" onClick={() => setAttemptHistoryStudent(null)}>×</button>
            </div>
            <div className="modal-body">
              {attemptHistoryList.map((a, i) => (
                <div key={a._id} className="attempt-item">
                  <span>Attempt {i + 1}: {a.score} / {a.totalMarks}</span>
                  <span className="attempt-date">{formatDate(a.attemptedAt)}</span>
                </div>
              ))}
              {attemptHistoryList.length === 0 && <p className="view-empty">No attempts.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
