import React from 'react';
import { Box } from '@mui/material';

const PulseBar = () => {
  return (
    <Box
      sx={{
        height: 4,
        borderRadius: 0,
        background: '#8b5cf6',
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 1 }
        }
      }}
    />
  );
};

export default PulseBar;