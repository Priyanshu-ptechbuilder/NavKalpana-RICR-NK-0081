import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import Quizzes from './pages/Quizzes';
import Analytics from './pages/Analytics';
import Support from './pages/Support';
import Profile from './pages/Profile';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import StudentAssignments from './pages/StudentAssignments';
import StudentQuizzes from './pages/StudentQuizzes';
import StudentAttendance from './pages/StudentAttendance';
import './styles/App.css';

function LoginRoute() {
  const { token, user } = useAuth();
  if (token && user?.role === 'teacher') return <Navigate to="/dashboard" replace />;
  if (token && user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Login />;
}

function RegisterRoute() {
  const { token, user } = useAuth();
  if (token && user?.role === 'teacher') return <Navigate to="/dashboard" replace />;
  if (token && user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Register />;
}

function StudentLoginRoute() {
  const { token, user } = useAuth();
  if (token && user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (token && user?.role === 'teacher') return <Navigate to="/dashboard" replace />;
  return <StudentLogin />;
}

function StudentProtectedRoute({ children }) {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token || user?.role !== 'student') {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/student/login" element={<StudentLoginRoute />} />
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
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <StudentProtectedRoute>
              <StudentDashboard />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <StudentProtectedRoute>
              <StudentAssignments />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/student/quizzes"
          element={
            <StudentProtectedRoute>
              <StudentQuizzes />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <StudentProtectedRoute>
              <StudentAttendance />
            </StudentProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
