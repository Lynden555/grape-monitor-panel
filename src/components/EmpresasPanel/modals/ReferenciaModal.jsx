import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress, Alert
} from '@mui/material';

const API_BASE = 'https://grape-monitor-production.up.railway.app';

const ReferenciaModal = ({ open, onClose, empresa, onGuardada }) => {
  const [referencia, setReferencia] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setReferencia(empresa?.ubicacion?.referencia || '');
      setError('');
    }
  }, [open, empresa]);

  const guardar = async () => {
    const u = empresa?.ubicacion;
    if (!u) return;

    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/empresas/${empresa._id}/ubicacion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: u.lat,
          lng: u.lng,
          direccion: u.direccion || '',
          referencia: referencia.trim(),
          origen: u.origen || 'manual'
        })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'No se pudo guardar');
      onGuardada(data.ubicacion);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.05rem', pb: 1 }}>
        Referencia del lugar
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {empresa?.ubicacion?.direccion && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', bgcolor: '#faf8ff' }}>
            <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.25 }}>
              DIRECCIÓN
            </Typography>
            <Typography sx={{ fontSize: '12.5px', color: '#555', lineHeight: 1.4 }}>
              {empresa.ubicacion.direccion}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          autoFocus
          multiline
          minRows={2}
          maxRows={4}
          size="small"
          label="Referencia"
          placeholder="Ej. Casa azul con reja negra frente al parque, esquina con Oxxo"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
        />
        <Typography sx={{ fontSize: '11.5px', color: '#999', mt: 1 }}>
          Cómo reconocer el lugar al llegar. Para cambiar la dirección, elimina
          la ubicación y captúrala de nuevo.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#777' }}>
          Cancelar
        </Button>
        <Button
          onClick={guardar}
          disabled={cargando}
          sx={{
            bgcolor: '#7c3aed', color: '#fff', px: 3,
            textTransform: 'none', fontWeight: 700, borderRadius: '10px',
            '&:hover': { bgcolor: '#6d28d9' }
          }}
        >
          {cargando ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReferenciaModal;