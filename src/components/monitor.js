import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Stack, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider,
  List, ListItemButton, ListItemText, ListSubheader, LinearProgress, Chip, Tooltip
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CloseIcon from '@mui/icons-material/Close';
import DevicesIcon from '@mui/icons-material/Devices';
import PrintIcon from '@mui/icons-material/Print';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const API_BASE = 'https://grape-monitor-production.up.railway.app';

export default function EmpresasPanel() {
  // ====== estado base (siempre al tope, sin condicionales) ======
  const [empresas, setEmpresas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [confirmacionCorte, setConfirmacionCorte] = useState(null);

  // derecha: modo = 'list' | 'create' | 'empresa'
  const [mode, setMode] = useState('list');

  // form crear
  const [nombre, setNombre] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaRecienCreada, setEmpresaRecienCreada] = useState(null); // {empresaId, apiKey, nombre}
  const canSubmit = useMemo(() => (nombre.trim().length >= 3), [nombre]);

  // impresoras
  const [printers, setPrinters] = useState([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [expandedPrinterId, setExpandedPrinterId] = useState(null);

    // 🆕 ESTADOS PARA CORTES Y PDF
  const [generandoCorte, setGenerandoCorte] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(null);

  // confirm delete
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // auth listo (evita return tempranos)
  const [isAuthReady, setIsAuthReady] = useState(false);

  // 🔁 Auto-refresco cada 120s para traer nuevas lecturas del backend
useEffect(() => {
  if (!isAuthReady) return;
  const tick = () => {
    if (selectedEmpresa?._id) {
      loadPrinters(selectedEmpresa._id);
    }
  };
  // opcional: primer tick inmediato
  const t = setInterval(tick, 120_000);
  return () => clearInterval(t);
}, [isAuthReady, selectedEmpresa?._id]); 

  // ====== helpers ======
  const copy = async (txt) => {
    try { await navigator.clipboard.writeText(txt); setSuccessMsg('Copiado al portapapeles'); }
    catch { setErrorMsg('No se pudo copiar'); }
  };

  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadEnv = () => {
    if (!empresaRecienCreada) return;
    const env = [
      `API_URL=${API_BASE}/api/metrics/impresoras`,
      `SITE_API_KEY=${empresaRecienCreada.apiKey}`,
      `EMPRESA_ID=${empresaRecienCreada.empresaId}`,
      `SNMP_COMMUNITY=public`,
      `INTERVAL_MS=300000`,
      `AGENT_VERSION=1.0.0`,
    ].join('\n');
    downloadFile(`${empresaRecienCreada.nombre.replace(/\s+/g,'_')}.env`, env + '\n');
  };

  const downloadConfig = () => {
    if (!empresaRecienCreada) return;
    const cfg = {
      apiUrl: `${API_BASE}/api/metrics/impresoras`,
      siteApiKey: empresaRecienCreada.apiKey,
      empresaId: empresaRecienCreada.empresaId,
      community: 'public',
      intervalMs: 300000,
      printers: []
    };
    downloadFile(`config_${empresaRecienCreada.nombre.replace(/\s+/g,'_')}.json`, JSON.stringify(cfg, null, 2));
  };


  // ⏱️ Umbral de frescura: 2 minutos
const STALE_MS = 2 * 60 * 1000;
// 🎛️ Holgura de UI: si llegó una lectura nueva, mantenemos "online" localmente hasta…
const GRACE_MS = 60 * 1000; // 60s de gracia visual para evitar parpadeo

// repintado periódico (evita recargar la página)
const [now, setNow] = useState(Date.now());
useEffect(() => {
  const t = setInterval(() => setNow(Date.now()), 15_000);
  return () => clearInterval(t);
}, []);

// Guardamos, por impresora, (a) el último lastSeenAt visto y (b) hasta cuándo mantener online
const lastSeenRef = useRef(new Map());      // id -> ISO lastSeenAt
const holdUntilRef = useRef(new Map());     // id -> timestamp (ms epoch)

// Fusiona lista nueva con lo recordado y extiende "online" si hay nueva lectura
const applyAndRemember = (list = []) => {
  const merged = list.map((p) => {
    const latest = p.latest || {};
    const prevSeen = lastSeenRef.current.get(p._id) || null;
    const newSeen  = latest.lastSeenAt || prevSeen;

    // si la lectura es más nueva que la recordada, extender "holdUntil"
    if (latest.lastSeenAt && (!prevSeen || new Date(latest.lastSeenAt) > new Date(prevSeen))) {
      holdUntilRef.current.set(p._id, Date.now() + STALE_MS + GRACE_MS);
    }

    // si no tenemos holdUntil previo, inicialízalo cuando hay lastSeenAt
    if (newSeen && !holdUntilRef.current.has(p._id)) {
      holdUntilRef.current.set(p._id, Date.now() + STALE_MS + GRACE_MS);
    }

    // persistimos el lastSeenAt consolidado
    lastSeenRef.current.set(p._id, newSeen || null);

    return {
      ...p,
      _lastSeenAt: newSeen || null,
      _holdUntil: holdUntilRef.current.get(p._id) || 0,
    };
  });

  // Limpieza opcional de ids que ya no existen
  const idsNow = new Set(merged.map(p => p._id));
  for (const id of lastSeenRef.current.keys()) if (!idsNow.has(id)) lastSeenRef.current.delete(id);
  for (const id of holdUntilRef.current.keys()) if (!idsNow.has(id)) holdUntilRef.current.delete(id);

  setPrinters(merged);
};

// Cálculo final para UI: si estamos dentro del holdUntil -> Online; si no, usa antigüedad
const isOnlineUI = (p, nowTs = Date.now()) => {
  const latest = p.latest || {};
  if (latest.online === false) return false;               // backend lo forzó
  if ((p._holdUntil || 0) > nowTs) return true;            // sticky online activo
  if (!p._lastSeenAt) return false;
  const age = nowTs - new Date(p._lastSeenAt).getTime();
  return age <= STALE_MS;                                   // fallback por antigüedad
};



  // ====== utils de scope ======
  const getScope = () => ({
    empresaId: localStorage.getItem('empresaId') || '',
    ciudad:    localStorage.getItem('ciudad')    || '',
  });

  // 🆕 FUNCIONES PARA CORTES Y PDF - PEGAR DESPUÉS DE getScope()
const handleConfirmarCorte = (printerId) => {
  const printer = printers.find(p => p._id === printerId);
  setConfirmacionCorte({
    printerId,
    printerName: printer?.printerName || printer?.host || 'Impresora'
  });
};

const handleRegistrarCorte = async () => {
  if (!confirmacionCorte) return;
  
  const printerId = confirmacionCorte.printerId;
  
  try {
    setGenerandoCorte(printerId);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await fetch(`${API_BASE}/api/impresoras/${printerId}/registrar-corte`, {
      method: 'POST'
    });

    const data = await res.json();
    
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || 'Error registrando corte');
    }

    setSuccessMsg(`✅ Corte registrado: ${data.datos?.totalPaginas || 0} páginas este período`);
    
    // Recargar datos de impresoras
    if (selectedEmpresa?._id) {
      await loadPrinters(selectedEmpresa._id);
    }

  } catch (err) {
    console.error('Error registrando corte:', err);
    setErrorMsg(err.message);
  } finally {
    setGenerandoCorte(null);
    setConfirmacionCorte(null);
  }
};

const handleGenerarPDF = async (printerId) => {
  try {
    setGenerandoPDF(printerId);
    setErrorMsg('');
    setSuccessMsg('');

    console.log('🔄 Iniciando descarga de PDF...');
    
    const response = await fetch(`${API_BASE}/api/impresoras/${printerId}/generar-pdf`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error('Error del servidor al generar PDF');
    }

    // Verificar que sea un PDF
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('El servidor no devolvió un PDF válido');
    }

    // Crear blob y descargar
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Crear enlace de descarga visible
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre de la impresora para el archivo
    const printer = printers.find(p => p._id === printerId);
    const printerName = printer?.printerName || printer?.host || 'impresora';
    const fileName = `reporte-${printerName}-${new Date().toISOString().split('T')[0]}.pdf`;
    link.download = fileName;
    
    // Hacer clic automático y limpiar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('✅ PDF descargado exitosamente');
    setSuccessMsg(`📄 PDF "${fileName}" descargado correctamente`);

  } catch (err) {
    console.error('❌ Error generando PDF:', err);
    setErrorMsg(`Error al generar PDF: ${err.message}`);
  } finally {
    setGenerandoPDF(null);
  }
};

  // ====== loaders ======
  const loadEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
    const { empresaId, ciudad } = getScope(); // usa lo que ya definiste arriba
    const qs = new URLSearchParams({ empresaId, ciudad }).toString();
    const res = await fetch(`${API_BASE}/api/empresas?${qs}`);
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'No se pudieron cargar empresas');

      const lista = data.data || [];
      setEmpresas(lista);

      // restaurar selección previa si sigue existiendo
      const storedId = localStorage.getItem('selectedEmpresaId');
      let toSelect = storedId ? lista.find(e => String(e._id) === String(storedId)) || null : null;
      if (!toSelect && lista.length === 1) toSelect = lista[0];

      if (toSelect) {
        setSelectedEmpresa(toSelect);
        setMode('empresa');
        setExpandedPrinterId(null);
        await loadPrinters(toSelect._id);
      } else {
        setSelectedEmpresa(null);
        setMode('list');
        setPrinters([]);
      }
    } catch (e) {
      console.error(e);
      setEmpresas([]); setSelectedEmpresa(null); setPrinters([]);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const loadPrinters = async (empresaIdParam) => {
    setLoadingPrinters(true);
    try {
      const { ciudad } = getScope(); // ciudad "fresca"
      const q = ciudad ? `?ciudad=${encodeURIComponent(ciudad)}` : '';
      const res = await fetch(`${API_BASE}/api/empresas/${empresaIdParam}/impresoras${q}`);
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'No se pudieron cargar impresoras');

    applyAndRemember(data.data || []);
    } catch (e) {
      console.error('Error al cargar impresoras:', e);
      setPrinters([]);
    } finally {
      setLoadingPrinters(false);
    }
  };

  // ====== auth guard sin returns tempranos ======
  useEffect(() => {
    const { empresaId } = getScope();
    if (!empresaId) {
      // redirige sin romper el orden de hooks
      window.location.replace('/login');
      return;
    }
    setIsAuthReady(true);
  }, []);

  // carga inicial cuando auth está listo
  useEffect(() => {
    if (!isAuthReady) return;
    loadEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady]);

  // detectar cambios de empresa/ciudad (logout o cambio de scope) vía focus/storage
  useEffect(() => {
    if (!isAuthReady) return;

    let prev = getScope();

    const enforceAuth = () => {
      const { empresaId } = getScope();
      if (!empresaId) {
        // limpiar y mandar a login
        setEmpresas([]); setSelectedEmpresa(null); setPrinters([]);
        localStorage.removeItem('selectedEmpresaId');
        window.location.replace('/login');
        return false;
      }
      return true;
    };

    const handleScopeChange = () => {
      if (!enforceAuth()) return;
      const cur = getScope();
      if (cur.empresaId !== prev.empresaId || cur.ciudad !== prev.ciudad) {
        prev = cur;
        // reset UI y recargar con nuevo scope
        localStorage.removeItem('selectedEmpresaId');
        setSelectedEmpresa(null);
        setPrinters([]);
        setMode('list');
        loadEmpresas();
      }
    };

    const onFocus   = () => handleScopeChange();
    const onStorage = (e) => {
      if (e.key === 'empresaId' || e.key === 'ciudad') handleScopeChange();
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [isAuthReady]);

  // ====== acciones ======
  const handleSelectEmpresa = async (emp) => {
    setSelectedEmpresa(emp);
    localStorage.setItem('selectedEmpresaId', emp._id);
    setMode('empresa');
    setExpandedPrinterId(null);
    await loadPrinters(emp._id);
  };

  const handleCrearEmpresa = async () => {
    try {
      setErrorMsg(''); setSuccessMsg(''); setLoadingCreate(true);
      const res = await fetch(`${API_BASE}/api/empresas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        nombre: nombre.trim(),
        empresaId: localStorage.getItem('empresaId'),
        ciudad: localStorage.getItem('ciudad') })
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || `Error ${res.status}`);

      const nueva = { _id: data.empresaId, nombre: nombre.trim(), apiKey: data.apiKey };
      setEmpresaRecienCreada({ empresaId: data.empresaId, apiKey: data.apiKey, nombre: nombre.trim() });
      setModalOpen(true);
      setSuccessMsg(`Empresa creada: ${nombre.trim()}`);
      setNombre('');

      setEmpresas(prev => [{ _id: data.empresaId, nombre: nueva.nombre }, ...prev]);
      setSelectedEmpresa({ _id: data.empresaId, nombre: nueva.nombre });
      localStorage.setItem('selectedEmpresaId', data.empresaId);
      setMode('empresa');
      await loadPrinters(data.empresaId);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoadingCreate(false);
    }
  };

  const verApiKeyEmpresa = async () => {
    if (!selectedEmpresa?._id) return;
    try {
      setErrorMsg(''); setSuccessMsg(''); setLoadingCreate(true);
      const res = await fetch(`${API_BASE}/api/empresas/${selectedEmpresa._id}`);
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || `Error ${res.status}`);

      setEmpresaRecienCreada({
        empresaId: data.data._id,
        apiKey:    data.data.apiKey,
        nombre:    data.data.nombre
      });
      setModalOpen(true);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoadingCreate(false);
    }
  };

  const solicitarEliminarEmpresa = () => {
    if (!selectedEmpresa?._id) return;
    setConfirmDeleteOpen(true);
  };

  const confirmarEliminarEmpresa = async () => {
    if (!selectedEmpresa?._id) return;
    try {
      setErrorMsg(''); setSuccessMsg(''); setLoadingCreate(true);
      const res = await fetch(`${API_BASE}/api/empresas/${selectedEmpresa._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || `Error ${res.status}`);

      setEmpresas(prev => prev.filter(e => String(e._id) !== String(selectedEmpresa._id)));
      setSelectedEmpresa(null);
      localStorage.removeItem('selectedEmpresaId');
      setPrinters([]);
      setMode('list');
      setSuccessMsg('Empresa eliminada correctamente');
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoadingCreate(false);
      setConfirmDeleteOpen(false);
    }
  };

  const cancelarEliminarEmpresa = () => setConfirmDeleteOpen(false);

  // ====== UI helpers ======
  const tonerPercent = (lvl, max) => {
    if (!max || max <= 0) return 0;
    const p = Math.round((Number(lvl) / Number(max)) * 100);
    return Math.max(0, Math.min(100, p));
  };

const handleLogout = () => {
  localStorage.removeItem('empresaId');
  localStorage.removeItem('ciudad');
  localStorage.removeItem('userEmail');
  window.location.href = '/login';
};

  // ====== RENDER ======
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 2,
        p: 2,
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 10% 10%, rgba(79, 70, 222, 0.08) 0%, rgba(53, 29, 121, 0) 40%), ' +
          'radial-gradient(circle at 90% 20%, rgba(254, 89, 83, 0.10) 0%, rgba(46, 0, 79, 0) 45%), ' +
          'linear-gradient(180deg, #2e004f 0%, #351d79 100%)',
      }}
    >
      {/* PANEL IZQUIERDO */}
      <Card
        sx={{
          bgcolor: '#351d79',
          color: 'white',
          border: '2px solid #4f46de',
          borderRadius: '16px',
          boxShadow:
            '0 0 0 1px rgba(79, 70, 222, 0.15), 0 10px 30px rgba(0,0,0,0.5), inset 0 0 40px rgba(79, 70, 222, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >


  {/* 🆕 BOTÓN CERRAR SESIÓN EN SIDEBAR */}
  <Button
    fullWidth
    onClick={() => {
      if (window.confirm('¿Estás seguro de que quieres cerrar sesión?\n\nSe te redirigirá al login.')) {
        handleLogout();
      }
    }}
    sx={{
      mt: 1,
      color: '#ff6b6b',
      fontWeight: 700,
      textTransform: 'none',
      borderRadius: '12px',
      border: '2px solid #ff6b6b',
      bgcolor: 'rgba(255, 107, 107, 0.1)',
      '&:hover': {
        bgcolor: 'rgba(255, 107, 107, 0.2)',
        border: '2px solid #ff5252',
        boxShadow: '0 0 15px rgba(255, 107, 107, 0.4)'
      }
    }}
  >
    🔓 Cerrar Sesión
  </Button>


<Box sx={{ p: 2, borderBottom: '1px solid rgba(79, 70, 222, 0.2)' }}>
  <Button
    fullWidth
    startIcon={<AddCircleIcon />}
    onClick={() => { setMode('create'); setSelectedEmpresa(null); }}
    sx={{
      color: 'white',
      fontWeight: 800,
      textTransform: 'none',
      borderRadius: '12px',
      bgcolor: '#4f46de',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      border: '1px solid rgba(79, 70, 222, 0.3)',
      '&:hover': { 
        bgcolor: '#5d55e8',
        boxShadow: `
          0 0 10px #4f46de,
          0 0 20px #4f46de, 
          0 0 40px #4f46de,
          inset 0 0 10px rgba(79, 70, 222, 0.3)
        `,
        border: '1px solid rgba(79, 70, 222, 0.8)',
        textShadow: '0 0 10px rgba(255,255,255,0.8)',
        transform: 'translateY(-2px)'
      }
    }}
  >
    Agregar Empresa
  </Button>
  

</Box>
        <List
          dense
          subheader={
            <ListSubheader
              sx={{
                bgcolor: 'transparent', color: '#d0bfff',
                borderBottom: '1px solid rgba(79, 70, 222, 0.18)'
              }}
            >
              Empresas
            </ListSubheader>
          }
          sx={{ flex: 1, overflowY: 'auto' }}
        >
          {loadingEmpresas && (
            <Box sx={{ px: 2, py: 1 }}>
              <LinearProgress />
            </Box>
          )}
          {empresas.map((e) => (
            <ListItemButton
              key={e._id}
              selected={selectedEmpresa?._id === e._id}
              onClick={() => handleSelectEmpresa(e)}
              sx={{
                color: 'white',
                '&.Mui-selected': { bgcolor: 'rgba(79, 70, 222, 0.15)' },
                '&:hover': { bgcolor: 'rgba(79, 70, 222, 0.08)' }
              }}
            >
              <ListItemText
                primary={<Typography sx={{ fontWeight: 700 }}>{e.nombre}</Typography>}
                secondary={<Typography sx={{ color: '#b8a9ff' }}>ID: {e._id}</Typography>}
              />
            </ListItemButton>
          ))}
          {!loadingEmpresas && empresas.length === 0 && (
            <Typography sx={{ p: 2, color: '#b8a9ff' }}>
              No hay empresas. Crea la primera con el botón de arriba.
            </Typography>
          )}
        </List>
      </Card>

      {/* PANEL DERECHO */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
       
{/* Header glow - Rojo Neon */}
<Box
  sx={{
    height: 6,
    borderRadius: 3,
    background: '#fe5953',
    boxShadow: `
      0 0 10px #fe5953,
      0 0 20px #fe5953,
      0 0 40px #fe5953,
      0 0 80px #fe5953
    `,
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%': {
        boxShadow: `
          0 0 10px #fe5953,
          0 0 20px #fe5953,
          0 0 40px #fe5953,
          0 0 80px #fe5953
        `
      },
      '50%': {
        boxShadow: `
          0 0 15px #fe5953,
          0 0 30px #fe5953,
          0 0 60px #fe5953,
          0 0 120px #fe5953
        `
      },
      '100%': {
        boxShadow: `
          0 0 10px #fe5953,
          0 0 20px #fe5953,
          0 0 40px #fe5953,
          0 0 80px #fe5953
        `
      }
    }
  }}
/>

        {/* CONTENIDO */}
        {mode === 'create' && (
          <Card
            sx={{
              bgcolor: '#351d79', color: 'white',
              border: '2px solid #4f46de', borderRadius: '16px',
              boxShadow:
                '0 0 0 1px rgba(79, 70, 222, 0.15), 0 10px 30px rgba(0,0,0,0.45), inset 0 0 40px rgba(79, 70, 222, 0.08)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 3, py: 2,
                background: 'linear-gradient(90deg, rgba(79, 70, 222, 0.8) 0%, rgba(53, 29, 121, 0.8) 100%)',
                borderBottom: '1px solid rgba(79, 70, 222, 0.2)',
              }}
            >
              <Typography variant="h5" sx={{ color: '#b8a9ff', fontWeight: 800, letterSpacing: 0.5 }}>
                ⚙️ Agregar empresa & generar ApiKey
              </Typography>
              <Typography sx={{ color: '#d0bfff', opacity: 0.9, mt: 0.5 }}>
                Crea una empresa y comparte su ApiKey al técnico para configurar el Agente.
              </Typography>
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                {errorMsg && (
                  <Alert severity="error" sx={{ bgcolor:'rgba(244,67,54,0.08)', color:'#ff9e9e', border:'1px solid rgba(244,67,54,0.35)' }}>
                    {errorMsg}
                  </Alert>
                )}
                {successMsg && (
                  <Alert severity="success" sx={{ bgcolor:'rgba(76,175,80,0.08)', color:'#9de6a2', border:'1px solid rgba(76,175,80,0.35)' }}>
                    {successMsg}
                  </Alert>
                )}

                <TextField
                  label="Nombre de la empresa"
                  variant="outlined"
                  fullWidth
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  inputProps={{ maxLength: 64 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      bgcolor: 'rgba(46, 0, 79, 0.55)',
                      backdropFilter: 'blur(6px)',
                      '& fieldset': { borderColor: '#4f46de' },
                      '&:hover fieldset': { borderColor: '#fe5953' },
                      '&.Mui-focused fieldset': { borderColor: '#fe5953' },
                    },
                    '& .MuiInputLabel-root': { color: '#b8a9ff' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#fe5953' },
                  }}
                  helperText={<span style={{ color: '#b8a9ff' }}>Ingresa un nombre único. Se generará una ApiKey segura.</span>}
                />

<Button
  variant="contained"
  disabled={!canSubmit || loadingCreate}
  onClick={handleCrearEmpresa}
  sx={{
    alignSelf: 'flex-start',
    color: 'white',
    fontWeight: 800,
    px: 3, py: 1.2, textTransform: 'none', borderRadius: '12px',
    bgcolor: '#4f46de',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    border: '1px solid rgba(79, 70, 222, 0.3)',
    '&:hover': { 
      bgcolor: '#5d55e8',
      boxShadow: `
        0 0 10px #4f46de,
        0 0 20px #4f46de,
        0 0 40px #4f46de,
        inset 0 0 10px rgba(79, 70, 222, 0.3)
      `,
      border: '1px solid rgba(79, 70, 222, 0.8)',
      textShadow: '0 0 10px rgba(255,255,255,0.8)',
      transform: 'translateY(-2px)'
    },
    '&:disabled': { 
      opacity: 0.6,
      boxShadow: 'none'
    }
  }}
>
  {loadingCreate ? 'Creando...' : 'Crear y generar ApiKey'}
</Button>
              </Stack>
            </CardContent>
          </Card>
        )}

{mode === 'empresa' && selectedEmpresa && (
  <Card
    sx={{
      bgcolor: '#351d79', color: 'white',
      border: '2px solid #4f46de', borderRadius: '16px',
      boxShadow:
        '0 0 0 1px rgba(79, 70, 222, 0.15), 0 10px 30px rgba(0,0,0,0.45), inset 0 0 40px rgba(79, 70, 222, 0.08)',
      overflow: 'hidden',
    }}
  >
    {/* Encabezado con botones */}
    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(79, 70, 222, 0.2)', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <DevicesIcon sx={{ color: '#b8a9ff' }} />
      <Typography variant="h6" sx={{ color: '#b8a9ff', fontWeight: 800 }}>
        {selectedEmpresa.nombre}
      </Typography>
      <Chip label={`Empresa ID: ${selectedEmpresa._id}`} size="small" sx={{ ml: 1, color: '#d0bfff', border: '1px solid #4f46de' }} />
      <Box sx={{ flex: 1 }} />

{/* Botón Ver API Key */}
<Button
  variant="outlined"
  size="small"
  onClick={() => {
    setEmpresaRecienCreada({
      empresaId: selectedEmpresa._id,
      apiKey: selectedEmpresa.apiKey || '',
      nombre: selectedEmpresa.nombre
    });
    setModalOpen(true);
  }}
  sx={{ color: '#b8a9ff', borderColor: '#4f46de' }}
>
  Ver API Key
</Button>


      {/* Botón Eliminar empresa */}
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={() => {
          if (window.confirm(`¿Seguro que quieres eliminar la empresa "${selectedEmpresa.nombre}"?`)) {
            fetch(`${API_BASE}/api/empresas/${selectedEmpresa._id}`, { method: 'DELETE' })
              .then(res => res.json())
              .then(data => {
                if (data.ok) {
                  setEmpresas(prev => prev.filter(e => e._id !== selectedEmpresa._id));
                  setSelectedEmpresa(null);
                  setPrinters([]);
                  setMode('list');
                  setSuccessMsg(`Empresa "${selectedEmpresa.nombre}" eliminada`);
                } else {
                  setErrorMsg(data.error || 'No se pudo eliminar la empresa');
                }
              })
              .catch(err => {
                console.error(err);
                setErrorMsg('Error eliminando la empresa');
              });
          }
        }}
      >
        Eliminar
      </Button>
    </Box>


    <CardContent sx={{ p: 2 }}>
      {loadingPrinters && <LinearProgress />}

      {!loadingPrinters && printers.length === 0 && (
        <Typography sx={{ color: '#b8a9ff', p: 2 }}>
          Aún no hay impresoras reportadas por el Agente para esta empresa.
        </Typography>
      )}

<Stack spacing={1.5}>
  {printers.map((p) => {
    const latest = p.latest || {};
    const low = !!latest.lowToner;
    const online  = (typeof p.online === 'boolean') ? p.online : (latest.derivedOnline ?? (latest.online !== false));
    return (
      <Box
        key={p._id}
        sx={{
          p: 1.5, borderRadius: 2,
          border: '1px solid rgba(79, 70, 222, 0.18)',
          bgcolor: 'rgba(46, 0, 79, 0.35)',
        }}
      >
        <Box
          onClick={() => setExpandedPrinterId(expandedPrinterId === p._id ? null : p._id)}
          sx={{ display:'flex', alignItems:'center', gap:1, cursor:'pointer' }}
        >
          <PrintIcon sx={{ color:'#b8a9ff' }} />
          <Typography sx={{ fontWeight:800 }}>
            {p.printerName || p.sysName || p.host}
          </Typography>

            <Chip
            label={online ? 'Online' : 'Offline'}
            size="small"
            sx={{
                ml: 1,
                fontWeight: 700,
                borderRadius: '10px',
                ...(online
                ? {
                    color: '#00ffaa',
                    border: '1px solid #00ffaa',
                    bgcolor: 'rgba(0,255,170,0.10)',
                    boxShadow: '0 0 10px rgba(0,255,170,0.35) inset',
                    }
                : {
                    color: '#ff6b6b',
                    border: '1px solid #ff6b6b',
                    bgcolor: 'rgba(255,0,72,0.10)',
                    boxShadow: '0 0 10px rgba(255,0,72,0.35) inset',
                    })
            }}
            />

          {low && (
            <Tooltip title="Tóner bajo">
              <WarningAmberIcon sx={{ color:'#ffb74d', ml:.5 }} />
            </Tooltip>
          )}

          <Box sx={{ flex:1 }} />
          <Typography sx={{ color:'#b8a9ff' }}>{p.host}</Typography>
        </Box>

{expandedPrinterId === p._id && (() => {
  const latest = p.latest || {};
  return (
    <>
      <Divider sx={{ my: 1, borderColor:'rgba(79, 70, 222, 0.2)' }} />
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2 }}>
        <Box>
          <Typography sx={{ color:'#d0bfff' }}>Serial</Typography>
          <Typography sx={{ fontFamily:'monospace' }}>{p.serial || '—'}</Typography>

          <Typography sx={{ color:'#d0bfff', mt:1 }}>Modelo</Typography>
          <Typography sx={{ fontFamily:'monospace' }}>{p.model || p.sysDescr || '—'}</Typography>

          <Typography sx={{ color:'#d0bfff', mt:1 }}>Última lectura</Typography>
          <Typography sx={{ fontFamily:'monospace' }}>
            {latest.lastSeenAt ? new Date(latest.lastSeenAt).toLocaleString() : '—'}
          </Typography>

          <Typography sx={{ color:'#d0bfff', mt:1 }}>Contador de páginas</Typography>
          <Typography sx={{ fontWeight:800 }}>{latest.lastPageCount ?? '—'}</Typography>

          <Typography sx={{ color:'#d0bfff', mt:1 }}>Contador B/N</Typography>
          <Typography sx={{ fontWeight:800 }}>{latest.lastPageMono ?? '—'}</Typography>

          {latest.lastPageColor != null && latest.lastPageColor > 0 && (
            <>
              <Typography sx={{ color:'#d0bfff', mt:1 }}>Contador Color</Typography>
              <Typography sx={{ fontWeight:800 }}>{latest.lastPageColor}</Typography>
            </>
          )}
        </Box>

{/* BOTONES DE CORTE Y PDF */}
<Box sx={{ mt: 3, p: 2, border: '1px solid rgba(79, 70, 222, 0.3)', borderRadius: 2, bgcolor: 'rgba(46, 0, 79, 0.4)' }}>
  <Typography sx={{ color: '#b8a9ff', fontWeight: 700, mb: 1.5, fontSize: '14px' }}>
    📊 REPORTES MENSUALES
  </Typography>
  
  <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
<Button
  variant="contained"
  size="small"
  onClick={() => handleConfirmarCorte(p._id)}
  disabled={generandoCorte === p._id}
  startIcon={generandoCorte === p._id ? null : <>📅</>}
  sx={{
    bgcolor: '#4caf50',
    color: 'white',
    fontWeight: 700,
    borderRadius: '8px',
    px: 2,
    py: 1,
    minWidth: '140px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    border: '1px solid rgba(76, 175, 80, 0.3)',
    '&:hover': { 
      bgcolor: '#43a047',
      boxShadow: `
        0 0 10px #4caf50,
        0 0 20px #4caf50,
        0 0 40px #4caf50,
        inset 0 0 10px rgba(76, 175, 80, 0.3)
      `,
      border: '1px solid rgba(76, 175, 80, 0.8)',
      textShadow: '0 0 10px rgba(255,255,255,0.8)',
      transform: 'translateY(-2px)'
    },
    '&:disabled': { opacity: 0.6 }
  }}
>
  {generandoCorte === p._id ? '⌛ Registrando...' : 'Registrar Corte'}
</Button>

<Button
  variant="outlined"
  size="small"
  onClick={() => handleGenerarPDF(p._id)}
  disabled={generandoPDF === p._id}
  startIcon={generandoPDF === p._id ? null : <>📄</>}
  sx={{
    borderColor: '#4f46de',
    color: '#b8a9ff',
    fontWeight: 700,
    borderRadius: '8px',
    px: 2,
    py: 1,
    minWidth: '140px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    '&:hover': { 
      bgcolor: 'rgba(79, 70, 222, 0.1)',
      borderColor: '#b8a9ff',
      boxShadow: `
        0 0 10px #4f46de,
        0 0 20px #4f46de,
        inset 0 0 10px rgba(79, 70, 222, 0.1)
      `,
      textShadow: '0 0 10px rgba(184, 169, 255, 0.8)',
      transform: 'translateY(-2px)'
    },
    '&:disabled': { opacity: 0.6 }
  }}
>
  {generandoPDF === p._id ? '⌛ Generando...' : 'Generar PDF'}
</Button>
  </Stack>
  
  <Typography sx={{ color: '#b8a9ff', fontSize: '13px', mt: 1, opacity: 0.8 }}>
    Primero registra un corte, luego genera el reporte PDF
  </Typography>
  
  {/* LEYENDA CON FECHA DEL ÚLTIMO CORTE */}
  <Typography sx={{ color: '#d0bfff', fontSize: '14px', mt: 0.5, opacity: 0.7 }}>
    {latest.lastCutDate 
      ? `Fecha del último corte: ${new Date(latest.lastCutDate).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`
      : 'Aún no se ha registrado ningún corte'
    }
  </Typography>
</Box>

              <Box>
                <Typography sx={{ color:'#d0bfff', mb:1 }}>Consumibles</Typography>
                <Stack spacing={1}>
                  {(latest.lastSupplies || []).map((s, idx) => {
                    const pct = tonerPercent(s.level, s.max);
                    return (
                      <Box key={idx}>
                        <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                          <Typography>{s.name || `Supply ${idx+1}`}</Typography>
                          <Typography sx={{ color: pct<=20 ? '#ff9e9e' : '#9de6a2' }}>
                            {isFinite(pct) ? `${pct}%` : '—'}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={isFinite(pct) ? pct : 0}
                          sx={{
                            height: 8,
                            borderRadius: 6,
                            bgcolor: 'rgba(255,255,255,0.08)',
                            '& .MuiLinearProgress-bar': { transition: 'width .3s' }
                          }}
                        />
                      </Box>
                    );
                  })}
                  {(!latest.lastSupplies || latest.lastSupplies.length === 0) && (
                    <Typography sx={{ color:'#b8a9ff' }}>Sin datos de tóner.</Typography>
                  )}
                </Stack>
              </Box>
            </Box>
          </>
        );
      })()}
      </Box>
    );
  })}
</Stack>
    </CardContent>
  </Card>
)}
     </Box>

{/* MODAL DE CONFIRMACIÓN PARA CORTE */}
<Dialog
  open={!!confirmacionCorte}
  onClose={() => setConfirmacionCorte(null)}
  PaperProps={{
    sx: {
      bgcolor: '#351d79',
      color: 'white',
      border: '2px solid #4f46de',
      borderRadius: '16px',
    }
  }}
>
  <DialogTitle sx={{ color: '#b8a9ff' }}>
    ⚠️ Confirmar Registro de Corte
  </DialogTitle>
  <DialogContent>
    <Typography>
      ¿Estás seguro de que quieres registrar un corte para la impresora:
    </Typography>
    <Typography sx={{ fontWeight: 800, color: '#b8a9ff', my: 1 }}>
      "{confirmacionCorte?.printerName}"
    </Typography>
    <Typography>
      Esta acción guardará los contadores actuales como referencia para el próximo reporte.
    </Typography>
  </DialogContent>
  <DialogActions sx={{ gap: 1, p: 2 }}>
    <Button 
      onClick={() => setConfirmacionCorte(null)}
      sx={{ color: '#b8a9ff', borderColor: '#4f46de' }}
    >
      Cancelar
    </Button>
    <Button 
      onClick={() => handleRegistrarCorte(confirmacionCorte?.printerId)}
      variant="contained"
      sx={{ 
        bgcolor: '#4caf50', 
        color: 'white',
        '&:hover': { bgcolor: '#388e3c' }
      }}
    >
      Sí, Registrar Corte
    </Button>
  </DialogActions>
</Dialog>

      {/* MODAL: ApiKey tras crear */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: '#351d79',
            color: 'white',
            border: '2px solid #4f46de',
            borderRadius: '16px',
            boxShadow:
              '0 0 0 1px rgba(79, 70, 222, 0.15), 0 10px 30px rgba(0,0,0,0.5), inset 0 0 40px rgba(79, 70, 222, 0.08)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#b8a9ff', pr: 6 }}>
          🔑 ApiKey generada
          <IconButton
            onClick={() => setModalOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#d0bfff' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(79, 70, 222, 0.2)', p: 3 }}>
          {empresaRecienCreada && (
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ color: '#b8a9ff' }}>
                Empresa
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>{empresaRecienCreada.nombre}</Typography>

              <Typography variant="subtitle2" sx={{ color: '#b8a9ff' }}>
                Empresa ID
              </Typography>
              <Box sx={{ display:'flex', alignItems:'center', gap:1, p:1, border:'1px solid #4f46de', borderRadius:1, bgcolor:'rgba(46, 0, 79, 0.55)' }}>
                <Typography sx={{ fontFamily:'monospace', wordBreak:'break-all', flex:1 }}>
                  {empresaRecienCreada.empresaId}
                </Typography>
                <IconButton onClick={() => copy(empresaRecienCreada.empresaId)} sx={{ color:'#b8a9ff' }}>
                  <ContentCopyIcon />
                </IconButton>
              </Box>

                <Typography variant="subtitle2" sx={{ color: '#b8a9ff' }}>
                ApiKey
                </Typography>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, p:1, border:'1px solid #4f46de', borderRadius:1, bgcolor:'rgba(46, 0, 79, 0.55)' }}>
                <Typography sx={{ fontFamily:'monospace', wordBreak:'break-all', flex:1 }}>
                    {empresaRecienCreada.apiKey || '—'}
                </Typography>
                <IconButton onClick={() => empresaRecienCreada.apiKey && copy(empresaRecienCreada.apiKey)} sx={{ color:'#b8a9ff' }}>
                    <ContentCopyIcon />
                </IconButton>
                </Box>

              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
              <Button startIcon={<DownloadIcon />} onClick={downloadEnv}
                sx={{ 
                  bgcolor: '#4f46de', 
                  color: 'white', 
                  fontWeight: 800, 
                  borderRadius: '12px', 
                  px: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  border: '1px solid rgba(79, 70, 222, 0.3)',
                  '&:hover': { 
                    bgcolor: '#5d55e8',
                    boxShadow: `
                      0 0 10px #4f46de,
                      0 0 20px #4f46de,
                      inset 0 0 10px rgba(79, 70, 222, 0.3)
                    `,
                    border: '1px solid rgba(79, 70, 222, 0.8)',
                    textShadow: '0 0 10px rgba(255,255,255,0.8)'
                  } 
                }}>
                Descargar .env
              </Button>
                <Button startIcon={<DownloadIcon />} onClick={downloadConfig}
                  sx={{ bgcolor:'#4f46de', color:'white', fontWeight:800, borderRadius:'12px', px:2, '&:hover':{ bgcolor:'#fe5953' } }}>
                  Descargar config.json
                </Button>
                <Button startIcon={<QrCode2Icon />} disabled
                  sx={{ border:'1px solid #4f46de', color:'#b8a9ff', borderRadius:'12px', px:2 }}>
                  QR (pronto)
                </Button>
              </Stack>

              <Alert severity="info" sx={{ bgcolor: 'rgba(46, 0, 79, 0.55)', color:'#d0bfff', border:'1px solid rgba(79, 70, 222, 0.25)' }}>
                Entrega esta ApiKey al técnico. En el Agente, pega la ApiKey y selecciona las impresoras a monitorear.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(79, 70, 222, 0.2)', p: 2 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ color: '#b8a9ff', fontWeight: 700 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}