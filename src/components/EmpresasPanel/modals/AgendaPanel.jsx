import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer, Box, Typography, IconButton, CircularProgress, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { API_BASE } from '../constants';

const diasDesde = (fecha) => {
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
};

const AgendaPanel = ({ open, onClose, onCambio, onIrAVisita }) => {
  const [visitas, setVisitas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [quitando, setQuitando] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE}/api/visitas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.ok) setVisitas(data.data);
    } catch (e) {
      console.error('Error cargando visitas:', e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (open) cargar();
  }, [open, cargar]);

  const quitar = async (id) => {
    setQuitando(id);
    try {
      const res = await fetch(`${API_BASE}/api/visitas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.ok) {
        setVisitas((prev) => prev.filter((v) => v._id !== id));
        onCambio?.();
      }
    } catch (e) {
      console.error('Error quitando visita:', e);
    } finally {
      setQuitando(null);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          bgcolor: '#15101F',
          backgroundImage: 'none',
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 2,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: '#F4F1FB', fontWeight: 800, fontSize: '16px' }}>
              Visitas pendientes
            </Typography>
            <Typography
              sx={{
                color: 'rgba(244,241,251,0.45)',
                fontSize: '12px',
                fontFamily: 'ui-monospace, monospace',
                mt: '2px',
              }}
            >
              {visitas.length} {visitas.length === 1 ? 'equipo' : 'equipos'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: 'rgba(244,241,251,0.4)',
              '&:hover': { color: '#F4F1FB', bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(255,255,255,0.12)',
              borderRadius: '4px',
            },
          }}
        >
          {cargando && (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
              <CircularProgress size={26} sx={{ color: '#8b5cf6' }} />
            </Box>
          )}

          {!cargando && visitas.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
              <EventBusyIcon sx={{ fontSize: 48, color: 'rgba(244,241,251,0.15)', mb: 2 }} />
              <Typography sx={{ color: 'rgba(244,241,251,0.45)', fontSize: '13.5px', lineHeight: 1.6 }}>
                No tienes visitas pendientes.
                <br />
                Agrégalas desde el detalle de cada impresora.
              </Typography>
            </Box>
          )}

          {!cargando && visitas.map((v) => (
            <Box
              key={v._id}
              sx={{
                p: 2,
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.07)',
                bgcolor: 'rgba(255,255,255,0.03)',
                opacity: quitando === v._id ? 0.4 : 1,
                cursor: 'pointer',
                transition: 'opacity .2s ease, background .18s ease, border-color .18s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.06)',
                  borderColor: 'rgba(139,92,246,0.3)',
                },
              }}
              onClick={() => onIrAVisita?.(v)}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: '#F4F1FB', fontWeight: 700, fontSize: '14px', lineHeight: 1.35 }}>
                    {v.clienteNombre}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(244,241,251,0.5)',
                      fontSize: '12px',
                      fontFamily: 'ui-monospace, monospace',
                      mt: '2px',
                    }}
                  >
                    {v.impresoraNombre} · {diasDesde(v.creadaEn)}
                  </Typography>
                </Box>

                <Tooltip title="Marcar como atendida">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); quitar(v._id); }}
                    disabled={quitando === v._id}
                    sx={{
                      color: 'rgba(244,241,251,0.3)',
                      '&:hover': { color: '#4ade80', bgcolor: 'rgba(74,222,128,0.1)' },
                    }}
                  >
                    <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {v.nota && (
                <Typography
                  sx={{
                    color: '#fcd34d',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    mt: 1.25,
                    p: 1.25,
                    borderRadius: '9px',
                    bgcolor: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.18)',
                  }}
                >
                  {v.nota}
                </Typography>
              )}

              {v.ubicacion?.lat && (
                <Box
                  component="a"
                  href={`https://www.google.com/maps?q=${v.ubicacion.lat},${v.ubicacion.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    mt: 1.25,
                    p: 1.25,
                    borderRadius: '9px',
                    textDecoration: 'none',
                    bgcolor: 'rgba(139,92,246,0.08)',
                    border: '1px solid rgba(139,92,246,0.18)',
                    transition: 'background .18s ease',
                    '&:hover': { bgcolor: 'rgba(139,92,246,0.14)' },
                  }}
                >
                  <PlaceIcon sx={{ fontSize: 16, color: '#a78bfa', flexShrink: 0, mt: '1px' }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    {v.ubicacion.referencia && (
                      <Typography sx={{ color: '#F4F1FB', fontSize: '12.5px', fontWeight: 600, lineHeight: 1.4 }}>
                        {v.ubicacion.referencia}
                      </Typography>
                    )}
                    {v.ubicacion.direccion && (
                      <Typography sx={{ color: 'rgba(244,241,251,0.45)', fontSize: '11.5px', lineHeight: 1.4 }}>
                        {v.ubicacion.direccion}
                      </Typography>
                    )}
                  </Box>
                  <OpenInNewIcon sx={{ fontSize: 13, color: '#a78bfa', flexShrink: 0, mt: '2px' }} />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
};

export default AgendaPanel;