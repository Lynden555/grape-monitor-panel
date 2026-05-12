import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ConfirmCorteModal = ({ confirmacionCorte, onClose, onConfirm }) => (
  <Dialog
    open={!!confirmacionCorte}
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
        <WarningAmberIcon sx={{ color: '#10b981', fontSize: '18px' }} />
      </Box>
      Confirmar registro de corte
    </DialogTitle>

    <DialogContent>
      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
        ¿Registrar un corte para la impresora:
      </Typography>

      <Box sx={{
        p: 2,
        bgcolor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        mb: 2,
      }}>
        <Typography sx={{
          fontWeight: 700,
          color: '#ffffff',
          fontSize: '15px',
          fontFamily: 'monospace'
        }}>
          {confirmacionCorte?.printerName}
        </Typography>
      </Box>

      <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
        Esta acción guardará los contadores actuales como referencia para el próximo reporte.
      </Typography>
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
        onClick={onConfirm}
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
        Sí, registrar corte
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmCorteModal;