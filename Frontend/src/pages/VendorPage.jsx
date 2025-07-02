import React from 'react';
import { Container, Box } from '@mui/material'; // or '@material-ui/core' depending on your version
import VendorList from '../components/VendorList';
import AdminDashboard from '../components/dash';

const VendorPage = () => {
  return (
    <Container 
      maxWidth="xl" // Adjust the maximum width for different breakpoints
      style={{ height: '100vh', display: 'flex', justifyContent: 'center' }}
    >
      <Box 
        sx={{ 
          width: { xs: '100%', sm: '70%' } // Responsive width: 100% on extra-small screens, 70% on small screens and up
        }}
      >
        <VendorList />
      </Box>
  
    </Container>
    
     
  );
};

export default VendorPage;
