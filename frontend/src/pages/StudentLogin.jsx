import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentLogin.css';

export default function StudentLogin() {
  const [enrollmentId, setEnrollmentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // POST to /api/student/login (axiosInstance uses /api as baseURL)
      const { data } = await axiosInstance.post('/student/login', {
        enrollmentId,
        password,
      });

      // login utility stores token and user in localStorage and context
      login(data.token, data.student);
      
      // Redirect to /student/dashboard
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your Enrollment ID and Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-login-page">
      <div className="student-login-card">
        <h1>Student Login</h1>
        <p className="subtitle">Learning Management & Performance Portal</p>
        
        <form onSubmit={handleSubmit} className="student-login-form">
          {error && <div className="error-msg">{error}</div>}
          
          <div className="input-group">
            <label htmlFor="enrollmentId">Enrollment ID</label>
            <input
              id="enrollmentId"
              type="text"
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
              required
              autoComplete="username"
              placeholder="e.g. STU-2026-001"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="student-login-footer">
          <p>
            Returning to Teacher Panel? <Link to="/login">Teacher Login</Link>
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>
            Contact administrator for password resets.
          </p>
        </div>
      </div>
    </div>
  );
}
