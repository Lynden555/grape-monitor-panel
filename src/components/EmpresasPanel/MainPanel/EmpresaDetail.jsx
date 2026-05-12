import React from 'react';
import {
  Box, Card, CardContent, Typography, Button, Stack, LinearProgress
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import PrinterCard from './PrinterCard';
import { handleLogout } from '../utils/scopeHelpers';

const EmpresaDetail = ({
  empresa,
  printers,
  loadingPrinters,
  expandedPrinterId,
  onToggleExpand,
  onPrinterContextMenu,
  onConfirmarCorte,
  onGenerarPDF,
  generandoCorte,
  generandoPDF,
  onViewApiKey,
  onDeleteEmpresa,
}) => {
  return (
    <Card
      sx={{
        bgcolor: '#ffffff',
        color: '#1a1a1a',
        border: '1px solid #e8e8e8',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{
        px: 3, py: 2,
        background: '#1a1a1a',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap'
      }}>
        <DevicesIcon sx={{ color: '#8b5cf6' }} />
        <Typography variant="h6" sx={{
          color: '#ffffff',
          fontWeight: 800,
          fontFamily: '"Space Grotesk", sans-serif',
        }}>
          {empresa.nombre}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          size="small"
          onClick={onViewApiKey}
          sx={{
            color: '#a78bfa',
            borderColor: 'rgba(139, 92, 246, 0.4)',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            '&:hover': {
              bgcolor: 'rgba(139, 92, 246, 0.1)',
              borderColor: '#a78bfa',
            }
          }}
        >
          Ver API Key
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onDeleteEmpresa}
          sx={{
            color: '#f87171',
            borderColor: 'rgba(248, 113, 113, 0.4)',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            '&:hover': {
              bgcolor: 'rgba(220, 38, 38, 0.08)',
              borderColor: '#f87171',
            }
          }}
        >
          Eliminar
        </Button>
      </Box>

      <CardContent sx={{ p: 2 }}>
        {loadingPrinters && <LinearProgress sx={{
          borderRadius: 4,
          bgcolor: '#f0f0f0',
          '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6' }
        }} />}

        {loadingPrinters && (
          <Box sx={{ textAlign: 'center', py: 8, color: '#999' }}>
            <Typography>Cargando impresoras...</Typography>
          </Box>
        )}

        {!loadingPrinters && printers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8, color: '#999' }}>
            <DevicesIcon sx={{ fontSize: 60, mb: 2, opacity: 0.2, color: '#1a1a1a' }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#1a1a1a' }}>
              No hay impresoras
            </Typography>
            <Typography sx={{ opacity: 0.7, maxWidth: 400, mx: 'auto', color: '#999' }}>
              Esta empresa aún no tiene impresoras configuradas.<br />
              Configura el agente para comenzar el monitoreo.
            </Typography>
          </Box>
        )}

        {!loadingPrinters && printers.length > 0 && (
          <Stack spacing={1.5}>
            {printers.map((p) => (
              <PrinterCard
                key={p._id}
                printer={p}
                isExpanded={expandedPrinterId === p._id}
                onToggleExpand={onToggleExpand}
                onContextMenu={onPrinterContextMenu}
                onConfirmarCorte={onConfirmarCorte}
                onGenerarPDF={onGenerarPDF}
                generandoCorte={generandoCorte}
                generandoPDF={generandoPDF}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default EmpresaDetail;