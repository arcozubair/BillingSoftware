// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from "../services/apiClient";

const PrivateRoute = ({ children, redirectPath = '/' }) => {
  const { isAuthenticated } = useAuth();
  console.log('PrivateRoute isAuthenticated:', isAuthenticated); // Debugging line

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PrivateRoute;
