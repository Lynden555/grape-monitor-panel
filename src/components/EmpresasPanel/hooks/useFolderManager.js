import { useState, useEffect } from 'react';
import { API_BASE } from '../constants';
import { getScope } from '../utils/scopeHelpers';

export const useFolderManager = () => {
  const [folders, setFolders] = useState([]);
  const [empresaFolderAssignments, setEmpresaFolderAssignments] = useState({});
  const [loading, setLoading] = useState(true);

  // Estados de UI para context menu y diálogos
  const [folderContextMenu, setFolderContextMenu] = useState({
    open: false,
    folder: null,
    mouseX: 0,
    mouseY: 0,
  });

  const [renameDialog, setRenameDialog] = useState({
    open: false,
    folder: null,
    newName: '',
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    folder: null,
  });

  // Cargar carpetas y asignaciones desde la API
  const loadFolderData = async () => {
    try {
      setLoading(true);
      const { empresaId, ciudad } = getScope();
      if (!empresaId || !ciudad) return;

      const foldersRes = await fetch(
        `${API_BASE}/api/carpetas?empresaId=${empresaId}&ciudad=${ciudad}`
      );
      const foldersData = await foldersRes.json();
      if (foldersData.ok) setFolders(foldersData.data);

      const assignmentsRes = await fetch(
        `${API_BASE}/api/asignaciones?empresaPadreId=${empresaId}&ciudad=${ciudad}`
      );
      const assignmentsData = await assignmentsRes.json();
      if (assignmentsData.ok) setEmpresaFolderAssignments(assignmentsData.data);
    } catch (error) {
      console.error('Error cargando datos de carpetas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolderData();
  }, []);

  const assignEmpresaToFolder = async (empresaId, folderId) => {
    try {
      const { empresaId: empresaPadreId, ciudad } = getScope();
      const res = await fetch(`${API_BASE}/api/asignaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, carpetaId: folderId, empresaPadreId, ciudad })
      });
      const data = await res.json();
      if (data.ok) {
        setEmpresaFolderAssignments(prev => ({ ...prev, [empresaId]: folderId }));
      }
    } catch (error) {
      console.error('Error asignando empresa a carpeta:', error);
    }
  };

  const removeEmpresaFromFolder = async (empresaId) => {
    try {
      const { empresaId: empresaPadreId, ciudad } = getScope();
      const res = await fetch(`${API_BASE}/api/asignaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, carpetaId: null, empresaPadreId, ciudad })
      });
      const data = await res.json();
      if (data.ok) {
        setEmpresaFolderAssignments(prev => {
          const newAssignments = { ...prev };
          delete newAssignments[empresaId];
          return newAssignments;
        });
      }
    } catch (error) {
      console.error('Error removiendo empresa de carpeta:', error);
    }
  };

  const moveEmpresaToFolder = (empresaId, folderId) => {
    if (folderId) assignEmpresaToFolder(empresaId, folderId);
    else removeEmpresaFromFolder(empresaId);
  };

  const getEmpresasInFolder = (folderId, todasLasEmpresas) => {
    if (!folderId) {
      return todasLasEmpresas.filter(empresa => !empresaFolderAssignments[empresa._id]);
    }
    return todasLasEmpresas.filter(
      empresa => empresaFolderAssignments[empresa._id] === folderId
    );
  };

  const createFolder = async (name, parentId = null) => {
    try {
      const { empresaId, ciudad } = getScope();
      const res = await fetch(`${API_BASE}/api/carpetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name.trim(), parentId, empresaId, ciudad })
      });
      const data = await res.json();
      if (data.ok) {
        setFolders(prev => [...prev, data.data]);
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creando carpeta:', error);
      return null;
    }
  };

  const renameFolder = async (folderId, newName) => {
    try {
      const { empresaId, ciudad } = getScope();
      const res = await fetch(`${API_BASE}/api/carpetas/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newName.trim(), empresaId, ciudad })
      });
      const data = await res.json();
      if (data.ok) {
        setFolders(prev =>
          prev.map(folder =>
            folder._id === folderId ? { ...folder, nombre: newName.trim() } : folder
          )
        );
      }
    } catch (error) {
      console.error('Error renombrando carpeta:', error);
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      const { empresaId, ciudad } = getScope();
      const res = await fetch(`${API_BASE}/api/carpetas/${folderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, ciudad })
      });
      const data = await res.json();
      if (data.ok) {
        setFolders(prev => prev.filter(folder => folder._id !== folderId));
      }
    } catch (error) {
      console.error('Error eliminando carpeta:', error);
    }
  };

  const getFolderPath = (folderId) => {
    const path = [];
    let currentFolder = folders.find(f => f._id === folderId);
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = currentFolder.parentId
        ? folders.find(f => f._id === currentFolder.parentId)
        : null;
    }
    return path;
  };

  const getChildFolders = (parentId = null) => {
    return folders.filter(folder => {
      if (parentId === null) return !folder.parentId;
      return folder.parentId === parentId;
    });
  };

  // Handlers de UI
  const handleContextMenu = (event, folder) => {
    event.preventDefault();
    event.stopPropagation();
    setFolderContextMenu({
      open: true,
      folder,
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleCloseContextMenu = () => {
    setFolderContextMenu({ open: false, folder: null, mouseX: 0, mouseY: 0 });
  };

  const handleOpenRenameDialog = (folder) => {
    setRenameDialog({ open: true, folder, newName: folder.nombre });
    handleCloseContextMenu();
  };

  const handleOpenDeleteDialog = (folder) => {
    setDeleteDialog({ open: true, folder });
    handleCloseContextMenu();
  };

  const handleConfirmRename = () => {
    if (renameDialog.folder && renameDialog.newName.trim()) {
      renameFolder(renameDialog.folder._id, renameDialog.newName);
      setRenameDialog({ open: false, folder: null, newName: '' });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.folder) {
      deleteFolder(deleteDialog.folder._id);
      setDeleteDialog({ open: false, folder: null });
    }
  };

  return {
    folders,
    folderContextMenu,
    renameDialog,
    deleteDialog,
    empresaFolderAssignments,
    loading,
    createFolder,
    renameFolder,
    deleteFolder,
    getFolderPath,
    getChildFolders,
    assignEmpresaToFolder,
    removeEmpresaFromFolder,
    moveEmpresaToFolder,
    getEmpresasInFolder,
    handleContextMenu,
    handleCloseContextMenu,
    handleOpenRenameDialog,
    handleOpenDeleteDialog,
    handleConfirmRename,
    handleConfirmDelete,
    setRenameDialog,
    setDeleteDialog,
    reloadFolders: loadFolderData
  };
};