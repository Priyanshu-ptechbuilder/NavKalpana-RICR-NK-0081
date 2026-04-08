import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/Page.css';
import '../styles/Students.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAGE_SIZE = 10;

// Dummy weekly activity for modal (e.g. last 7 days)
function getDummyWeeklyActivity() {
  return [65, 80, 72, 90, 85, 78, 88].map((v, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: v,
  }));
}

// Dummy module-wise completion
function getDummyModulesCompleted(total = 5) {
  const completed = Math.min(total, Math.floor(Math.random() * total) + 1);
  return { completed, total };
}

function StudentDetailModal({ student, onClose }) {
  const [activeTab, setActiveTab] = useState('course');
  const weeklyActivity = useMemo(() => getDummyWeeklyActivity(), []);
  const modules = useMemo(() => getDummyModulesCompleted(6), []);

  if (!student) return null;

  const pct = student.attendancePercentage ?? 0;
  const attendanceBadge =
    pct > 75 ? 'High' : pct >= 50 ? 'Medium' : 'Low';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="student-modal" onClick={(e) => e.stopPropagation()}>
        <div className="student-modal-header">
          <div className="student-modal-title-row">
            <div className="student-modal-avatar large">
              {(student.name?.[0] || 'S').toUpperCase()}
            </div>
            <div>
              <h2>{student.name}</h2>
              <p className="student-modal-meta">
                {student.course} · {student.enrollmentId}
              </p>
              <div className="student-modal-badges">
                <span className={`status-badge status-${student.status || 'ongoing'}`}>
                  {student.status || 'ongoing'}
                </span>
                <span className={`attendance-pct ${pct > 75 ? 'attendance-high' : pct >= 50 ? 'attendance-mid' : 'attendance-low'}`}>
                  Attendance: {attendanceBadge}
                </span>
              </div>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="student-modal-tabs">
          {['course', 'progress', 'attendance'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`student-modal-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'course' && 'Course Information'}
              {tab === 'progress' && 'Progress'}
              {tab === 'attendance' && 'Attendance'}
            </button>
          ))}
        </div>

        <div className="student-modal-body">
          {activeTab === 'course' && (
            <div className="student-modal-panel">
              <p><strong>Current Course:</strong> {student.course}</p>
              <p><strong>Enrollment Number:</strong> {student.enrollmentId}</p>
              <div className="weekly-activity-chart">
                <h4>Weekly Activity</h4>
                <div className="chart-bars">
                  {weeklyActivity.map((d) => (
                    <div key={d.day} className="chart-bar-wrap">
                      <div className="chart-bar" style={{ height: `${d.value}%` }} title={`${d.value}%`} />
                      <span className="chart-label">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p><strong>Modules:</strong> {modules.completed} / {modules.total} completed</p>
              <p><strong>Skills Acquired:</strong> React, Node.js, MongoDB (sample)</p>
              <p><strong>Learning Streak:</strong> 5 days (sample)</p>
              <p><strong>Attendance Summary:</strong> {pct}% overall</p>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="student-modal-panel">
              <p><strong>Module-wise completion:</strong> {modules.completed} / {modules.total} modules</p>
              <p><strong>Assignment summary:</strong> Sample — 8 submitted, 7 evaluated</p>
              <p><strong>Quiz summary:</strong> Sample — 5 attempted, avg 82%</p>
              <p><strong>Overall Progress:</strong> {Math.round((modules.completed / modules.total) * 100)}%</p>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="student-modal-panel">
              <p><strong>Overall Attendance:</strong> {pct}%</p>
              <p><strong>Total Present / Absent / Late:</strong> Sample — 45 / 3 / 2</p>
              <p className="text-muted">Calendar view and module-wise stats can be wired to attendance API.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    enrollmentId: '',
    course: '',
    batch: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailStudent, setDetailStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchBatches = async () => {
    try {
      const { data } = await axiosInstance.get('/batches');
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch batches error:', err);
    }
  };

  const fetchStudents = async () => {
    setError('');
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterCourse.trim()) params.course = filterCourse.trim();
      if (search.trim()) params.search = search.trim();
      const { data } = await axiosInstance.get('/students', { params });
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch students error:', err);
      setError(err.response?.data?.message || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filterStatus, filterCourse, search]);

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email)) errs.email = 'Invalid email format';
    if (!form.enrollmentId.trim()) errs.enrollmentId = 'Enrollment ID is required';
    if (!form.course.trim()) errs.course = 'Course is required';
    if (!form.batch) errs.batch = 'Please select a batch';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        enrollmentNo: form.enrollmentId.trim(),
        course: form.course.trim(),
        batch: form.batch,
      };
      
      if (isEditing) {
        await axiosInstance.put(`/students/${editId}`, payload);
      } else {
        await axiosInstance.post('/students', payload);
      }
      setForm({ name: '', email: '', enrollmentId: '', course: '', batch: '' });
      setFormErrors({});
      setIsEditing(false);
      setEditId(null);
      fetchStudents();
    } catch (err) {
      console.error('Save student error:', err);
      setError(err.response?.data?.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (e, s) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditId(s._id);
    setForm({
      name: s.name,
      email: s.email,
      enrollmentId: s.enrollmentNo || '',
      course: s.course || '',
      batch: s.batchId?._id || '',
    });
    setFormErrors({});
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    setError('');
    try {
      await axiosInstance.delete(`/students/${id}`);
      setDetailStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Delete student error:', err);
      setError(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const sortedStudents = useMemo(() => {
    const list = [...students];
    list.sort((a, b) => {
      let va = a[sortBy];
      let vb = b[sortBy];
      if (sortBy === 'attendancePercentage') {
        va = a.attendancePercentage ?? 0;
        vb = b.attendancePercentage ?? 0;
        return sortOrder === 'asc' ? va - vb : vb - va;
      }
      if (sortBy === 'batch') {
        va = a.batchId?.batchName ?? '';
        vb = b.batchId?.batchName ?? '';
      } else {
        va = String(va ?? '').toLowerCase();
        vb = String(vb ?? '').toLowerCase();
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [students, sortBy, sortOrder]);

  const ongoingCount = useMemo(() => students.filter((s) => (s.status || 'ongoing') === 'ongoing').length, [students]);
  const completedCount = useMemo(() => students.filter((s) => s.status === 'completed').length, [students]);

  const totalPages = Math.ceil(sortedStudents.length / PAGE_SIZE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedStudents.slice(start, start + PAGE_SIZE);
  }, [sortedStudents, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const getAttendanceClass = (pct) => {
    const n = Number(pct);
    if (n > 75) return 'attendance-high';
    if (n >= 50) return 'attendance-mid';
    return 'attendance-low';
  };

  const getEnrolledModules = (s) => {
    const tags = [];
    if (s.course) tags.push(s.course);
    if (s.batchId?.batchName) tags.push(s.batchId.batchName);
    return tags.length ? tags : ['—'];
  };

  return (
    <div className="page students-page">
      <h1>Student Management</h1>

      <section className="students-summary-cards">
        <div className="summary-card">
          <span className="summary-value">{students.length}</span>
          <span className="summary-label">Total Students</span>
        </div>
        <div className="summary-card ongoing">
          <span className="summary-value">{ongoingCount}</span>
          <span className="summary-label">Ongoing</span>
        </div>
        <div className="summary-card completed">
          <span className="summary-value">{completedCount}</span>
          <span className="summary-label">Completed</span>
        </div>
      </section>

      <section className="students-section student-form-section">
        <h2>{isEditing ? 'Update Student' : 'Create Student'}</h2>
        <form onSubmit={handleSubmit} className="student-form">
          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
            />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com"
            />
            {formErrors.email && <span className="field-error">{formErrors.email}</span>}
          </label>
          <label>
            Enrollment ID
            <input
              type="text"
              value={form.enrollmentId}
              onChange={(e) => setForm((f) => ({ ...f, enrollmentId: e.target.value }))}
              placeholder="e.g. ENR001"
            />
            {formErrors.enrollmentId && <span className="field-error">{formErrors.enrollmentId}</span>}
          </label>
          <label>
            Course
            <input
              type="text"
              value={form.course}
              onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
              placeholder="e.g. Web Development"
            />
            {formErrors.course && <span className="field-error">{formErrors.course}</span>}
          </label>
          <label>
            Assign to Batch
            <select
              value={form.batch}
              onChange={(e) => setForm((f) => ({ ...f, batch: e.target.value }))}
            >
              <option value="">Select batch</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.batchName}
                </option>
              ))}
            </select>
            {formErrors.batch && <span className="field-error">{formErrors.batch}</span>}
          </label>
          <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (isEditing ? 'Update Student' : 'Add Student')}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setEditId(null);
                  setForm({ name: '', email: '', enrollmentId: '', course: '', batch: '' });
                  setFormErrors({});
                }}
                style={{ backgroundColor: '#ccc' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="students-section students-filter-section">
        <h2>Filter & Search</h2>
        <div className="filter-row">
          <label>
            Status
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label>
            Course
            <input
              type="text"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              placeholder="Filter by course"
              className="filter-input"
            />
          </label>
          <label>
            Search
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, Enrollment ID, Email, or Course"
              className="filter-input search-input"
            />
          </label>
        </div>
      </section>

      <section className="students-section students-table-section">
        <div className="table-header-row">
          <h2>Student List</h2>
          <label className="sort-label">
            Sort by
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order);
              }}
              className="filter-select"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="enrollmentId-asc">Enrollment ID (A-Z)</option>
              <option value="enrollmentId-desc">Enrollment ID (Z-A)</option>
              <option value="attendancePercentage-desc">Attendance % (High first)</option>
              <option value="attendancePercentage-asc">Attendance % (Low first)</option>
            </select>
          </label>
        </div>
        {error && <p className="students-error">{error}</p>}
        {loading ? (
          <p className="students-loading">Loading students...</p>
        ) : sortedStudents.length === 0 ? (
          <p className="students-empty">No students found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="students-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Enrollment ID</th>
                    <th>Course</th>
                    <th>Enrolled Modules</th>
                    <th>Attendance %</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>GitHub / LinkedIn</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((s) => (
                    <tr key={s._id} className="student-row-clickable" onClick={() => setDetailStudent(s)}>
                      <td>
                        <div className="student-avatar">
                          {(s.name?.[0] || 'S').toUpperCase()}
                        </div>
                      </td>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.enrollmentNo || s.enrollmentId}</td>
                      <td>{s.course}</td>
                      <td>
                        <div className="module-tags">
                          {getEnrolledModules(s).map((tag) => (
                            <span key={tag} className="module-tag">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`attendance-pct ${getAttendanceClass(s.attendancePercentage)}`}>
                          {s.attendancePercentage != null ? `${s.attendancePercentage}%` : '—'}
                        </span>
                      </td>
                      <td>{s.email}</td>
                      <td>{s.phone || '—'}</td>
                      <td>
                        <span className="social-links">
                          {s.github ? <a href={s.github} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>GitHub</a> : '—'}
                          {' / '}
                          {s.linkedIn ? <a href={s.linkedIn} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>LinkedIn</a> : '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            type="button"
                            className="btn-edit"
                            style={{ backgroundColor: '#2196F3', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={(e) => handleEditClick(e, s)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-delete"
                            onClick={(e) => handleDelete(e, s._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {detailStudent && (
        <StudentDetailModal
          student={detailStudent}
          onClose={() => setDetailStudent(null)}
        />
      )}
    </div>
  );
}
