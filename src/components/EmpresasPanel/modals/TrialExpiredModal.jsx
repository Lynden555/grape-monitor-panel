import React from 'react';
import {
  Dialog, DialogContent, Button, Typography, Box
} from '@mui/material';
import LockClockIcon from '@mui/icons-material/LockClock';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LogoutIcon from '@mui/icons-material/Logout';
import { handleLogout } from '../utils/scopeHelpers';

const TrialExpiredModal = ({ open, onUpgrade }) => {
  return (
    <Dialog
      open={open}
      // NO se puede cerrar con click fuera ni con ESC
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason === 'backdropClick') return;
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(15, 15, 20, 0.95)',
          backdropFilter: 'blur(30px)',
          color: 'white',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.9)',
        }
      }}
      // Overlay más oscuro para que se sienta más bloqueante
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }
        }
      }}
    >
      <DialogContent sx={{ p: 5, textAlign: 'center' }}>
        {/* Icono */}
        <Box sx={{
          width: 72, height: 72,
          borderRadius: '18px',
          bgcolor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
        }}>
          <LockClockIcon sx={{ color: '#ef4444', fontSize: '38px' }} />
        </Box>

        {/* Título */}
        <Typography sx={{
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '24px',
          letterSpacing: '-0.02em',
          mb: 1.5,
        }}>
          Tu trial expiró
        </Typography>

        {/* Descripción */}
        <Typography sx={{
          color: 'rgba(255, 255, 255, 0.65)',
          fontSize: '15px',
          lineHeight: 1.6,
          mb: 1,
          maxWidth: 420,
          mx: 'auto',
        }}>
          El período de prueba de 30 días ha terminado.
        </Typography>

        <Typography sx={{
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '13px',
          lineHeight: 1.6,
          mb: 4,
          maxWidth: 420,
          mx: 'auto',
        }}>
          Tus datos están seguros y se mantendrán intactos.
          Actualiza tu plan para continuar usando Grape Monitor.
        </Typography>

        {/* Botones */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          maxWidth: 280,
          mx: 'auto',
        }}>
          <Button
            onClick={onUpgrade}
            startIcon={<RocketLaunchIcon />}
            fullWidth
            sx={{
              bgcolor: '#8b5cf6',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '12px',
              py: 1.5,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#8b5cf6',
                filter: 'brightness(1.15)',
                boxShadow: '0 0 24px rgba(139, 92, 246, 0.5)',
              }
            }}
          >
            Ver planes y actualizar
          </Button>

          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            fullWidth
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '13px',
              borderRadius: '12px',
              py: 1.5,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              '&:hover': {
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
              }
            }}
          >
            Cerrar sesión
          </Button>
        </Box>

        {/* Mensaje de soporte */}
        <Typography sx={{
          color: 'rgba(255, 255, 255, 0.3)',
          fontSize: '11px',
          mt: 3,
        }}>
          ¿Necesitas ayuda? Contacta a grapelabs-contact@proton.me
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default TrialExpiredModal;