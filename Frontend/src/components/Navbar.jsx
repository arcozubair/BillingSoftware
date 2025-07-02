import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InsertEmoticonSharpIcon from '@mui/icons-material/InsertEmoticonSharp';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TodayIcon from '@mui/icons-material/Today';
import FlipToFrontIcon from '@mui/icons-material/FlipToFront';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PixIcon from '@mui/icons-material/Pix';
import AnimatedFooter from './Dev';
import AdminDashboard from './dash';
import { GridSearchIcon } from '@mui/x-data-grid';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  color: theme.palette.text.primary,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  zIndex: 1300,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '12px',
  padding: '8px 16px',
  fontSize: '0.95rem',
  fontWeight: 500,
  color: '#475569',
  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  marginBottom: '8px',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '100%',
    maxWidth: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid rgba(0, 0, 0, 0.08)',
    zIndex: 1200,
  }
}));

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navItems = [
    { path: '/home', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/customers', label: 'Customers', icon: <PeopleIcon /> },
    { path: '/today-invoices', label: "Today's Invoices", icon: <TodayIcon /> },
    { path: '/vendors', label: 'Vendors', icon: <PeopleIcon /> },
    { path: '/inventory', label: 'Inventory', icon: <StorefrontTwoToneIcon /> },
    { path: '/searchInvoice', label: 'Search Invoice', icon: <GridSearchIcon /> },
    { path: '/searchWatak', label: 'Search Watak', icon: <GridSearchIcon /> },


    
  ];

  if (isSmallScreen) {
    navItems.push({ path: '/viewTodaysWataks', label: 'View Wataks', icon: <PixIcon /> });
  }

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar 
          sx={{ 
            minHeight: { xs: '64px', sm: '70px' },
            display: 'flex',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 }
          }}
        >
          <Box display="flex" alignItems="center">
            <Avatar
              src="/logo.svg"
              alt="Logo"
              sx={{ 
                width: { xs: 35, sm: 40 }, 
                height: { xs: 35, sm: 40 },
                mr: 2,
                backgroundColor: 'transparent',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            />
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Billing Software
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  color: '#64748b',
                  mt: -0.5
                }}
              >
                Manage your business efficiently
              </Typography>
            </Box>
          </Box>

          {isAuthenticated && (
            <Box 
              display="flex" 
              alignItems="center" 
              gap={1.5}
              ml="auto"
            >
              {isSmallScreen ? (
                <IconButton
                  onClick={toggleDrawer(!drawerOpen)}
                  sx={{
                    borderRadius: '12px',
                    padding: '8px',
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    }
                  }}
                >
                  {drawerOpen ? (
                    <CloseIcon sx={{ 
                      transition: 'transform 0.2s',
                      transform: 'rotate(180deg)'
                    }} />
                  ) : (
                    <MenuIcon sx={{ 
                      transition: 'transform 0.2s',
                    }} />
                  )}
                </IconButton>
              ) : (
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={1}
                >
                  {navItems.map(({ label, path, icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      style={{ textDecoration: 'none' }}
                    >
                      {({ isActive }) => (
                        <StyledButton
                          startIcon={React.cloneElement(icon, {
                            sx: { 
                              color: isActive ? '#2563eb' : '#64748b',
                              fontSize: '1.25rem'
                            }
                          })}
                          sx={{
                            backgroundColor: isActive ? '#eff6ff' : 'transparent',
                            color: isActive ? '#2563eb' : '#64748b',
                            fontWeight: isActive ? 600 : 500,
                            '&:hover': {
                              backgroundColor: isActive ? '#eff6ff' : '#f1f5f9',
                            }
                          }}
                        >
                          {label}
                        </StyledButton>
                      )}
                    </NavLink>
                  ))}
                </Box>
              )}
              <Tooltip title="Logout">
                <IconButton 
                  onClick={logout}
                  sx={{
                    borderRadius: '12px',
                    padding: '8px',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    '&:hover': {
                      backgroundColor: '#fee2e2',
                    }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>

      <StyledDrawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <DrawerHeader>
          <Avatar
            src="/logo.png"
            alt="Logo"
            sx={{ 
              width: 35,
              height: 35,
              mr: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          />
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: '#0f172a',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Billing Software
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b',
                display: 'block',
                mt: -0.5
              }}
            >
              Manage your business efficiently
            </Typography>
          </Box>
        </DrawerHeader>

        <List sx={{ px: 2, flex: 1 }}>
          {navItems.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              style={{ textDecoration: 'none' }}
              onClick={toggleDrawer(false)}
            >
              {({ isActive }) => (
                <ListItem
                  button
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#2563eb' : '#64748b',
                    '&:hover': {
                      backgroundColor: isActive ? '#eff6ff' : '#f1f5f9',
                    }
                  }}
                >
                  {React.cloneElement(icon, {
                    sx: { 
                      color: 'inherit',
                      fontSize: '1.25rem',
                      mr: 2
                    }
                  })}
                  <ListItemText 
                    primary={label} 
                    primaryTypographyProps={{
                      sx: { 
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                </ListItem>
              )}
            </NavLink>
          ))}
        </List>

        {/* Developer Credit in Drawer */}
        <Box 
          sx={{ 
            p: 2, 
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
            backgroundColor: '#f8fafc'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontWeight: 500,
              '& span': {
                color: '#2563eb',
                fontWeight: 600
              },
              '& a': {
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }
            }}
          >
          Developed by <span><a href="https://in.linkedin.com/in/zubair-javaid-849524291" target="_blank" rel="noopener noreferrer" style={{color: '#2563eb'}}>Mir Zubair</a></span>
          </Typography>
        </Box>
      </StyledDrawer>

      {/* Developer Credit at bottom of page */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          py: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          zIndex: 1000
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontWeight: 500,
            '& span': {
              color: '#2563eb',
              fontWeight: 600
            },
            '& a': {
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }
          }}
        >
          Developed by <span><a href="https://in.linkedin.com/in/zubair-javaid-849524291" target="_blank" rel="noopener noreferrer" style={{color: '#2563eb'}}>Mir Zubair</a></span>
        </Typography>
      </Box>

      {/* Spacer for fixed navbar */}
      <Box sx={{ height: { xs: '64px', sm: '70px' } }} />
    </>
  );
};

export default Navbar;
