import React from 'react';
import { Box, Button, Divider } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DownloadIcon from '@mui/icons-material/Download';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import lockIcon from '../../images/lock.png';

const SidebarActions = ({
  onLogout,
  onCreateFolder,
  onCreateEmpresa,
  onDownloadAgent,
  loading
}) => {
  const handleLogoutClick = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?\n\nSe te redirigirá al login.')) {
      onLogout();
    }
  };

  return (
    <>
      {/* Botón Cerrar Sesión */}
      <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
        <Button
          fullWidth
          onClick={handleLogoutClick}
          sx={{
color: '#dc2626',
fontWeight: 700,
textTransform: 'none',
borderRadius: '10px',
border: '1.5px solid #fecaca',
bgcolor: '#fff5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
'&:hover': {
  bgcolor: '#fef2f2',
  border: '1.5px solid #f87171',
  boxShadow: 'none',
              '& img': {
                transform: 'scale(1.1)',
                filter: 'brightness(1.5) saturate(1.5)'
              }
            }
          }}
        >
          <Box
            component="img"
            src={lockIcon}
            alt="Candado"
            sx={{
              width: '20px',
              height: '20px',
              filter: 'brightness(1.2) saturate(1.2)',
              transition: 'all 0.3s ease',
            }}
          />
          Cerrar Sesión
        </Button>
      </Box>

      <Divider sx={{ borderColor: '#f0f0f0', mx: 2 }} />

      {/* Botones de acción */}
      <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0'}}>
        <Button
          fullWidth
          startIcon={<AddCircleIcon sx={{ fontSize: '22px !important' }} />}
          onClick={onCreateEmpresa}
          sx={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '15px',
            textTransform: 'none',
            borderRadius: '12px',
            bgcolor: '#7c3aed',
            border: 'none',
            py: 1.6,
            mb: 1.5,
            boxShadow: '0 6px 18px -6px rgba(124,58,237,0.65)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#6d28d9',
              boxShadow: '0 8px 22px -6px rgba(124,58,237,0.8)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          Agregar Cliente
        </Button>

        <Button
          fullWidth
          startIcon={<CreateNewFolderIcon />}
          onClick={onCreateFolder}
          disabled={loading}
          sx={{
            color: '#52525b',
            fontWeight: 700,
            fontSize: '14px',
            textTransform: 'none',
            borderRadius: '10px',
            bgcolor: '#ffffff',
            boxShadow: 'none',
            border: '1.5px solid #e8e8e8',
            py: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#fafafa',
              border: '1.5px solid #d4d4d8',
              boxShadow: 'none'
            },
            '&:disabled': {
              opacity: 0.6,
              bgcolor: '#f4f4f5'
            }
          }}
        >
          {loading ? 'Cargando...' : 'Crear Carpeta'}
        </Button>

        <Button
          fullWidth
          startIcon={<DownloadIcon />}
          onClick={onDownloadAgent}
          sx={{
            color: '#5b21b6',
            fontWeight: 800,
            fontSize: '14px',
            textTransform: 'none',
            borderRadius: '10px',
            bgcolor: 'rgba(139,92,246,0.07)',
            boxShadow: 'none',
            border: '1.5px solid rgba(139,92,246,0.28)',
            py: 1.2,
            mt: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(139,92,246,0.13)',
              border: '1.5px solid #8b5cf6',
              boxShadow: 'none',
              transform: 'translateY(-1px)'
            }
          }}
        >
          Descargar Agente
        </Button>
      </Box>
    </>
  );
};

export default SidebarActions;