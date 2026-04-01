import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { token, role } = useAuth();
  const location = useLocation();

  if (!token) {
    // If no token, redirect to the specific login or common home
    const loginPath = requiredRole === 'admin' ? '/admin/login' 
                    : requiredRole === 'student' ? '/student/login' 
                    : '/teacher/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check if role matches if requiredRole is provided
  if (requiredRole && role !== requiredRole) {
    const loginPath = requiredRole === 'admin' ? '/admin/login' 
                    : requiredRole === 'student' ? '/student/login' 
                    : '/teacher/login';
    return <Navigate to={loginPath} replace />;
  }

  return children;
}
