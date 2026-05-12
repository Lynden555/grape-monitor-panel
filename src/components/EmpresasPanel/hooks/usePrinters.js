import { useState, useRef } from 'react';
import { API_BASE, STALE_MS, GRACE_MS } from '../constants';
import { getScope } from '../utils/scopeHelpers';
import { computeDerivedOnline } from '../utils/tonerHelpers';

export const usePrinters = () => {
  const [printers, setPrinters] = useState([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [expandedPrinterId, setExpandedPrinterId] = useState(null);
  const [generandoCorte, setGenerandoCorte] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(null);
  const [confirmacionCorte, setConfirmacionCorte] = useState(null);

  // Estados de menú contextual y diálogos de impresora
  const [printerContextMenu, setPrinterContextMenu] = useState({
    open: false,
    printer: null,
    mouseX: 0,
    mouseY: 0,
  });

  const [renamePrinterDialog, setRenamePrinterDialog] = useState({
    open: false,
    printer: null,
    newName: '',
  });

  const [deletePrinterDialog, setDeletePrinterDialog] = useState({
    open: false,
    printer: null,
  });

  // Refs para tracking de online status
  const lastSeenRef = useRef(new Map());
  const holdUntilRef = useRef(new Map());

// Ref para tracking del request más reciente
  const currentLoadIdRef = useRef(0);

  const loadPrinters = async (empresaIdParam, empresaNombre = 'Empresa') => {
    const loadId = ++currentLoadIdRef.current;
    setLoadingPrinters(true);

    lastSeenRef.current = new Map();
    holdUntilRef.current = new Map();

    try {
      const { ciudad } = getScope();
      const q = ciudad ? `?ciudad=${encodeURIComponent(ciudad)}` : '';
      const res = await fetch(
        `${API_BASE}/api/empresas/${empresaIdParam}/impresoras${q}`
      );
      const data = await res.json();

      // Si llegó una respuesta nueva mientras esperábamos, ignoramos esta
      if (loadId !== currentLoadIdRef.current) return;

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'No se pudieron cargar impresoras');
      }

      const now = Date.now();
      const nuevasImpresoras = (data.data || []).map(impresora => {
        const latest = impresora.latest || {};
        return {
          ...impresora,
          empresaNombre,
          empresaId: empresaIdParam,
          _timestamp: now,
          _lastSeenAt: latest.lastSeenAt || null,
          _holdUntil: now + STALE_MS + GRACE_MS,
          online: computeDerivedOnline(latest, now)
        };
      });

      setPrinters(nuevasImpresoras);
      return nuevasImpresoras;
    } catch (e) {
      if (loadId !== currentLoadIdRef.current) return;
      console.error('❌ Error al cargar impresoras:', e);
      setPrinters([]);
      throw e;
    } finally {
      if (loadId === currentLoadIdRef.current) {
        setLoadingPrinters(false);
      }
    }
  };

  const renamePrinter = async (printerId, newName) => {
    const res = await fetch(`${API_BASE}/api/impresoras/${printerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ printerName: newName })
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || 'Error renombrando impresora');

    setPrinters(prev =>
      prev.map(p => (p._id === printerId ? { ...p, printerName: newName } : p))
    );
    return true;
  };

  const deletePrinter = async (printerId) => {
    const res = await fetch(`${API_BASE}/api/impresoras/${printerId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || 'Error eliminando impresora');

    setPrinters(prev => prev.filter(p => p._id !== printerId));
    return true;
  };

  const registrarCorte = async (printerId) => {
    setGenerandoCorte(printerId);
    try {
      const res = await fetch(
        `${API_BASE}/api/impresoras/${printerId}/registrar-corte`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Error registrando corte');
      return data;
    } finally {
      setGenerandoCorte(null);
      setConfirmacionCorte(null);
    }
  };

  const generarPDF = async (printerId, printerName = 'impresora') => {
    setGenerandoPDF(printerId);
    try {
      const response = await fetch(`${API_BASE}/api/impresoras/${printerId}/generar-pdf`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Error del servidor al generar PDF');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('El servidor no devolvió un PDF válido');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `reporte-${printerName}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return fileName;
    } finally {
      setGenerandoPDF(null);
    }
  };

  // Handlers de UI - menú contextual
  const handlePrinterContextMenu = (event, printer) => {
    event.preventDefault();
    event.stopPropagation();
    setPrinterContextMenu({
      open: true,
      printer,
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleClosePrinterContextMenu = () => {
    setPrinterContextMenu({ open: false, printer: null, mouseX: 0, mouseY: 0 });
  };

  const handleOpenRenamePrinterDialog = (printer) => {
    setRenamePrinterDialog({
      open: true,
      printer,
      newName: printer.printerName || printer.sysName || printer.host || '',
    });
    handleClosePrinterContextMenu();
  };

  const handleOpenDeletePrinterDialog = (printer) => {
    setDeletePrinterDialog({ open: true, printer });
    handleClosePrinterContextMenu();
  };

  const clearPrinters = () => {
    setPrinters([]);
    setExpandedPrinterId(null);
  };

  return {
    printers,
    setPrinters,
    loadingPrinters,
    expandedPrinterId,
    setExpandedPrinterId,
    generandoCorte,
    generandoPDF,
    confirmacionCorte,
    setConfirmacionCorte,
    printerContextMenu,
    renamePrinterDialog,
    setRenamePrinterDialog,
    deletePrinterDialog,
    setDeletePrinterDialog,
    loadPrinters,
    renamePrinter,
    deletePrinter,
    registrarCorte,
    generarPDF,
    handlePrinterContextMenu,
    handleClosePrinterContextMenu,
    handleOpenRenamePrinterDialog,
    handleOpenDeletePrinterDialog,
    clearPrinters,
  };
};