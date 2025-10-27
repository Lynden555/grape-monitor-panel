import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Monitor from '../components/monitor';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4fc3f7',
    },
    background: {
      default: '#0b132b',
      paper: '#0f1b3a',
    },
  },
});

function MonitorPage() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Monitor />
    </ThemeProvider>
  );
}

export default MonitorPage;