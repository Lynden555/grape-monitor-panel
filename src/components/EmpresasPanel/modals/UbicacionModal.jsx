import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, TextField, Stack, CircularProgress, Alert
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';

const API_BASE = 'https://grape-monitor-production.up.railway.app';

const UbicacionModal = ({ open, onClose, empresa, onGuardada }) => {
  const [modo, setModo] = useState(null);
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [referencia, setReferencia] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const reiniciar = () => {
    setModo(null);
    setQuery('');
    setResultados([]);
    setSeleccion(null);
    setReferencia('');
    setError('');
    setCargando(false);
  };

  const cerrar = () => {
    reiniciar();
    onClose();
  };

  const usarUbicacionActual = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Este dispositivo no permite obtener la ubicación.');
      return;
    }
    setCargando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSeleccion({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          direccion: '',
          nombre: 'Ubicación actual',
          origen: 'gps'
        });
        setModo('confirmar');
        setCargando(false);
      },
      (err) => {
        setCargando(false);
        setError(
          err.code === 1
            ? 'Permiso denegado. Habilita la ubicación en el navegador.'
            : 'No se pudo obtener la ubicación. Intenta con la búsqueda manual.'
        );
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const buscar = async () => {
    if (query.trim().length < 3) {
      setError('Escribe al menos 3 caracteres.');
      return;
    }
    setError('');
    setCargando(true);
    setResultados([]);
    try {
      const res = await fetch(
        `${API_BASE}/api/empresas/buscar-lugar?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Error en la búsqueda');
      if (data.resultados.length === 0) {
        setError('No se encontró nada. Prueba con otra referencia.');
      }
      setResultados(data.resultados);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const guardar = async () => {
    if (!seleccion) return;
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/empresas/${empresa._id}/ubicacion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: seleccion.lat,
          lng: seleccion.lng,
          direccion: seleccion.direccion || seleccion.nombre || '',
          referencia: referencia.trim(),
          origen: seleccion.origen || 'busqueda'
        })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'No se pudo guardar');
      onGuardada(data.ubicacion);
      cerrar();
    } catch (e) {
      setError(e.message);
      setCargando(false);
    }
  };

  return (
    <Dialog open={open} onClose={cerrar} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
        Ubicación de {empresa?.nombre}
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {modo === null && (
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Button
              fullWidth
              startIcon={cargando ? <CircularProgress size={18} /> : <MyLocationIcon />}
              onClick={usarUbicacionActual}
              disabled={cargando}
              sx={{
                color: '#fff', bgcolor: '#7c3aed', fontWeight: 700,
                textTransform: 'none', borderRadius: '12px', py: 1.5,
                '&:hover': { bgcolor: '#6d28d9' }
              }}
            >
              Usar mi ubicación actual
            </Button>
            <Typography sx={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
              Solo si estás en el sitio del cliente
            </Typography>

            <Button
              fullWidth
              startIcon={<SearchIcon />}
              onClick={() => { setModo('buscar'); setError(''); }}
              sx={{
                color: '#1a1a1a', bgcolor: '#fff', fontWeight: 700,
                textTransform: 'none', borderRadius: '12px', py: 1.5,
                border: '1.5px solid #e8e8e8',
                '&:hover': { bgcolor: '#fafafa' }
              }}
            >
              Buscar la dirección
            </Button>
          </Stack>
        )}

        {modo === 'buscar' && (
          <Box sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                autoFocus
                placeholder="Ej. Telesecundaria 90 Maneadero"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscar()}
              />
              <Button
                onClick={buscar}
                disabled={cargando}
                sx={{
                  bgcolor: '#7c3aed', color: '#fff', px: 3,
                  textTransform: 'none', fontWeight: 700, borderRadius: '10px',
                  '&:hover': { bgcolor: '#6d28d9' }
                }}
              >
                {cargando ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Buscar'}
              </Button>
            </Stack>

            <Stack spacing={1} sx={{ mt: 2 }}>
              {resultados.map((r, i) => (
                <Box
                  key={i}
                  onClick={() => { setSeleccion({ ...r, origen: 'busqueda' }); setModo('confirmar'); }}
                  sx={{
                    p: 1.5, borderRadius: '10px', cursor: 'pointer',
                    border: '1px solid #e8e8e8',
                    '&:hover': { bgcolor: '#faf8ff', borderColor: '#8b5cf6' }
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>{r.nombre}</Typography>
                  <Typography sx={{ fontSize: '12.5px', color: '#777' }}>{r.direccion}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {modo === 'confirmar' && seleccion && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#faf8ff', border: '1px solid #ede9fe' }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <PlaceIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
                    {seleccion.nombre}
                  </Typography>
                  {seleccion.direccion && (
                    <Typography sx={{ fontSize: '12.5px', color: '#777' }}>
                      {seleccion.direccion}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: '11.5px', color: '#999', fontFamily: 'monospace', mt: 0.5 }}>
                    {seleccion.lat.toFixed(6)}, {seleccion.lng.toFixed(6)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <TextField
              fullWidth
              size="small"
              sx={{ mt: 2 }}
              label="Referencia (opcional)"
              placeholder="Ej. Portón azul, frente a la tienda"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />

            <Button
              size="small"
              onClick={() => { setSeleccion(null); setModo(null); setError(''); }}
              sx={{ mt: 1, textTransform: 'none', color: '#7c3aed' }}
            >
              Elegir otra ubicación
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={cerrar} sx={{ textTransform: 'none', color: '#777' }}>
          Cancelar
        </Button>
        {modo === 'confirmar' && (
          <Button
            onClick={guardar}
            disabled={cargando}
            sx={{
              bgcolor: '#7c3aed', color: '#fff', px: 3,
              textTransform: 'none', fontWeight: 700, borderRadius: '10px',
              '&:hover': { bgcolor: '#6d28d9' }
            }}
          >
            {cargando ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Guardar ubicación'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UbicacionModal;