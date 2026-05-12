import { useState } from 'react';
import { API_BASE } from '../constants';
import { getScope } from '../utils/scopeHelpers';

export const useEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);

  // Estados para menú contextual y diálogos de empresa
  const [empresaContextMenu, setEmpresaContextMenu] = useState({
    open: false,
    empresa: null,
    mouseX: 0,
    mouseY: 0,
  });

  const [renameEmpresaDialog, setRenameEmpresaDialog] = useState({
    open: false,
    empresa: null,
    newName: '',
  });

  const [deleteEmpresaDialog, setDeleteEmpresaDialog] = useState({
    open: false,
    empresa: null,
  });

  const loadEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const { empresaId, ciudad } = getScope();
      const qs = new URLSearchParams({ empresaId, ciudad }).toString();
      const res = await fetch(`${API_BASE}/api/empresas?${qs}`);
      const data = await res.json();
      if (!res.ok || !data?.ok)
        throw new Error(data?.error || 'No se pudieron cargar empresas');

      setEmpresas(data.data || []);
      setSelectedEmpresa(null);
      localStorage.removeItem('selectedEmpresaId');
    } catch (e) {
      console.error(e);
      setEmpresas([]);
      setSelectedEmpresa(null);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const createEmpresa = async (nombre) => {
    const res = await fetch(`${API_BASE}/api/empresas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.trim(),
        empresaId: localStorage.getItem('empresaId'),
        ciudad: localStorage.getItem('ciudad')
      })
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || `Error ${res.status}`);

    const nueva = { _id: data.empresaId, nombre: nombre.trim(), apiKey: data.apiKey };
    setEmpresas(prev => [nueva, ...prev]);
    return nueva;
  };

  const getEmpresaApiKey = async (empresaId) => {
    const res = await fetch(`${API_BASE}/api/empresas/${empresaId}`);
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || `Error ${res.status}`);
    return data.data;
  };

  const deleteEmpresa = async (empresaId) => {
    const res = await fetch(`${API_BASE}/api/empresas/${empresaId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || `Error ${res.status}`);
    setEmpresas(prev => prev.filter(e => String(e._id) !== String(empresaId)));
    return true;
  };

  const renameEmpresa = async (empresaId, newName) => {
    const res = await fetch(`${API_BASE}/api/empresas/${empresaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: newName })
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || 'Error renombrando empresa');

    setEmpresas(prev =>
      prev.map(e => (e._id === empresaId ? { ...e, nombre: newName } : e))
    );
    if (selectedEmpresa?._id === empresaId) {
      setSelectedEmpresa(prev => ({ ...prev, nombre: newName }));
    }
    return true;
  };

  // Handlers de UI - menú contextual
  const handleEmpresaContextMenu = (event, empresa) => {
    event.preventDefault();
    event.stopPropagation();
    setEmpresaContextMenu({
      open: true,
      empresa,
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleCloseEmpresaContextMenu = () => {
    setEmpresaContextMenu({ open: false, empresa: null, mouseX: 0, mouseY: 0 });
  };

  const handleOpenRenameEmpresaDialog = (empresa) => {
    setRenameEmpresaDialog({ open: true, empresa, newName: empresa.nombre });
    handleCloseEmpresaContextMenu();
  };

  const handleOpenDeleteEmpresaDialog = (empresa) => {
    setDeleteEmpresaDialog({ open: true, empresa });
    handleCloseEmpresaContextMenu();
  };

  return {
    empresas,
    setEmpresas,
    loadingEmpresas,
    selectedEmpresa,
    setSelectedEmpresa,
    empresaContextMenu,
    renameEmpresaDialog,
    setRenameEmpresaDialog,
    deleteEmpresaDialog,
    setDeleteEmpresaDialog,
    loadEmpresas,
    createEmpresa,
    getEmpresaApiKey,
    deleteEmpresa,
    renameEmpresa,
    handleEmpresaContextMenu,
    handleCloseEmpresaContextMenu,
    handleOpenRenameEmpresaDialog,
    handleOpenDeleteEmpresaDialog,
  };
};