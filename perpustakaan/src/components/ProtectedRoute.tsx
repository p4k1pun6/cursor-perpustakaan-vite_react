import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: 'user' | 'admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and save the location they tried to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If a specific role is required, check if the user has that role
  if (requiredRole && currentUser?.role !== requiredRole) {
    // If user doesn't have the required role, redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and has the required role (if any), render the protected component
  return children;
};

export default ProtectedRoute; 