import React from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Stack, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import KeyIcon from '@mui/icons-material/Key';
import { copyToClipboard, downloadEnv, downloadConfig } from '../utils/downloadHelpers';

const ApiKeyModal = ({
  open,
  onClose,
  empresa,
  onCopySuccess,
  onCopyError
}) => {
  const handleCopy = async (text) => {
    const result = await copyToClipboard(text);
    if (result.ok) onCopySuccess?.(result.message);
    else onCopyError?.(result.message);
  };

  // Estilo reutilizable para las cajas de id/key
  const codeBoxSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: 1.5,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    bgcolor: 'rgba(255, 255, 255, 0.03)',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: 'rgba(139, 92, 246, 0.3)',
      bgcolor: 'rgba(139, 92, 246, 0.03)',
    }
  };

  const labelSx = {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    mb: 0.5,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: 'rgba(15, 15, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          border: '1px solid rgba(139, 92, 246, 0.3)',
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
        pr: 6,
      }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '8px',
          bgcolor: 'rgba(139, 92, 246, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mr: 1.5
        }}>
          <KeyIcon sx={{ color: '#8b5cf6', fontSize: '18px' }} />
        </Box>
        ApiKey generada
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: 'rgba(255, 255, 255, 0.4)',
            '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.05)',
          p: 3
        }}
      >
        {empresa && (
          <Stack spacing={2.5}>
            {/* Empresa */}
            <Box>
              <Typography sx={labelSx}>Empresa</Typography>
              <Typography sx={{
                fontWeight: 700,
                color: '#ffffff',
                fontSize: '16px'
              }}>
                {empresa.nombre}
              </Typography>
            </Box>

            {/* Empresa ID */}
            <Box>
              <Typography sx={labelSx}>Empresa ID</Typography>
              <Box sx={codeBoxSx}>
                <Typography sx={{
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  flex: 1,
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.85)'
                }}>
                  {empresa.empresaId}
                </Typography>
                <IconButton
                  onClick={() => handleCopy(empresa.empresaId)}
                  size="small"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': { color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.1)' }
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* ApiKey */}
            <Box>
              <Typography sx={labelSx}>ApiKey</Typography>
              <Box sx={codeBoxSx}>
                <Typography sx={{
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  flex: 1,
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.85)'
                }}>
                  {empresa.apiKey || '—'}
                </Typography>
                <IconButton
                  onClick={() => empresa.apiKey && handleCopy(empresa.apiKey)}
                  size="small"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': { color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.1)' }
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Botones de descarga */}
            <Stack direction="row" spacing={1} sx={{ pt: 0.5, flexWrap: 'wrap', gap: 1 }}>
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => downloadEnv(empresa)}
                sx={{
                  bgcolor: '#8b5cf6',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#8b5cf6',
                    filter: 'brightness(1.15)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
                  }
                }}
              >
                Descargar .env
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => downloadConfig(empresa)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 2,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(139, 92, 246, 0.3)'
                  }
                }}
              >
                config.json
              </Button>
              <Button
                startIcon={<QrCode2Icon />}
                disabled
                sx={{
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  color: 'rgba(255, 255, 255, 0.3)',
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 2,
                }}
              >
                QR (pronto)
              </Button>
            </Stack>

            {/* Alert info */}
            <Alert
              severity="info"
              icon={false}
              sx={{
                bgcolor: 'rgba(139, 92, 246, 0.08)',
                color: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '10px',
                fontSize: '13px',
                '& .MuiAlert-message': { padding: 0 }
              }}
            >
              Entrega esta ApiKey al técnico. En el Agente, pega la ApiKey y selecciona las impresoras a monitorear.
            </Alert>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        p: 2
      }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiKeyModal;