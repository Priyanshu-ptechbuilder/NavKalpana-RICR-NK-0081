import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import '../styles/Page.css';
import '../styles/Batches.css';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    batchName: '',
    batchType: '',
    status: 'ongoing',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchBatches = async () => {
    setError('');
    try {
      const params = filter === 'all' ? {} : { status: filter };
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
      setForm({ batchName: '', batchType: '', status: 'ongoing' });
      fetchBatches();
    } catch (err) {
      console.error('Create batch error:', err);
      setError(err.response?.data?.message || 'Failed to create batch');
    } finally {
      setSubmitting(false);
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

      {/* Section 1: Create Batch Form */}
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
              placeholder="e.g. regular"
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

      {/* Section 2: Filter */}
      <section className="batches-section batches-filter-section">
        <label>
          Filter by status
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </label>
      </section>

      {/* Section 3: Table */}
      <section className="batches-section batches-table-section">
        <h2>Batch List</h2>
        {error && <p className="batches-error">{error}</p>}
        {loading ? (
          <p className="batches-loading">Loading batches...</p>
        ) : batches.length === 0 ? (
          <p className="batches-empty">No batches found.</p>
        ) : (
          <table className="batches-table">
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch._id}>
                  <td>{batch.batchName}</td>
                  <td>{batch.batchType}</td>
                  <td>
                    <span className={`status-badge status-${batch.status}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleDelete(batch._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
