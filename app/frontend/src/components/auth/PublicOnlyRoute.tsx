import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const role = user.role.toUpperCase();
    if (role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'SPOC') {
      return <Navigate to="/spoc" replace />;
    } else if (role === 'STUDENT_COORDINATOR' || role === 'FACULTY_COORDINATOR') {
      return <Navigate to="/coordinator" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }

  return <>{children}</>;
}

export default PublicOnlyRoute;
