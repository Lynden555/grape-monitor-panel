import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const AGENT_DOWNLOAD_URL = 'https://github.com/Lynden555/grapeassist-software/releases/download/v2.5.0/Grape.Monitor.Setup.2.9.4.exe';

const DownloadAgentModal = ({ open, onClose, onDownloadSuccess }) => {
  const handleDownload = () => {
    window.open(AGENT_DOWNLOAD_URL);
    onClose();
    onDownloadSuccess?.('✅ Redirigiendo para descargar el Agente...');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(15, 15, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }
      }}
    >
      <DialogTitle sx={{
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '18px',
        letterSpacing: '-0.01em',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '8px',
          bgcolor: 'rgba(16, 185, 129, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mr: 1.5
        }}>
          <DownloadIcon sx={{ color: '#10b981', fontSize: '18px' }} />
        </Box>
        Descargar Agente Grape Monitor
      </DialogTitle>

      <DialogContent>
        <Typography sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          mb: 2
        }}>
          ¿Quieres descargar el Agente de Copias?
        </Typography>

        <Alert
          severity="info"
          icon={false}
          sx={{
            bgcolor: 'rgba(16, 185, 129, 0.08)',
            color: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '10px',
            fontSize: '13px',
            '& .MuiAlert-message': { padding: 0 }
          }}
        >
          El Agente es un ejecutable que se instala en las computadoras con impresoras para monitorearlas automáticamente.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
          sx={{
            bgcolor: '#10b981',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            px: 2.5,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#10b981',
              filter: 'brightness(1.15)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
            }
          }}
        >
          Descargar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadAgentModal;