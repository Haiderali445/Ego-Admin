import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isFullyAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground text-xs font-mono">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span>VERIFYING_SECURITY_SESSION...</span>
        </div>
      </div>
    );
  }

  if (!isFullyAuthenticated) {
    // Redirect to login while preserving target route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
