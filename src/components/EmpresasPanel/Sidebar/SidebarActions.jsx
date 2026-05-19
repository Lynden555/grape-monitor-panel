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
          startIcon={<CreateNewFolderIcon />}
          onClick={onCreateFolder}
          disabled={loading}
          sx={{
color: '#ffffff',
fontWeight: 800,
textTransform: 'none',
borderRadius: '10px',
bgcolor: '#1a1a1a',
boxShadow: 'none',
border: 'none',
mb: 1,
'&:hover': {
  bgcolor: '#0a0a0a',
  boxShadow: 'none',
  border: 'none',
  textShadow: 'none',
  transform: 'none'
},
            '&:disabled': {
              opacity: 0.6,
              bgcolor: '#cccccc'
            }
          }}
        >
          {loading ? 'Cargando...' : 'Crear Carpeta'}
        </Button>

        <Button
          fullWidth
          startIcon={<AddCircleIcon />}
          onClick={onCreateEmpresa}
          sx={{
color: '#8b5cf6',
fontWeight: 800,
textTransform: 'none',
borderRadius: '10px',
bgcolor: '#ffffff',
boxShadow: 'none',
border: '1.5px solid rgba(139,92,246,0.35)',
'&:hover': {
  bgcolor: 'rgba(139,92,246,0.05)',
  boxShadow: 'none',
  border: '1.5px solid #8b5cf6',
  textShadow: 'none',
  transform: 'none'
}
          }}
        >
          Agregar Cliente
        </Button>

        <Button
          fullWidth
          startIcon={<DownloadIcon />}
          onClick={onDownloadAgent}
          sx={{
color: '#1a1a1a',
fontWeight: 800,
textTransform: 'none',
borderRadius: '10px',
bgcolor: '#ffffff',
boxShadow: 'none',
border: '1.5px solid #e8e8e8',
mt: 2,
'&:hover': {
  bgcolor: '#f3f3f3',
  boxShadow: 'none',
  border: '1.5px solid #d0d0d0',
  textShadow: 'none',
  transform: 'none'
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