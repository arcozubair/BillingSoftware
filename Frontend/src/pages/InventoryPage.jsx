import React from 'react';
import { Container, Box } from '@mui/material'; // or '@material-ui/core' depending on your version
import InventoryList from '../components/InventoryList';

const InventoryPage = () => {
  return (
    <Container 
      maxWidth="xl" 
      style={{ height: '100vh', display: 'flex', justifyContent: 'center' }}
    >
      <Box 
        sx={{ 
          width: { xs: '100%', sm: '80%' } 
        }}
      >
        <InventoryList />
      </Box>
    </Container>
  );
};

export default InventoryPage;
