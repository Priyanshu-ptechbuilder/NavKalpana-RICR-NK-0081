import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import Quizzes from './pages/Quizzes';
import Analytics from './pages/Analytics';
import Support from './pages/Support';
import './styles/App.css';

function AppLayout({ children }) {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!token) return children;

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <span className="brand">Academic Portal</span>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/batches">Batches</Link>
          <Link to="/students">Students</Link>
          <Link to="/attendance">Attendance</Link>
          <Link to="/assignments">Assignments</Link>
          <Link to="/quizzes">Quizzes</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/support">Support</Link>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main className="app-main">{children}</main>
    </div>
  );
}

function LoginRoute() {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/batches"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Batches />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Students />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Attendance />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Assignments />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Quizzes />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Analytics />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Support />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
