import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1abc9c', 
      contrastText: '#ffffff', // Text on primary backgrounds (buttons, etc.)
    },
    secondary: {
      main: '#B69B59',
      contrastText: '#ffffff', // Text on secondary backgrounds
    },
    text: {
      primary: '#212121', // Default text color
      secondary: '#757575', // Secondary text color
    },
  },
});

export default theme;
