import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/Page.css';
import '../styles/Students.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAGE_SIZE = 10;

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
      await axiosInstance.post('/students', {
        name: form.name.trim(),
        email: form.email.trim(),
        enrollmentId: form.enrollmentId.trim(),
        course: form.course.trim(),
        batch: form.batch,
      });
      setForm({ name: '', email: '', enrollmentId: '', course: '', batch: '' });
      setFormErrors({});
      fetchStudents();
    } catch (err) {
      console.error('Create student error:', err);
      setError(err.response?.data?.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    setError('');
    try {
      await axiosInstance.delete(`/students/${id}`);
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
        va = a.batch?.batchName ?? '';
        vb = b.batch?.batchName ?? '';
      } else {
        va = String(va ?? '').toLowerCase();
        vb = String(vb ?? '').toLowerCase();
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [students, sortBy, sortOrder]);

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

  return (
    <div className="page students-page">
      <h1>Student Management</h1>

      <section className="students-section student-form-section">
        <h2>Create Student</h2>
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
          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Student'}
          </button>
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
              placeholder="Name, email, or enrollment ID"
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Enrollment ID</th>
                    <th>Course</th>
                    <th>Batch Name</th>
                    <th>Status</th>
                    <th>Attendance %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((s) => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.enrollmentId}</td>
                      <td>{s.course}</td>
                      <td>{s.batch?.batchName ?? '—'}</td>
                      <td>
                        <span className={`status-badge status-${s.status || 'ongoing'}`}>
                          {s.status || 'ongoing'}
                        </span>
                      </td>
                      <td>
                        <span className={`attendance-pct ${getAttendanceClass(s.attendancePercentage)}`}>
                          {s.attendancePercentage != null ? `${s.attendancePercentage}%` : '—'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDelete(s._id)}
                        >
                          Delete
                        </button>
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
    </div>
  );
}
