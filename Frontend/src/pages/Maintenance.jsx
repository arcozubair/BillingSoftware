import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { styled } from '@mui/system';

const BackgroundBox = styled(Box)({
  height: '100vh',
  

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#EF9C07', // Darker background for software
  color: '#ecf0f1', // Light text for better contrast
});

const MaintenanceMessage = styled(Typography)({
  textAlign: 'center',
  fontSize: '3rem',
  fontWeight: 'bold',
  marginBottom: '20px',
  color: '#000',
});

const SubText = styled(Typography)({
  textAlign: 'center',
  fontSize: '1.4rem',
  marginBottom: '40px',
  color: '#000',
});

const DeveloperName = styled(Typography)({
  textAlign: 'center',
  fontSize: '1.2rem',
  fontStyle: 'italic',
  color: '#fff',
  marginTop: '60px',
});



const MaintenancePage = () => {
  return (
    <BackgroundBox>
      <Container maxWidth="xl">
        <MaintenanceMessage>
          We're Updating Things
        </MaintenanceMessage>
        <SubText>
          Our software is currently under scheduled maintenance.
          <br />
          Please check back soon. We appreciate your patience!
        </SubText>
       
        <DeveloperName>
          Developed by Mir Zubair
        </DeveloperName>
      </Container>
    </BackgroundBox>
  );
};

export default MaintenancePage;
