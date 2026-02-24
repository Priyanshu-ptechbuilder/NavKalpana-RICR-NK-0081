import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/Page.css';
import '../styles/Batches.css';

const STATUS_TABS = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'upcoming', label: 'Upcoming' },
];

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ongoing');
  const [form, setForm] = useState({
    batchName: '',
    batchType: 'WEB Batch',
    status: 'ongoing',
  });
  const [submitting, setSubmitting] = useState(false);
  const [endingId, setEndingId] = useState(null);

  const fetchBatches = async () => {
    setError('');
    try {
      const params = { status: filter };
      const { data } = await axiosInstance.get('/batches', { params });
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch batches error:', err);
      setError(err.response?.data?.message || 'Failed to load batches');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBatches();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await axiosInstance.post('/batches', {
        batchName: form.batchName.trim(),
        batchType: form.batchType.trim(),
        status: form.status,
      });
      setForm({ batchName: '', batchType: 'WEB Batch', status: 'ongoing' });
      fetchBatches();
    } catch (err) {
      console.error('Create batch error:', err);
      setError(err.response?.data?.message || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndBatch = async (id) => {
    if (!window.confirm('Mark this batch as Completed?')) return;
    setError('');
    setEndingId(id);
    try {
      await axiosInstance.put(`/batches/${id}`, { status: 'completed' });
      fetchBatches();
    } catch (err) {
      console.error('End batch error:', err);
      setError(err.response?.data?.message || 'Failed to update batch');
    } finally {
      setEndingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    setError('');
    try {
      await axiosInstance.delete(`/batches/${id}`);
      fetchBatches();
    } catch (err) {
      console.error('Delete batch error:', err);
      setError(err.response?.data?.message || 'Failed to delete batch');
    }
  };

  return (
    <div className="page batches-page">
      <h1>Batch Management</h1>

      <section className="batches-section batch-form-section">
        <h2>Create Batch</h2>
        <form onSubmit={handleSubmit} className="batch-form">
          <label>
            Batch Name
            <input
              type="text"
              value={form.batchName}
              onChange={(e) => setForm((f) => ({ ...f, batchName: e.target.value }))}
              placeholder="e.g. Web Dev 2026"
              required
            />
          </label>
          <label>
            Batch Type
            <input
              type="text"
              value={form.batchType}
              onChange={(e) => setForm((f) => ({ ...f, batchType: e.target.value }))}
              placeholder="e.g. WEB Batch, DSA Batch"
              required
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Batch'}
          </button>
        </form>
      </section>

      <section className="batches-section batches-filter-section">
        <h2>Batches</h2>
        <div className="batch-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`batch-tab ${filter === tab.value ? 'active' : ''}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="batches-section batches-cards-section">
        {error && <p className="batches-error">{error}</p>}
        {loading ? (
          <p className="batches-loading">Loading batches...</p>
        ) : batches.length === 0 ? (
          <p className="batches-empty">No batches in this category.</p>
        ) : (
          <div className="batch-cards-grid">
            {batches.map((batch) => (
              <div key={batch._id} className="batch-card">
                <div className="batch-card-header">
                  <h3 className="batch-card-name">{batch.batchName}</h3>
                  <span className={`status-badge status-${batch.status}`}>
                    {batch.status}
                  </span>
                </div>
                <p className="batch-card-type">{batch.batchType}</p>
                <p className="batch-card-meta">
                  Total Students: <strong>{batch.totalStudents ?? 0}</strong>
                </p>
                <div className="batch-progress-wrap">
                  <div className="batch-progress-label">
                    <span>Progress</span>
                    <span>{batch.progress ?? 0}%</span>
                  </div>
                  <div className="batch-progress-bar">
                    <div
                      className="batch-progress-fill"
                      style={{ width: `${Math.min(100, Math.max(0, batch.progress ?? 0))}%` }}
                    />
                  </div>
                </div>
                <div className="batch-card-actions">
                  <Link
                    to={`/attendance?batch=${batch._id}`}
                    className="btn-manage"
                  >
                    Manage
                  </Link>
                  {batch.status === 'ongoing' && (
                    <button
                      type="button"
                      className="btn-end"
                      onClick={() => handleEndBatch(batch._id)}
                      disabled={endingId === batch._id}
                    >
                      {endingId === batch._id ? 'Ending...' : 'End'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => handleDelete(batch._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
