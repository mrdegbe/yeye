
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return user.role === 'client' ? 
      <Navigate to="/client" replace /> : 
      <Navigate to="/provider" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Index;
