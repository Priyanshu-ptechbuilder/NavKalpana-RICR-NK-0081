import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import AdminLogin from './auth/AdminLogin';
import StudentLogin from './auth/StudentLogin';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import Quizzes from './pages/Quizzes';
import Analytics from './pages/Analytics';
import Support from './pages/Support';
import Profile from './pages/Profile';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminTeachers from './admin/AdminTeachers';
import AdminStudents from './admin/AdminStudents';
import StudentLayout from './student/StudentLayout';
import StudentDashboard from './student/StudentDashboard';
import StudentAttendance from './student/StudentAttendance';
import StudentAssignments from './student/StudentAssignments';
import StudentQuizzes from './student/StudentQuizzes';
import StudentResults from './student/StudentResults';
import StudentBatch from './student/StudentBatch';
import StudentProfile from './student/StudentProfile';
import './styles/App.css';

function LoginRoute() {
  const { token, role } = useAuth();
  if (token) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
}

function AdminLoginRoute() {
  const { token, role } = useAuth();
  if (token && role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <AdminLogin />;
}

function StudentLoginRoute() {
  const { token, role } = useAuth();
  if (token && role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <StudentLogin />;
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/teacher/login" element={<LoginRoute />} />
        <Route path="/admin/login" element={<AdminLoginRoute />} />
        <Route path="/student/login" element={<StudentLoginRoute />} />
        <Route path="/" element={<Home />} />
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
            <ProtectedRoute requiredRole="teacher">
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
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="students" element={<AdminStudents />} />
        </Route>
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="quizzes" element={<StudentQuizzes />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="batch" element={<StudentBatch />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
