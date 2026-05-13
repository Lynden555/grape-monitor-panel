import React from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Divider
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

const EmptyState = ({ onCreateEmpresa, onCreateFolder }) => {
  return (
    <Card
      sx={{
        bgcolor: '#ffffff',
        color: '#1a1a1a',
        border: '1px solid #e8e8e8',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 8,
      }}
    >
      <CardContent sx={{
        textAlign: 'center',
        py: 10,
        transform: 'translateY(20px)',
        width: '100%',
      }}>
        <DevicesIcon sx={{
          fontSize: 85,
          mb: 3,
          opacity: 0.15,
          color: '#1a1a1a'
        }} />
        <Typography variant="h4" sx={{
          mb: 2,
          fontWeight: 800,
          color: '#1a1a1a',
          fontFamily: '"Space Grotesk", sans-serif',
        }}>
          Selecciona una impresora
        </Typography>
        <Typography sx={{
          opacity: 0.6,
          maxWidth: 400,
          mx: 'auto',
          mb: 4,
          fontSize: '1.05rem',
          color: '#1a1a1a',
        }}>
          Haz clic en una carpeta del panel izquierdo para ver sus impresoras y comenzar el monitoreo.
        </Typography>
        <Divider sx={{
          borderColor: '#f0f0f0',
          my: 3,
          width: '80%',
          mx: 'auto'
        }} />
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap',
          mt: 2,
        }}>
          <Chip
            icon={<AddCircleIcon />}
            label="Crear nueva impresora"
            onClick={onCreateEmpresa}
            sx={{
              bgcolor: 'rgba(139, 92, 246, 0.08)',
              color: '#7c3aed',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              cursor: 'pointer',
              fontSize: '0.95rem',
              padding: '8px 16px',
              fontWeight: 700,
              '&:hover': {
                bgcolor: 'rgba(139, 92, 246, 0.14)',
              }
            }}
          />
          <Chip
            icon={<CreateNewFolderIcon />}
            label="Crear carpeta"
            onClick={onCreateFolder}
            sx={{
              bgcolor: '#f3f3f3',
              color: '#1a1a1a',
              border: '1px solid #e8e8e8',
              cursor: 'pointer',
              fontSize: '0.95rem',
              padding: '8px 16px',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#e8e8e8',
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmptyState;