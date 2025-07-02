// src/contexts/AuthContext.js
import { Box } from '@mui/system';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { FourSquare } from 'react-loading-indicators';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

   const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
   
  };

  if (isAuthenticated === null) { // Loading state
    return  <Box display="flex" justifyContent="center" alignItems="center" height="400px">
    <FourSquare color={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]} size="small" text="loading...." textColor={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]} />
   </Box>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
