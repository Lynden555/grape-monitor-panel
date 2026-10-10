import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Checkbox, TextField, CircularProgress, Alert, LinearProgress, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import { API_BASE } from '../constants';

const CorteMasivoModal = ({
  open,
  onClose,
  empresas = [],
  folders = [],
  getChildFolders,
  getEmpresasInFolder,
}) => {
  const [paso, setPaso] = useState('seleccion');
  const [seleccion, setSeleccion] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [resultado, setResultado] = useState(null);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');
  const [carpetaId, setCarpetaId] = useState(null);
  const [ruta, setRuta] = useState([]);  

  useEffect(() => {
    if (open) {
      setPaso('seleccion');
      setSeleccion([]);
      setFiltro('');
      setResultado(null);
      setCarpetaId(null);
      setRuta([]);      
      setError('');
      setDescargando(false);
    }
  }, [open]);

  const carpetas = useMemo(() => {
    if (filtro.trim() || !getChildFolders) return [];
    return getChildFolders(carpetaId);
  }, [getChildFolders, carpetaId, filtro, folders]);

  const visibles = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    const base = getEmpresasInFolder
      ? getEmpresasInFolder(carpetaId, empresas)
      : empresas;
    const fuente = q && !carpetaId ? empresas : base;
    const conEquipos = fuente.filter(e => (e.totalImpresoras ?? 0) > 0);
    if (!q) return conEquipos;
    return conEquipos.filter(e => e.nombre?.toLowerCase().includes(q));
  }, [empresas, filtro, carpetaId, getEmpresasInFolder]);

  const totalEquipos = useMemo(
    () => empresas
      .filter(e => seleccion.includes(e._id))
      .reduce((acc, e) => acc + (e.totalImpresoras ?? 0), 0),
    [empresas, seleccion]
  );

  const todosVisiblesMarcados =
    visibles.length > 0 && visibles.every(e => seleccion.includes(e._id));

  const alternarTodos = () => {
    if (todosVisiblesMarcados) {
      setSeleccion(prev => prev.filter(id => !visibles.some(e => e._id === id)));
    } else {
      setSeleccion(prev => [...new Set([...prev, ...visibles.map(e => e._id)])]);
    }
  };

  const alternarUno = (id) => {
    setSeleccion(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

    const entrarCarpeta = (f) => {
    setCarpetaId(f._id);
    setRuta(prev => [...prev, f]);
    setFiltro('');
  };

  const irARaiz = () => {
    setCarpetaId(null);
    setRuta([]);
    setFiltro('');
  };

  const irANivel = (i) => {
    const nueva = ruta.slice(0, i + 1);
    setCarpetaId(nueva[i]._id);
    setRuta(nueva);
    setFiltro('');
  };

  const generar = async () => {
    setPaso('procesando');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cortes-masivos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaIds: seleccion,
          ciudad: localStorage.getItem('ciudad')
        })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'No se pudo generar el corte');
      setResultado(data);
      setPaso('listo');
    } catch (e) {
      setError(e.message);
      setPaso('confirmar');
    }
  };

  const descargarZip = async () => {
    setDescargando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cortes-masivos/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaIds: seleccion,
          ciudad: localStorage.getItem('ciudad')
        })
      });
      if (!res.ok) throw new Error('No se pudo generar el archivo');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contadores-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setDescargando(false);
    }
  };

  const cerrar = () => {
    if (paso === 'procesando' || descargando) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={cerrar} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1 }}>
        {paso === 'listo' ? 'Cortes generados' : 'Corte masivo de contadores'}
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {paso === 'seleccion' && (
          <>
            {(ruta.length > 0 || carpetas.length > 0) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                <Box
                  component="button"
                  onClick={irARaiz}
                  sx={{
                    border: 'none', background: 'none', cursor: 'pointer', p: 0,
                    display: 'grid', placeItems: 'center',
                    color: ruta.length === 0 ? '#7c3aed' : '#999'
                  }}
                >
                  <HomeRoundedIcon sx={{ fontSize: 17 }} />
                </Box>
                {ruta.map((f, i) => (
                  <React.Fragment key={f._id}>
                    <ChevronRightIcon sx={{ fontSize: 14, color: '#ccc' }} />
                    <Box
                      component="button"
                      onClick={() => irANivel(i)}
                      sx={{
                        border: 'none', background: 'none', cursor: 'pointer', p: 0,
                        fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 600,
                        color: i === ruta.length - 1 ? '#7c3aed' : '#999'
                      }}
                    >
                      {f.nombre}
                    </Box>
                  </React.Fragment>
                ))}
              </Box>
            )}

            <TextField
              fullWidth
              size="small"
              placeholder="Buscar cliente"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 18, color: '#999', mr: 1 }} /> }}
              sx={{ mb: 1.5 }}
            />

            <Box
              onClick={alternarTodos}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5,
                borderRadius: '8px', cursor: 'pointer',
                '&:hover': { bgcolor: '#faf8ff' }
              }}
            >
              <Checkbox checked={todosVisiblesMarcados} size="small" sx={{ p: 0.5 }} />
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#7c3aed' }}>
                Seleccionar todos ({visibles.length})
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                              {carpetas.map((f) => (
                <Box
                  key={f._id}
                  onClick={() => entrarCarpeta(f)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75,
                    borderRadius: '8px', cursor: 'pointer',
                    '&:hover': { bgcolor: '#faf8ff' }
                  }}
                >
                  <FolderRoundedIcon sx={{ fontSize: 20, color: '#7c3aed', ml: 0.5 }} />
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#1a1a1a', flex: 1, minWidth: 0 }}>
                    {f.nombre}
                  </Typography>
                  <ChevronRightIcon sx={{ fontSize: 18, color: '#ccc' }} />
                </Box>
              ))}
              {visibles.map((e) => (
                <Box
                  key={e._id}
                  onClick={() => alternarUno(e._id)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5,
                    borderRadius: '8px', cursor: 'pointer',
                    '&:hover': { bgcolor: '#faf8ff' }
                  }}
                >
                  <Checkbox
                    checked={seleccion.includes(e._id)}
                    size="small"
                    sx={{ p: 0.5 }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#1a1a1a' }}>
                      {e.nombre}
                    </Typography>
                    <Typography sx={{ fontSize: '11.5px', color: '#999', fontFamily: 'monospace' }}>
                      {e.totalImpresoras} {e.totalImpresoras === 1 ? 'impresora' : 'impresoras'}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {visibles.length === 0 && carpetas.length === 0 && (
                <Typography sx={{ fontSize: '13px', color: '#999', textAlign: 'center', py: 4 }}>
                  No hay clientes con impresoras.
                </Typography>
              )}
            </Box>
          </>
        )}

        {paso === 'confirmar' && (
          <Box sx={{ py: 1 }}>
            <Typography sx={{ fontSize: '14.5px', color: '#1a1a1a', lineHeight: 1.6 }}>
              Se va a registrar un corte de contadores en{' '}
              <b>{totalEquipos} {totalEquipos === 1 ? 'impresora' : 'impresoras'}</b>{' '}
              de <b>{seleccion.length} {seleccion.length === 1 ? 'cliente' : 'clientes'}</b>.
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#777', mt: 1.5, lineHeight: 1.6 }}>
              Cada corte cierra el periodo actual con la última lectura de cada equipo.
              Esta acción no se puede deshacer.
            </Typography>
          </Box>
        )}

        {paso === 'procesando' && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#7c3aed', mb: 2 }} />
            <Typography sx={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 600 }}>
              Registrando cortes...
            </Typography>
            <Typography sx={{ fontSize: '12.5px', color: '#999', mt: 0.5 }}>
              {totalEquipos} {totalEquipos === 1 ? 'impresora' : 'impresoras'} en proceso
            </Typography>
            <LinearProgress
              sx={{
                mt: 3, borderRadius: 4, bgcolor: '#f0f0f0',
                '& .MuiLinearProgress-bar': { bgcolor: '#7c3aed' }
              }}
            />
          </Box>
        )}

        {paso === 'listo' && resultado && (
          <Box sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 30 }} />
              <Box>
                <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
                  {resultado.exitosos.length} {resultado.exitosos.length === 1 ? 'corte registrado' : 'cortes registrados'}
                </Typography>
                <Typography sx={{ fontSize: '12.5px', color: '#777' }}>
                  {new Date(resultado.fecha).toLocaleString('es-MX')}
                </Typography>
              </Box>
            </Box>

            {resultado.fallidos.length > 0 && (
              <Box sx={{
                p: 1.5, borderRadius: '10px', mb: 2,
                bgcolor: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.3)'
              }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#92400e', mb: 0.5 }}>
                  {resultado.fallidos.length} sin corte
                </Typography>
                <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                  {resultado.fallidos.map((f, i) => (
                    <Typography key={i} sx={{ fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                      {f.clienteNombre} — {f.nombreImpresora}: {f.error}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            <Typography sx={{ fontSize: '13px', color: '#777', lineHeight: 1.6 }}>
              Descarga los PDF en un ZIP, con un archivo por impresora listo para enviar a cada cliente.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {paso === 'seleccion' && (
          <>
            <Button onClick={cerrar} sx={{ textTransform: 'none', color: '#777' }}>
              Cancelar
            </Button>
            <Button
              onClick={() => setPaso('confirmar')}
              disabled={seleccion.length === 0}
              sx={{
                bgcolor: '#7c3aed', color: '#fff', px: 3,
                textTransform: 'none', fontWeight: 700, borderRadius: '10px',
                '&:hover': { bgcolor: '#6d28d9' },
                '&:disabled': { bgcolor: '#e8e8e8', color: '#aaa' }
              }}
            >
              Continuar ({totalEquipos})
            </Button>
          </>
        )}

        {paso === 'confirmar' && (
          <>
            <Button onClick={() => setPaso('seleccion')} sx={{ textTransform: 'none', color: '#777' }}>
              Atrás
            </Button>
            <Button
              onClick={generar}
              sx={{
                bgcolor: '#7c3aed', color: '#fff', px: 3,
                textTransform: 'none', fontWeight: 700, borderRadius: '10px',
                '&:hover': { bgcolor: '#6d28d9' }
              }}
            >
              Sí, generar cortes
            </Button>
          </>
        )}

        {paso === 'listo' && (
          <>
            <Button onClick={cerrar} sx={{ textTransform: 'none', color: '#777' }}>
              Cerrar
            </Button>
            <Button
              onClick={descargarZip}
              disabled={descargando}
              startIcon={descargando ? null : <DownloadIcon />}
              sx={{
                bgcolor: '#16a34a', color: '#fff', px: 3,
                textTransform: 'none', fontWeight: 700, borderRadius: '10px',
                '&:hover': { bgcolor: '#15803d' }
              }}
            >
              {descargando
                ? <CircularProgress size={18} sx={{ color: '#fff' }} />
                : 'Descargar PDF'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CorteMasivoModal;