import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Container, Grid, Card, CardContent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';

const drawerWidth = 240;

const AdminDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <div>
      <List>
        <ListItem button>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><AnalyticsIcon /></ListItemIcon>
          <ListItemText primary="Analytics" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" style={{ width: `calc(100% - ${drawerWidth}px)`, marginLeft: drawerWidth }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Admin Dashboard
          </Typography>
          <div style={{ flexGrow: 1 }} />
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={mobileOpen}
      >
        {drawer}
      </Drawer>
      <main
        style={{
          flexGrow: 1,
          backgroundColor: '#f5f5f5',
          padding: '2rem',
          marginLeft: drawerWidth,
          marginTop: '64px',
        }}
      >
        <Container>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Sales
                  </Typography>
                  <Typography variant="h4">
                    $1,234,567
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    2,345
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pending Orders
                  </Typography>
                  <Typography variant="h4">
                    123
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
};

export default AdminDashboard;
