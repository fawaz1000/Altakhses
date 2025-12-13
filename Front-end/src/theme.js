import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary:   { main: '#062b2d' },
    secondary: { main: '#023b37' },
    info:      { main: '#0d5047' },
    success:   { main: '#48d690' },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

export default theme;
