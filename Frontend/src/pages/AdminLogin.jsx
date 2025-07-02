import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Container, Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import default styles
import { API_BASE_URL } from '../constants'; 
import apiClient from "../services/apiClient";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State to track loading state
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Set loading to true when login starts
    try {
      const response = await apiClient.post(`${API_BASE_URL}/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      login();
      navigate('/home');
      toast.success('Login successful'); // Show success toast
    } catch (error) {
      setError('Invalid login credentials');
    } finally {
      setLoading(false); // Reset loading state when login completes (success or failure)
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Admin Login
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading} // Disable button while loading
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'} {/* Show loading indicator if loading */}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;
