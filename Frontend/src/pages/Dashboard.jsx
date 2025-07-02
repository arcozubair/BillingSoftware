import React, { useState, useEffect } from 'react';
import { Container, Box, Switch, Typography, Stack } from '@mui/material';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import Dashboard from '@mui/icons-material/Dashboard';
import AdminDashboard from '../components/dash';
import OldAdminDashboardPage from '../components/oldWelcomePage';
import AdminDashboardPage from '../components/WelcomePage';
import InactiveCustomerAlert from '../components/InactiveCustomerAlert';
import AnimatedText from '../components/AnimatedGreeting';

const DashboardPage = () => {
  // Initialize state from localStorage, with a default of false if not found
  const [useNewDashboard, setUseNewDashboard] = useState(() => {
    const savedPreference = localStorage.getItem('useNewDashboard');
    return savedPreference ? JSON.parse(savedPreference) : false;
  });

  // Save to localStorage whenever the preference changes
  useEffect(() => {
    localStorage.setItem('useNewDashboard', JSON.stringify(useNewDashboard));
  }, [useNewDashboard]);

  const handleToggleChange = (event) => {
    const newValue = event.target.checked;
    setUseNewDashboard(newValue);
  };

  const getGreeting = () => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 12) {
      return 'Good Morning';
    } else if (hours >= 12 && hours < 17) {
      return 'Good Afternoon';
    } else if (hours >= 17 && hours < 21) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        py: { xs: 0, sm: 5 },
        pb: { xs:5 }
      }}
    >
      <Container maxWidth="xl">

        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'space-between', md: 'flex-end' },
            alignItems: 'center',
            mt: 2,
            mb: 2,
            px: { xs: 1, sm: 2 },
            position: 'relative',
            zIndex: 1000,
          }}
        >
          {/* Greeting Section - Absolute positioning for desktop */}
          <Box 
            sx={{ 
              flexShrink: 1,
              position: { xs: 'static', md: 'absolute' },
              left: { md: '50%' },
              transform: { md: 'translateX(-50%)' },
              width: { md: 'auto' }
            }}
          >
            <AnimatedText 
              text={`${getGreeting()}, Admin`}
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '2rem' },
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2563eb, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                whiteSpace: { xs: 'nowrap', sm: 'normal' }
              }}
            />
          </Box>

          {/* Controls Section */}
          <Stack 
            direction="row" 
            spacing={{ xs: 1, sm: 2 }} 
            alignItems="center"
            sx={{ 
              flexShrink: 0,
              position: 'relative', // Ensure it stays above the centered greeting
              zIndex: 2
            }}
          >
            <InactiveCustomerAlert />
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '24px',
                padding: { xs: '2px 4px', sm: '8px 16px' },
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              <Dashboard 
                sx={{ 
                  color: !useNewDashboard ? 'primary.main' : 'text.secondary',
                  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }
                }} 
              />
              <Switch
                checked={useNewDashboard}
                onChange={handleToggleChange}
                color="primary"
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase': {
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  },
                  '& .MuiSwitch-thumb': {
                    backgroundColor: useNewDashboard ? 'primary.main' : 'grey.500',
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: useNewDashboard ? 'primary.light' : 'grey.300',
                  },
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                }}
              />
              <DashboardCustomizeIcon 
                sx={{ 
                  color: useNewDashboard ? 'primary.main' : 'text.secondary',
                  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }
                }} 
              />
            </Box>
          </Stack>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {useNewDashboard ? <AdminDashboardPage /> : <OldAdminDashboardPage />}
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardPage;
