import React from 'react';
import {
  Box, Card, CardContent, Typography, Button, Stack, LinearProgress
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import PlaceIcon from '@mui/icons-material/Place';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
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
  onAgregarUbicacion,
  onEliminarUbicacion,
  onEditarReferencia,
}) => {
  const ubicacion = empresa?.ubicacion;
  const tieneUbicacion =
    typeof ubicacion?.lat === 'number' && typeof ubicacion?.lng === 'number';
  const linkMaps = tieneUbicacion
    ? `https://www.google.com/maps?q=${ubicacion.lat},${ubicacion.lng}`
    : null;
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

        {!tieneUbicacion && (
          <Button
            size="small"
            startIcon={<AddLocationAltIcon />}
            onClick={onAgregarUbicacion}
            sx={{
              color: '#ffffff',
              bgcolor: '#7c3aed',
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '8px',
              px: 2,
              boxShadow: '0 4px 14px -4px rgba(124,58,237,0.8)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#8b5cf6',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 18px -4px rgba(124,58,237,0.9)',
              }
            }}
          >
            Agregar ubicación
          </Button>
        )}

        {tieneUbicacion && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'rgba(74,222,128,0.12)',
              border: '1px solid rgba(74,222,128,0.35)',
              borderRadius: '8px',
              pl: 1,
              pr: 0.5,
              py: 0.25,
            }}
          >
            <Tooltip title={ubicacion.referencia || ubicacion.direccion || 'Abrir en Google Maps'}>
              <Box
                component="a"
                href={linkMaps}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  color: '#4ade80',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  py: 0.5,
                  '&:hover': { color: '#86efac' }
                }}
              >
                <PlaceIcon sx={{ fontSize: 17 }} />
                Ver ubicación
                <OpenInNewIcon sx={{ fontSize: 13, opacity: 0.7 }} />
              </Box>
            </Tooltip>
            <Tooltip title="Eliminar ubicación">
              <IconButton
                size="small"
                onClick={onEliminarUbicacion}
                sx={{
                  color: 'rgba(255,255,255,0.35)',
                  '&:hover': { color: '#f87171', bgcolor: 'rgba(248,113,113,0.1)' }
                }}
              >
                <CloseIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

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

      {tieneUbicacion && (ubicacion.referencia || ubicacion.direccion) && (
        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: '#faf8ff',
            borderBottom: '1px solid #ede9fe',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
          }}
        >
          <PlaceIcon sx={{ color: '#7c3aed', fontSize: 20, mt: '1px', flexShrink: 0 }} />
          <Box sx={{ order: 2, ml: 'auto', flexShrink: 0 }}>
            <Tooltip title="Editar referencia">
              <IconButton
                size="small"
                onClick={onEditarReferencia}
                sx={{
                  color: '#a78bfa',
                  '&:hover': { color: '#7c3aed', bgcolor: 'rgba(139,92,246,0.1)' }
                }}
              >
                <EditIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            {ubicacion.referencia && (
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1a1a1a',
                  lineHeight: 1.45,
                }}
              >
                {ubicacion.referencia}
              </Typography>
            )}
            {ubicacion.direccion && (
              <Typography
                sx={{
                  fontSize: '12.5px',
                  color: '#777',
                  lineHeight: 1.45,
                  mt: ubicacion.referencia ? '2px' : 0,
                }}
              >
                {ubicacion.direccion}
              </Typography>
            )}
          </Box>
        </Box>
      )}

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