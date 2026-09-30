import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress, Alert
} from '@mui/material';
import { API_BASE } from '../constants';

const VisitaModal = ({ open, onClose, printer, clienteNombre, onGuardada }) => {
  const [nota, setNota] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setNota('');
      setError('');
    }
  }, [open]);

  const guardar = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/visitas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ printerId: printer._id, nota })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'No se pudo agendar');
      onGuardada?.();
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
        Agendar visita
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', bgcolor: '#faf8ff' }}>
          <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.25 }}>
            IMPRESORA
          </Typography>
          <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#1a1a1a' }}>
            {printer?.printerName || printer?.sysName || printer?.host}
          </Typography>
          {clienteNombre && (
            <Typography sx={{ fontSize: '12.5px', color: '#777', mt: 0.25 }}>
              {clienteNombre}
            </Typography>
          )}
        </Box>

        <TextField
          fullWidth
          autoFocus
          multiline
          minRows={2}
          maxRows={4}
          size="small"
          label="Nota (opcional)"
          placeholder="Ej. Llevar magenta, revisar alimentador"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
        <Typography sx={{ fontSize: '11.5px', color: '#999', mt: 1 }}>
          Para recordar por qué la agendaste cuando la veas en tu lista.
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
            bgcolor: '#16a34a', color: '#fff', px: 3,
            textTransform: 'none', fontWeight: 700, borderRadius: '10px',
            '&:hover': { bgcolor: '#15803d' }
          }}
        >
          {cargando ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Agendar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitaModal;