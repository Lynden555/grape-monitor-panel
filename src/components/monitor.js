import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Stack, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider,
  List, ListItemButton, ListItemText, ListSubheader, LinearProgress, Chip, Tooltip,
  Menu, MenuItem
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CloseIcon from '@mui/icons-material/Close';
import DevicesIcon from '@mui/icons-material/Devices';
import PrintIcon from '@mui/icons-material/Print';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE = 'https://grape-monitor-production.up.railway.app';

const generateId = () => `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const FolderType = {
  ROOT: 'root',
  FOLDER: 'folder'
};

const useFolderManager = () => {
  const [folders, setFolders] = useState([]);
  const [empresaFolderAssignments, setEmpresaFolderAssignments] = useState({});
  const [loading, setLoading] = useState(true);

  // Obtener el scope del usuario
  const getScope = () => ({
    empresaId: localStorage.getItem('empresaId') || '',
    ciudad: localStorage.getItem('ciudad') || '',
  });

  // Cargar carpetas y asignaciones desde la API
  const loadFolderData = async () => {
    try {
      setLoading(true);
      const { empresaId, ciudad } = getScope();
      
      if (!empresaId || !ciudad) return;

      // Cargar carpetas
      const foldersRes = await fetch(`${API_BASE}/api/carpetas?empresaId=${empresaId}&ciudad=${ciudad}`);
      const foldersData = await foldersRes.json();
      
      if (foldersData.ok) {
        setFolders(foldersData.data);
      }

      // Cargar asignaciones
      const assignmentsRes = await fetch(`${API_BASE}/api/asignaciones?empresaPadreId=${empresaId}&ciudad=${ciudad}`);
      const assignmentsData = await assignmentsRes.json();
      
      if (assignmentsData.ok) {
        setEmpresaFolderAssignments(assignmentsData.data);
      }

    } catch (error) {
      console.error('Error cargando datos de carpetas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al inicializar
  useEffect(() => {
    loadFolderData();
  }, []);

  const assignEmpresaToFolder = async (empresaId, folderId) => {
    try {
      const { empresaId: empresaPadreId, ciudad } = getScope();
      
      const res = await fetch(`${API_BASE}/api/asignaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          empresaId, 
          carpetaId: folderId, 
          empresaPadreId, 
          ciudad 
        })
      });

      const data = await res.json();
      if (data.ok) {
        setEmpresaFolderAssignments(prev => ({
          ...prev,
          [empresaId]: folderId
        }));
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
        body: JSON.stringify({ 
          empresaId, 
          carpetaId: null, 
          empresaPadreId, 
          ciudad 
        })
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
    if (folderId) {
      assignEmpresaToFolder(empresaId, folderId);
    } else {
      removeEmpresaFromFolder(empresaId);
    }
  };

  const getEmpresasInFolder = (folderId, todasLasEmpresas) => {
    if (!folderId) {
      return todasLasEmpresas.filter(empresa => 
        !empresaFolderAssignments[empresa._id]
      );
    }
    
    return todasLasEmpresas.filter(empresa => 
      empresaFolderAssignments[empresa._id] === folderId
    );
  };

  const getImpresorasPorCarpeta = async (carpetaId) => {
  try {
    const { empresaId: empresaPadreId, ciudad } = getScope();
    
    // 1. Obtener todas las empresas de esta carpeta
    const asignacionesRes = await fetch(`${API_BASE}/api/asignaciones?empresaPadreId=${empresaPadreId}&ciudad=${ciudad}`);
    const asignacionesData = await asignacionesRes.json();
    
    if (!asignacionesData.ok) return [];
    
    // Filtrar empresas de esta carpeta
    const empresaIdsEnCarpeta = Object.entries(asignacionesData.data)
      .filter(([empresaId, carpetaAsignadaId]) => carpetaAsignadaId === carpetaId)
      .map(([empresaId]) => empresaId);
    
    // 2. Obtener impresoras de todas esas empresas
    const todasImpresoras = [];
    
    for (const empresaId of empresaIdsEnCarpeta) {
      const res = await fetch(`${API_BASE}/api/empresas/${empresaId}/impresoras?ciudad=${ciudad}`);
      const data = await res.json();
      
      if (data.ok && data.data) {
        // Agregar información de la empresa a cada impresora
        const impresorasConEmpresa = data.data.map(impresora => ({
          ...impresora,
          empresaNombre: empresaId // Aquí deberías buscar el nombre real de la empresa
        }));
        
        todasImpresoras.push(...impresorasConEmpresa);
      }
    }
    
    return todasImpresoras;
    
  } catch (error) {
    console.error('Error obteniendo impresoras por carpeta:', error);
    return [];
  }
};

  const createFolder = async (name, parentId = null) => {
    try {
      const { empresaId, ciudad } = getScope();
      
      const res = await fetch(`${API_BASE}/api/carpetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: name.trim(), 
          parentId,
          empresaId, 
          ciudad 
        })
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
        body: JSON.stringify({ 
          nombre: newName.trim(),
          empresaId, 
          ciudad 
        })
      });

      const data = await res.json();
      if (data.ok) {
        setFolders(prev => prev.map(folder => 
          folder._id === folderId ? { ...folder, nombre: newName.trim() } : folder
        ));
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
        body: JSON.stringify({ 
          empresaId, 
          ciudad 
        })
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

  // ... (el resto del código de context menu permanece igual)
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
    setRenameDialog({
      open: true,
      folder,
      newName: folder.nombre,
    });
    handleCloseContextMenu();
  };

  const handleOpenDeleteDialog = (folder) => {
    setDeleteDialog({
      open: true,
      folder,
    });
    handleCloseContextMenu();
  };

 const handleConfirmRename = () => {
  if (renameDialog.folder && renameDialog.newName.trim()) {
    renameFolder(renameDialog.folder._id, renameDialog.newName); // ✅ CAMBIADO A _id
    setRenameDialog({ open: false, folder: null, newName: '' });
  }
 };

 const handleConfirmDelete = () => {
  if (deleteDialog.folder) {
    deleteFolder(deleteDialog.folder._id); // ✅ CAMBIADO A _id
    setDeleteDialog({ open: false, folder: null });
  }
 };


// Función para obtener impresoras de una carpeta específica


return {
    folders,
    folderContextMenu,
    renameDialog,
    deleteDialog,
    empresaFolderAssignments,
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
    loading,
    getImpresorasPorCarpeta,
    reloadFolders: loadFolderData
  };

};

// 🆕 COMPONENTE MEJORADO - SOLO CAMBIOS VISUALES
  const EmpresaListItem = ({ 
  empresa, 
  onSelectEmpresa, 
  isSelected, 
  onMoveToFolder,
  onEmpresaContextMenu // 🆕 AGREGAR ESTA PROP
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('empresaId', empresa._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <ListItemButton
      selected={isSelected}
      onClick={() => onSelectEmpresa(empresa)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sx={{
        color: 'white',
        '&.Mui-selected': { 
          bgcolor: 'rgba(254, 89, 83, 0.15)',
          border: '1px solid rgba(254, 89, 83, 0.3)'
        },
        '&:hover': { 
          bgcolor: 'rgba(254, 89, 83, 0.08)',
          '& .empresa-actions': { opacity: 1 }  // ← AGREGAR ESTO
        },
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
        borderRadius: '12px',
        margin: '4px 8px',
        border: '1px solid rgba(254, 89, 83, 0.1)',
        transition: 'all 0.3s ease',
        padding: '14px 16px',
        height: '65px'
      }}
    >
<PrintIcon sx={{ 
  color: isSelected ? '#fe5953' : '#ff9e80', 
  mr: 2,
  fontSize: '28px'
}} />
      
      <ListItemText
        primary={
          <Typography sx={{ 
            fontWeight: 800, 
            color: isSelected ? '#fe5953' : '#ffffff',
            fontSize: '16px',
            letterSpacing: '0.2px'
          }}>
            {empresa.nombre}
          </Typography>
        }
        secondary={
          <Typography sx={{ 
            color: isSelected ? '#ffb74d' : '#b8a9ff', 
            fontSize: '0.8rem',
            marginTop: '2px'
          }}>
            Click para ver impresoras
          </Typography>
        }
      />

      {/* 🆕 BOTÓN DE 3 PUNTOS PARA EMPRESAS - IGUAL QUE CARPETAS */}
      <IconButton
        size="small"
        className="empresa-actions"
        onClick={(e) => {
          e.stopPropagation();
          onEmpresaContextMenu(e, empresa); // 🆕 USAR LA PROP
        }}
        sx={{ 
          opacity: 0, 
          color: '#b8a9ff',
          transition: 'opacity 0.2s',
          '&:hover': { 
            color: 'white'
          }
        }}
      >
        <MoreVertIcon />
      </IconButton>
    </ListItemButton>
  );
};

export default function EmpresasPanel() {
  const [empresas, setEmpresas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [confirmacionCorte, setConfirmacionCorte] = useState(null);
  const [mode, setMode] = useState('list');
  const [nombre, setNombre] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaRecienCreada, setEmpresaRecienCreada] = useState(null);
  const canSubmit = useMemo(() => (nombre.trim().length >= 3), [nombre]);
  const [printers, setPrinters] = useState([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [expandedPrinterId, setExpandedPrinterId] = useState(null);
  const [generandoCorte, setGenerandoCorte] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [downloadAgentOpen, setDownloadAgentOpen] = useState(false);

  // 🆕 ESTADOS PARA MENÚ DE IMPRESORAS
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

// 🆕 ESTADOS PARA MENÚ DE EMPRESAS
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


  // 🆕 FUNCIONES PARA MENÚ DE IMPRESORAS
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

  const handleConfirmRenamePrinter = async () => {
    if (renamePrinterDialog.printer && renamePrinterDialog.newName.trim()) {
      try {
        const printerId = renamePrinterDialog.printer._id;
        const newName = renamePrinterDialog.newName.trim();
        
        const res = await fetch(`${API_BASE}/api/impresoras/${printerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ printerName: newName })
        });
        
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || 'Error renombrando impresora');
        
        setPrinters(prev => prev.map(p => 
          p._id === printerId ? { ...p, printerName: newName } : p
        ));
        
        setSuccessMsg(`Impresora renombrada a "${newName}"`);
        setRenamePrinterDialog({ open: false, printer: null, newName: '' });
        
      } catch (err) {
        setErrorMsg(`Error al renombrar impresora: ${err.message}`);
      }
    }
  };

  const handleOpenDeletePrinterDialog = (printer) => {
  setDeletePrinterDialog({
    open: true,
    printer,
  });
  handleClosePrinterContextMenu();
};

const handleConfirmDeletePrinter = async () => {
  if (deletePrinterDialog.printer) {
    try {
      const printerId = deletePrinterDialog.printer._id;
      
      const res = await fetch(`${API_BASE}/api/impresoras/${printerId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Error eliminando impresora');
      
      setPrinters(prev => prev.filter(p => p._id !== printerId));
      setSuccessMsg(`Impresora "${deletePrinterDialog.printer.printerName || deletePrinterDialog.printer.host}" eliminada correctamente`);
      setDeletePrinterDialog({ open: false, printer: null });
      
    } catch (err) {
      setErrorMsg(`Error al eliminar impresora: ${err.message}`);
    }
  }
};


// 🆕 FUNCIONES PARA MENÚ DE EMPRESAS
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
  setRenameEmpresaDialog({
    open: true,
    empresa,
    newName: empresa.nombre,
  });
  handleCloseEmpresaContextMenu();
};

const handleOpenDeleteEmpresaDialog = (empresa) => {
  setDeleteEmpresaDialog({
    open: true,
    empresa,
  });
  handleCloseEmpresaContextMenu();
};

const handleConfirmRenameEmpresa = async () => {
  if (renameEmpresaDialog.empresa && renameEmpresaDialog.newName.trim()) {
    try {
      const empresaId = renameEmpresaDialog.empresa._id;
      const newName = renameEmpresaDialog.newName.trim();
      
      console.log('🔄 Renombrando empresa:', empresaId, 'a:', newName);
      
      const res = await fetch(`${API_BASE}/api/empresas/${empresaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newName })
      });
      
      const data = await res.json();
      console.log('📡 Respuesta renombrar:', data);
      
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Error renombrando empresa');
      
      // ACTUALIZAR EL ESTADO CON LOS DATOS ACTUALIZADOS DE LA API
      setEmpresas(prev => prev.map(e => 
        e._id === empresaId ? { ...e, nombre: newName } : e
      ));
      
      if (selectedEmpresa?._id === empresaId) {
        setSelectedEmpresa(prev => ({ ...prev, nombre: newName }));
      }
      
      setSuccessMsg(`✅ Empresa renombrada a "${newName}"`);
      setRenameEmpresaDialog({ open: false, empresa: null, newName: '' });
      
    } catch (err) {
      console.error('❌ Error renombrando empresa:', err);
      setErrorMsg(`Error al renombrar empresa: ${err.message}`);
    }
  }
};

const handleConfirmDeleteEmpresa = async () => {
  if (deleteEmpresaDialog.empresa) {
    try {
      const empresaId = deleteEmpresaDialog.empresa._id;
      
      const res = await fetch(`${API_BASE}/api/empresas/${empresaId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Error eliminando empresa');
      
      setEmpresas(prev => prev.filter(e => e._id !== empresaId));
      
      if (selectedEmpresa?._id === empresaId) {
        setSelectedEmpresa(null);
        setPrinters([]);
        setMode('list');
      }
      
      setSuccessMsg(`Empresa "${deleteEmpresaDialog.empresa.nombre}" eliminada correctamente`);
      setDeleteEmpresaDialog({ open: false, empresa: null });
      
    } catch (err) {
      setErrorMsg(`Error al eliminar empresa: ${err.message}`);
    }
  }
};



  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const {
    folders,
    folderContextMenu,
    renameDialog,
    deleteDialog,
    empresaFolderAssignments,
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
    loading,
    reloadFolders
  } = useFolderManager();



const handleFolderDrop = (e, folderId) => {
  e.preventDefault();
  const empresaId = e.dataTransfer.getData('empresaId');
  if (empresaId) {
    moveEmpresaToFolder(empresaId, folderId);
    setSuccessMsg(`Empresa movida a la carpeta`);
  }
};

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };



  useEffect(() => {
    if (!isAuthReady) return;
    const tick = () => {
      if (selectedEmpresa?._id) {
        loadPrinters(selectedEmpresa._id);
      }
    };
    const t = setInterval(tick, 120_000);
    return () => clearInterval(t);
  }, [isAuthReady, selectedEmpresa?._id]);

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

  const STALE_MS = 2 * 60 * 1000;
  const GRACE_MS = 60 * 1000;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  const lastSeenRef = useRef(new Map());
  const holdUntilRef = useRef(new Map());

  const applyAndRemember = (list = []) => {
    const merged = list.map((p) => {
      const latest = p.latest || {};
      const prevSeen = lastSeenRef.current.get(p._id) || null;
      const newSeen  = latest.lastSeenAt || prevSeen;

      if (latest.lastSeenAt && (!prevSeen || new Date(latest.lastSeenAt) > new Date(prevSeen))) {
        holdUntilRef.current.set(p._id, Date.now() + STALE_MS + GRACE_MS);
      }

      if (newSeen && !holdUntilRef.current.has(p._id)) {
        holdUntilRef.current.set(p._id, Date.now() + STALE_MS + GRACE_MS);
      }

      lastSeenRef.current.set(p._id, newSeen || null);

      return {
        ...p,
        _lastSeenAt: newSeen || null,
        _holdUntil: holdUntilRef.current.get(p._id) || 0,
      };
    });

    const idsNow = new Set(merged.map(p => p._id));
    for (const id of lastSeenRef.current.keys()) if (!idsNow.has(id)) lastSeenRef.current.delete(id);
    for (const id of holdUntilRef.current.keys()) if (!idsNow.has(id)) holdUntilRef.current.delete(id);

    setPrinters(merged);
  };

  const isOnlineUI = (p, nowTs = Date.now()) => {
    const latest = p.latest || {};
    if (latest.online === false) return false;
    if ((p._holdUntil || 0) > nowTs) return true;
    if (!p._lastSeenAt) return false;
    const age = nowTs - new Date(p._lastSeenAt).getTime();
    return age <= STALE_MS;
  };

  // Agrega esta función cerca de isOnlineUI (~línea 670)
const computeDerivedOnline = (latest, now = Date.now()) => {
  if (!latest || !latest.lastSeenAt) return false;
  if (latest.online === false) return false;
  
  const lastSeen = new Date(latest.lastSeenAt).getTime();
  const age = now - lastSeen;
  const STALE_MS = 2 * 60 * 1000; // 2 minutos
  
  return age <= STALE_MS;
};

  const getScope = () => ({
    empresaId: localStorage.getItem('empresaId') || '',
    ciudad:    localStorage.getItem('ciudad')    || '',
  });

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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('El servidor no devolvió un PDF válido');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      const printer = printers.find(p => p._id === printerId);
      const printerName = printer?.printerName || printer?.host || 'impresora';
      const fileName = `reporte-${printerName}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.download = fileName;
      
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

  const loadEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const { empresaId, ciudad } = getScope();
      const qs = new URLSearchParams({ empresaId, ciudad }).toString();
      const res = await fetch(`${API_BASE}/api/empresas?${qs}`);
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'No se pudieron cargar empresas');

      const lista = data.data || [];
      setEmpresas(lista);

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
  
  // 🆕 RESET DE CACHE antes de cargar
  lastSeenRef.current = new Map();
  holdUntilRef.current = new Map();
  
  try {
    const { ciudad } = getScope();
    console.log('🔄 Cargando impresoras para empresa:', empresaIdParam);
    
    // 🆕 SIEMPRE cargar de la empresa específica, ignore si estamos en carpeta
    const q = ciudad ? `?ciudad=${encodeURIComponent(ciudad)}` : '';
    const res = await fetch(`${API_BASE}/api/empresas/${empresaIdParam}/impresoras${q}`);
    const data = await res.json();
    
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || 'No se pudieron cargar impresoras');
    }
    
    console.log('✅ Impresoras recibidas:', data.data?.length || 0);
    
    // 🆕 AGREGAR información de la empresa actual
    const empresaActual = empresas.find(e => e._id === empresaIdParam);
    const impresorasConInfo = (data.data || []).map(impresora => ({
      ...impresora,
      empresaNombre: empresaActual?.nombre || 'Empresa',
      empresaId: empresaIdParam,
      // 🆕 MARCA TEMPORAL para evitar cache
      _timestamp: Date.now()
    }));
    
    // 🆕 APLICAR NUEVO sin cache
    const now = Date.now();
    const nuevasImpresoras = impresorasConInfo.map(p => {
      const latest = p.latest || {};
      return {
        ...p,
        _lastSeenAt: latest.lastSeenAt || null,
        _holdUntil: now + (2 * 60 * 1000) + (60 * 1000), // Reset hold
        online: computeDerivedOnline(latest, now) // Función que ya tienes
      };
    });
    
    setPrinters(nuevasImpresoras);
    
  } catch (e) {
    console.error('❌ Error al cargar impresoras:', e);
    setPrinters([]);
    setErrorMsg(`Error: ${e.message}`);
  } finally {
    setLoadingPrinters(false);
  }
};

  useEffect(() => {
    const { empresaId } = getScope();
    if (!empresaId) {
      window.location.replace('/login');
      return;
    }
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    loadEmpresas();
  }, [isAuthReady]);

  useEffect(() => {
    if (!isAuthReady) return;

    let prev = getScope();

    const enforceAuth = () => {
      const { empresaId } = getScope();
      if (!empresaId) {
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

const handleSelectEmpresa = async (emp) => {
  console.log('🔄 Seleccionando empresa:', emp.nombre, 'ID:', emp._id);
  
  // 🆕 RESET COMPLETO antes de cargar nuevas impresoras
  setPrinters([]); // Limpiar lista inmediatamente
  setExpandedPrinterId(null); // Cerrar cualquier impresora expandida
  setSelectedEmpresa(emp); // Establecer nueva empresa
  
  // 🆕 IMPORTANTE: NO usar localStorage para selectedEmpresaId en modo carpeta
  if (!currentFolderId) {
    localStorage.setItem('selectedEmpresaId', emp._id);
  }
  
  setMode('empresa');
  
  // 🆕 Forzar recarga limpia de impresoras
  try {
    await loadPrinters(emp._id);
  } catch (error) {
    console.error('Error al cargar impresoras:', error);
    setPrinters([]);
  }
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

    // 🆕 AQUÍ ESTÁ EL CAMBIO: Si estamos dentro de una carpeta, asignar automáticamente
    if (currentFolderId) {
      assignEmpresaToFolder(data.empresaId, currentFolderId);
      setSuccessMsg(`Empresa "${nombre.trim()}" creada dentro de la carpeta actual`);
      
      // 🆕 IMPORTANTE: Cuando creamos dentro de una carpeta, NO seleccionar la empresa
      // Solo agregarla a la lista y actualizar las impresoras de la carpeta
      setEmpresas(prev => [{ _id: data.empresaId, nombre: nueva.nombre, apiKey: data.apiKey }, ...prev]);
      
      // 🆕 Recargar las impresoras de la carpeta (no de una empresa específica)
      await loadPrinters(null); // Pasar null para indicar "recargar carpeta"
      
      // 🆕 NO cambiar el modo ni seleccionar la empresa
      // setSelectedEmpresa(null);
      // setMode('list');
    } else {
      // Comportamiento original si NO estamos en carpeta
      setEmpresas(prev => [{ _id: data.empresaId, nombre: nueva.nombre, apiKey: data.apiKey }, ...prev]);
      setSelectedEmpresa({ _id: data.empresaId, nombre: nueva.nombre, apiKey: data.apiKey });
      localStorage.setItem('selectedEmpresaId', data.empresaId);
      setMode('empresa');
      await loadPrinters(data.empresaId);
    }
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

const handleCreateFolder = async () => {
  if (newFolderName.trim()) {
    const success = await createFolder(newFolderName.trim(), currentFolderId);
    if (success) {
      setNewFolderName('');
      setFolderDialogOpen(false);
      setSuccessMsg(`Carpeta "${newFolderName.trim()}" creada correctamente`);
    } else {
      setErrorMsg('Error creando carpeta');
    }
  }
};

  
const handleSelectFolder = (folder) => {
  setCurrentFolderId(folder._id); // Cambiar .id por ._id
};

const handleBackToRoot = () => {
  setCurrentFolderId(null);
};

// 🆕 FUNCIÓN PARA NAVEGAR A CUALQUIER CARPETA DEL BREADCRUMB
const navigateToFolder = (folderId) => {
  setCurrentFolderId(folderId);
};

const empresasEnCarpetaActual = useMemo(() => {
  return getEmpresasInFolder(currentFolderId, empresas);
}, [empresas, currentFolderId, getEmpresasInFolder]);



  const tonerPercent = (lvl, max) => {
    if (!max || max <= 0) return 0;
    const p = Math.round((Number(lvl) / Number(max)) * 100);
    return Math.max(0, Math.min(100, p));
  };

  // 🆕 Función para asignar colores únicos a cada empresa
const getColorForEmpresa = (empresaId) => {
  const colors = [
    '#fe5953', '#4f46de', '#00c853', '#ffb74d', 
    '#9c27b0', '#2196f3', '#ff9800', '#4caf50',
    '#e91e63', '#3f51b5', '#ff5722', '#009688'
  ];
  
  // Usar el ID de la empresa para seleccionar un color consistente
  const index = empresas.findIndex(e => e._id === empresaId);
  return colors[index % colors.length] || '#fe5953';
};

  const handleLogout = () => {
    localStorage.removeItem('empresaId');
    localStorage.removeItem('ciudad');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

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
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 107, 107, 0.3)' }}>
          <Button
            fullWidth
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres cerrar sesión?\n\nSe te redirigirá al login.')) {
                handleLogout();
              }
            }}
            sx={{
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
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 107, 107, 0.3)', mx: 2 }} />

        <Box sx={{ p: 2, borderBottom: '1px solid rgba(79, 70, 222, 0.2)' }}>
<Button
  fullWidth
  startIcon={<CreateNewFolderIcon />}
  onClick={() => setFolderDialogOpen(true)}
  disabled={loading} // ✅ AGREGAR disabled cuando está loading
  sx={{
    color: 'white',
    fontWeight: 800,
    textTransform: 'none',
    borderRadius: '12px',
    bgcolor: '#fe5953',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    border: '1px solid rgba(254, 89, 83, 0.3)',
    mb: 1,
    '&:hover': { 
      bgcolor: '#ff6b66',
      boxShadow: `
        0 0 10px #fe5953,
        0 0 20px #fe5953, 
        0 0 40px #fe5953,
        inset 0 0 10px rgba(254, 89, 83, 0.3)
      `,
      border: '1px solid rgba(254, 89, 83, 0.8)',
      textShadow: '0 0 10px rgba(255,255,255,0.8)',
      transform: 'translateY(-2px)'
    },
    '&:disabled': {
      opacity: 0.6,
      bgcolor: '#cccccc'
    }
  }}
>
  {loading ? 'Cargando...' : 'Crear Carpeta'} {/* ✅ MOSTRAR ESTADO */}
</Button>

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
            Agregar Impresora
          </Button>

          <Button
            fullWidth
            startIcon={<DownloadIcon />}
            onClick={() => setDownloadAgentOpen(true)}
            sx={{
              color: 'white',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '12px',
              bgcolor: '#00c853',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              border: '1px solid rgba(0, 200, 83, 0.3)',
              mt: 4,
              '&:hover': { 
                bgcolor: '#00e676',
                boxShadow: `
                  0 0 10px #00c853,
                  0 0 20px #00c853, 
                  0 0 40px #00c853,
                  inset 0 0 10px rgba(0, 200, 83, 0.3)
                `,
                border: '1px solid rgba(0, 200, 83, 0.8)',
                textShadow: '0 0 10px rgba(255,255,255,0.8)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Descargar Agente
          </Button>

        </Box>





{/* 🆕 SISTEMA DE BREADCRUMB PARA NAVEGAR ENTRE CARPETAS */}
{(getFolderPath(currentFolderId).length > 0) && (
  <Box sx={{ p: 2, borderBottom: '1px solid rgba(79, 70, 222, 0.2)' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {/* Botón para ir al inicio */}
      <Button
        onClick={handleBackToRoot}
        size="small"
        sx={{
          color: '#b8a9ff',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: '6px',
          border: '1px solid rgba(184, 169, 255, 0.3)',
          bgcolor: 'rgba(184, 169, 255, 0.1)',
          minWidth: 'auto',
          px: 1,
          '&:hover': {
            bgcolor: 'rgba(184, 169, 255, 0.2)',
            border: '1px solid rgba(184, 169, 255, 0.6)'
          }
        }}
      >
        🏠
      </Button>

      {/* Breadcrumb con las carpetas */}
      {getFolderPath(currentFolderId).map((folder, index) => (
        <Box key={folder._id} sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ color: '#b8a9ff', mx: 0.5 }}>/</Typography>
          
          <Button
            onClick={() => navigateToFolder(folder._id)}
            size="small"
            sx={{
              color: index === getFolderPath(currentFolderId).length - 1 ? '#fe5953' : '#b8a9ff',
              fontWeight: index === getFolderPath(currentFolderId).length - 1 ? 700 : 500,
              textTransform: 'none',
              minWidth: 'auto',
              px: 1,
              fontSize: '0.8rem',
              '&:hover': {
                bgcolor: 'rgba(254, 89, 83, 0.1)',
                color: '#fe5953'
              }
            }}
          >
            {folder.nombre}
          </Button>
        </Box>
      ))}
    </Box>
  </Box>
)}

<List
  dense
  subheader={
    <ListSubheader
      sx={{
        bgcolor: 'transparent', color: '#d0bfff',
        borderBottom: '1px solid rgba(79, 70, 222, 0.18)'
      }}
    >
      {currentFolderId ? 'Contenido de la carpeta' : 'Empresas y Carpetas'}
    </ListSubheader>
  }
  sx={{ flex: 1, overflowY: 'auto' }}
>
  {/* ✅ AGREGAR LOADING PARA CARPETAS */}
  {loading && (
    <Box sx={{ px: 2, py: 1 }}>
      <LinearProgress />
    </Box>
  )}

  {loadingEmpresas && (
    <Box sx={{ px: 2, py: 1 }}>
      <LinearProgress />
    </Box>
  )}

{getChildFolders(currentFolderId).map((folder) => (
  <ListItemButton
    key={folder._id} // ✅ CAMBIADO A _id
    onContextMenu={(e) => handleContextMenu(e, folder)}
    onClick={() => handleSelectFolder(folder)}
    onDrop={(e) => handleFolderDrop(e, folder._id)} // ✅ CAMBIADO A _id
    onDragOver={handleDragOver}
    sx={{
      color: 'white',
      '&:hover': { 
        bgcolor: 'rgba(254, 89, 83, 0.08)',
        '& .folder-actions': { opacity: 1 }
      }
    }}
  >
    <FolderIcon sx={{ color: '#fe5953', mr: 1 }} />
    <ListItemText
      primary={
        <Typography sx={{ fontWeight: 700, color: '#fe5953' }}>
          {folder.nombre} {/* ✅ CAMBIADO A nombre */}
        </Typography>
      }
      secondary={
        <Typography sx={{ color: '#b8a9ff', fontSize: '0.75rem' }}>
          Carpeta
        </Typography>
      }
    />
    <IconButton
      size="small"
      className="folder-actions"
      onClick={(e) => {
        e.stopPropagation();
        handleContextMenu(e, folder);
      }}
      sx={{ 
        opacity: 0, 
        color: '#b8a9ff',
        transition: 'opacity 0.2s',
        '&:hover': { color: 'white' }
      }}
    >
      <MoreVertIcon />
    </IconButton>
  </ListItemButton>
))}

          {empresasEnCarpetaActual.map((empresa) => (
            <EmpresaListItem 
              key={empresa._id}
              empresa={empresa}
              onSelectEmpresa={handleSelectEmpresa}
              isSelected={selectedEmpresa?._id === empresa._id}
              onMoveToFolder={(folderId) => moveEmpresaToFolder(empresa._id, folderId)}
              onEmpresaContextMenu={handleEmpresaContextMenu} // 🆕 AGREGAR ESTA PROP
            />
          ))}
          
{!loading && !loadingEmpresas && getChildFolders(currentFolderId).length === 0 && empresasEnCarpetaActual.length === 0 && (
  <Typography sx={{ p: 2, color: '#b8a9ff', textAlign: 'center' }}>
    {currentFolderId ? 'La carpeta está vacía' : 'No hay empresas. Crea la primera con el botón de arriba.'}
  </Typography>
)}
        </List>
      </Card>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(79, 70, 222, 0.2)', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <DevicesIcon sx={{ color: '#b8a9ff' }} />
              <Typography variant="h6" sx={{ color: '#b8a9ff', fontWeight: 800 }}>
                {selectedEmpresa.nombre}
              </Typography>
              
              <Box sx={{ flex: 1 }} />

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
  <ListItemButton
    onClick={() => setExpandedPrinterId(expandedPrinterId === p._id ? null : p._id)}
    onContextMenu={(e) => handlePrinterContextMenu(e, p)}
    sx={{ 
      display: 'flex',
      alignItems: 'center', 
      gap: 1,
      position: 'relative',
      color: 'white',
      '&:hover': { 
        bgcolor: 'rgba(254, 89, 83, 0.08)',
        '& .printer-actions': { opacity: 1 }
      }
    }}
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

    {/* BOTÓN DE 3 PUNTOS PARA IMPRESORAS */}
    <IconButton
      size="small"
      className="printer-actions"
      onClick={(e) => {
        e.stopPropagation();
        handlePrinterContextMenu(e, p);
      }}
      sx={{ 
        opacity: 0, 
        color: '#b8a9ff',
        transition: 'opacity 0.2s',
        '&:hover': { 
          color: 'white'
        }
      }}
    >
      <MoreVertIcon />
    </IconButton>

    <Box sx={{ flex: 1 }} />
    <Typography sx={{ color:'#b8a9ff' }}>{p.host}</Typography>
    
  </ListItemButton>
    
    

                    

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

      <Dialog
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#351d79',
            color: 'white',
            border: '2px solid #fe5953',
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ color: '#b8a9ff' }}>
          <CreateNewFolderIcon sx={{ mr: 1, color: '#fe5953' }} />
          Crear Nueva Carpeta
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nombre de la carpeta"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                bgcolor: 'rgba(46, 0, 79, 0.55)',
                '& fieldset': { borderColor: '#4f46de' },
                '&:hover fieldset': { borderColor: '#fe5953' },
                '&.Mui-focused fieldset': { borderColor: '#fe5953' },
              },
              '& .MuiInputLabel-root': { color: '#b8a9ff' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#fe5953' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setFolderDialogOpen(false)}
            sx={{ color: '#b8a9ff' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateFolder}
            variant="contained"
            disabled={!newFolderName.trim()}
            sx={{ 
              bgcolor: '#fe5953', 
              color: 'white',
              '&:hover': { bgcolor: '#ff6b66' }
            }}
          >
            Crear Carpeta
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        open={folderContextMenu.open}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          folderContextMenu.open
            ? { top: folderContextMenu.mouseY, left: folderContextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            bgcolor: '#351d79',
            color: 'white',
            border: '2px solid #4f46de',
            borderRadius: '12px',
          }
        }}
      >
        <MenuItem 
          onClick={() => handleOpenRenameDialog(folderContextMenu.folder)}
          sx={{ color: '#b8a9ff' }}
        >
          <EditIcon sx={{ mr: 1, fontSize: '20px' }} />
          Renombrar
        </MenuItem>
        <MenuItem 
          onClick={() => handleOpenDeleteDialog(folderContextMenu.folder)}
          sx={{ color: '#ff6b6b' }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: '20px' }} />
          Eliminar
        </MenuItem>
      </Menu>

      <Dialog
        open={renameDialog.open}
        onClose={() => setRenameDialog({ open: false, folder: null, newName: '' })}
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
        <EditIcon sx={{ mr: 1, color: '#4f46de' }} />
        Renombrar Carpeta "{renameDialog.folder?.nombre}" {/* ✅ CAMBIADO A nombre */}
      </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nuevo nombre"
            fullWidth
            value={renameDialog.newName}
            onChange={(e) => setRenameDialog(prev => ({ ...prev, newName: e.target.value }))}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                bgcolor: 'rgba(46, 0, 79, 0.55)',
                '& fieldset': { borderColor: '#4f46de' },
                '&:hover fieldset': { borderColor: '#fe5953' },
                '&.Mui-focused fieldset': { borderColor: '#fe5953' },
              },
              '& .MuiInputLabel-root': { color: '#b8a9ff' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#fe5953' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRenameDialog({ open: false, folder: null, newName: '' })}
            sx={{ color: '#b8a9ff' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmRename}
            variant="contained"
            disabled={!renameDialog.newName.trim()}
            sx={{ 
              bgcolor: '#4f46de', 
              color: 'white',
              '&:hover': { bgcolor: '#5d55e8' }
            }}
          >
            Renombrar
          </Button>
        </DialogActions>
      </Dialog>


{/* 🆕 MENÚ CONTEXTUAL PARA IMPRESORAS */}
<Menu
  open={printerContextMenu.open}
  onClose={handleClosePrinterContextMenu}
  anchorReference="anchorPosition"
  anchorPosition={
    printerContextMenu.open
      ? { top: printerContextMenu.mouseY, left: printerContextMenu.mouseX }
      : undefined
  }
  PaperProps={{
    sx: {
      bgcolor: '#351d79',
      color: 'white',
      border: '2px solid #4f46de',
      borderRadius: '12px',
    }
  }}
>
  <MenuItem 
    onClick={() => handleOpenRenamePrinterDialog(printerContextMenu.printer)}
    sx={{ color: '#b8a9ff' }}
  >
    <EditIcon sx={{ mr: 1, fontSize: '20px' }} />
    Renombrar Impresora
  </MenuItem>
  <MenuItem 
    onClick={() => handleOpenDeletePrinterDialog(printerContextMenu.printer)}
    sx={{ color: '#ff6b6b' }}
  >
    <DeleteIcon sx={{ mr: 1, fontSize: '20px' }} />
    Eliminar Impresora
  </MenuItem>
</Menu>

{/* 🆕 MODAL PARA RENOMBRAR IMPRESORA */}
<Dialog
  open={renamePrinterDialog.open}
  onClose={() => setRenamePrinterDialog({ open: false, printer: null, newName: '' })}
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
    <EditIcon sx={{ mr: 1, color: '#4f46de' }} />
    Renombrar Impresora
  </DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      label="Nuevo nombre de la impresora"
      fullWidth
      value={renamePrinterDialog.newName}
      onChange={(e) => setRenamePrinterDialog(prev => ({ ...prev, newName: e.target.value }))}
      sx={{
        mt: 2,
        '& .MuiOutlinedInput-root': {
          color: 'white',
          bgcolor: 'rgba(46, 0, 79, 0.55)',
          '& fieldset': { borderColor: '#4f46de' },
          '&:hover fieldset': { borderColor: '#fe5953' },
          '&.Mui-focused fieldset': { borderColor: '#fe5953' },
        },
        '& .MuiInputLabel-root': { color: '#b8a9ff' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#fe5953' },
      }}
    />
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setRenamePrinterDialog({ open: false, printer: null, newName: '' })}
      sx={{ color: '#b8a9ff' }}
    >
      Cancelar
    </Button>
    <Button 
      onClick={handleConfirmRenamePrinter}
      variant="contained"
      disabled={!renamePrinterDialog.newName.trim()}
      sx={{ 
        bgcolor: '#4f46de', 
        color: 'white',
        '&:hover': { bgcolor: '#5d55e8' }
      }}
    >
      Renombrar
    </Button>
  </DialogActions>
</Dialog>


{/* 🆕 MODAL PARA ELIMINAR IMPRESORA */}
<Dialog
  open={deletePrinterDialog.open}
  onClose={() => setDeletePrinterDialog({ open: false, printer: null })}
  PaperProps={{
    sx: {
      bgcolor: '#351d79',
      color: 'white',
      border: '2px solid #fe5953',
      borderRadius: '16px',
    }
  }}
>
  <DialogTitle sx={{ color: '#b8a9ff' }}>
    <DeleteIcon sx={{ mr: 1, color: '#fe5953' }} />
    Eliminar Impresora
  </DialogTitle>
  <DialogContent>
    <Typography>
      ¿Estás seguro de que quieres eliminar la impresora "{deletePrinterDialog.printer?.printerName || deletePrinterDialog.printer?.host}"?
    </Typography>
    <Typography sx={{ color: '#ff6b6b', mt: 1, fontWeight: 600 }}>
      Esta acción no se puede deshacer y se perderán todos los datos históricos de esta impresora.
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setDeletePrinterDialog({ open: false, printer: null })}
      sx={{ color: '#b8a9ff' }}
    >
      Cancelar
    </Button>
    <Button 
      onClick={handleConfirmDeletePrinter}
      variant="contained"
      sx={{ 
        bgcolor: '#fe5953', 
        color: 'white',
        '&:hover': { bgcolor: '#ff6b66' }
      }}
    >
      Eliminar
    </Button>
  </DialogActions>
</Dialog>

{/* 🆕 MENÚ CONTEXTUAL PARA EMPRESAS */}
<Menu
  open={empresaContextMenu.open}
  onClose={handleCloseEmpresaContextMenu}
  anchorReference="anchorPosition"
  anchorPosition={
    empresaContextMenu.open
      ? { top: empresaContextMenu.mouseY, left: empresaContextMenu.mouseX }
      : undefined
  }
  PaperProps={{
    sx: {
      bgcolor: '#351d79',
      color: 'white',
      border: '2px solid #4f46de',
      borderRadius: '12px',
    }
  }}
>
  <MenuItem 
    onClick={() => handleOpenRenameEmpresaDialog(empresaContextMenu.empresa)}
    sx={{ color: '#b8a9ff' }}
  >
    <EditIcon sx={{ mr: 1, fontSize: '20px' }} />
    Renombrar Empresa
  </MenuItem>
  <MenuItem 
    onClick={() => handleOpenDeleteEmpresaDialog(empresaContextMenu.empresa)}
    sx={{ color: '#ff6b6b' }}
  >
    <DeleteIcon sx={{ mr: 1, fontSize: '20px' }} />
    Eliminar Empresa
  </MenuItem>
</Menu>

{/* 🆕 MODAL PARA RENOMBRAR EMPRESA */}
<Dialog
  open={renameEmpresaDialog.open}
  onClose={() => setRenameEmpresaDialog({ open: false, empresa: null, newName: '' })}
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
    <EditIcon sx={{ mr: 1, color: '#4f46de' }} />
    Renombrar Empresa
  </DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      label="Nuevo nombre de la empresa"
      fullWidth
      value={renameEmpresaDialog.newName}
      onChange={(e) => setRenameEmpresaDialog(prev => ({ ...prev, newName: e.target.value }))}
      sx={{
        mt: 2,
        '& .MuiOutlinedInput-root': {
          color: 'white',
          bgcolor: 'rgba(46, 0, 79, 0.55)',
          '& fieldset': { borderColor: '#4f46de' },
          '&:hover fieldset': { borderColor: '#fe5953' },
          '&.Mui-focused fieldset': { borderColor: '#fe5953' },
        },
        '& .MuiInputLabel-root': { color: '#b8a9ff' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#fe5953' },
      }}
    />
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setRenameEmpresaDialog({ open: false, empresa: null, newName: '' })}
      sx={{ color: '#b8a9ff' }}
    >
      Cancelar
    </Button>
    <Button 
      onClick={handleConfirmRenameEmpresa}
      variant="contained"
      disabled={!renameEmpresaDialog.newName.trim()}
      sx={{ 
        bgcolor: '#4f46de', 
        color: 'white',
        '&:hover': { bgcolor: '#5d55e8' }
      }}
    >
      Renombrar
    </Button>
  </DialogActions>
</Dialog>

{/* 🆕 MODAL PARA ELIMINAR EMPRESA */}
<Dialog
  open={deleteEmpresaDialog.open}
  onClose={() => setDeleteEmpresaDialog({ open: false, empresa: null })}
  PaperProps={{
    sx: {
      bgcolor: '#351d79',
      color: 'white',
      border: '2px solid #fe5953',
      borderRadius: '16px',
    }
  }}
>
  <DialogTitle sx={{ color: '#b8a9ff' }}>
    <DeleteIcon sx={{ mr: 1, color: '#fe5953' }} />
    Eliminar Empresa
  </DialogTitle>
  <DialogContent>
    <Typography>
      ¿Estás seguro de que quieres eliminar la empresa "{deleteEmpresaDialog.empresa?.nombre}"?
    </Typography>
    <Typography sx={{ color: '#ff6b6b', mt: 1, fontWeight: 600 }}>
      Esta acción no se puede deshacer y se perderán todos los datos históricos de esta empresa y sus impresoras.
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setDeleteEmpresaDialog({ open: false, empresa: null })}
      sx={{ color: '#b8a9ff' }}
    >
      Cancelar
    </Button>
    <Button 
      onClick={handleConfirmDeleteEmpresa}
      variant="contained"
      sx={{ 
        bgcolor: '#fe5953', 
        color: 'white',
        '&:hover': { bgcolor: '#ff6b66' }
      }}
    >
      Eliminar
    </Button>
  </DialogActions>
</Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, folder: null })}
        PaperProps={{
          sx: {
            bgcolor: '#351d79',
            color: 'white',
            border: '2px solid #fe5953',
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ color: '#b8a9ff' }}>
          <DeleteIcon sx={{ mr: 1, color: '#fe5953' }} />
          Eliminar Carpeta
        </DialogTitle>
        <DialogContent>
        <Typography>
          ¿Estás seguro de que quieres eliminar la carpeta "{deleteDialog.folder?.nombre}"? {/* ✅ CAMBIADO A nombre */}
        </Typography>
          <Typography sx={{ color: '#ff6b6b', mt: 1, fontWeight: 600 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, folder: null })}
            sx={{ color: '#b8a9ff' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{ 
              bgcolor: '#fe5953', 
              color: 'white',
              '&:hover': { bgcolor: '#ff6b66' }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

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

{/* 🆕 MODAL PARA DESCARGAR AGENTE */}
<Dialog
  open={downloadAgentOpen}
  onClose={() => setDownloadAgentOpen(false)}
  PaperProps={{
    sx: {
      bgcolor: '#351d79',
      color: 'white',
      border: '2px solid #00c853',
      borderRadius: '16px',
      boxShadow: '0 0 20px rgba(0, 200, 83, 0.4)'
    }
  }}
>
  <DialogTitle sx={{ color: '#b8a9ff', textAlign: 'center' }}>
    <DownloadIcon sx={{ mr: 1, color: '#00c853' }} />
    Descargar Agente Grape Monitor
  </DialogTitle>
  <DialogContent>
    <Typography sx={{ textAlign: 'center', mb: 2 }}>
      ¿Estás seguro de que quieres descargar el Agente de Copias?
    </Typography>
    <Alert severity="info" sx={{ 
      bgcolor: 'rgba(0, 200, 83, 0.1)', 
      color: '#80e27e',
      border: '1px solid rgba(0, 200, 83, 0.3)'
    }}>
      El Agente es un ejecutable que se instala en las computadoras con impresoras para monitorearlas automáticamente.
    </Alert>
  </DialogContent>
  <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
    <Button 
      onClick={() => setDownloadAgentOpen(false)}
      sx={{ 
        color: '#b8a9ff',
        border: '1px solid #4f46de',
        borderRadius: '8px',
        px: 3
      }}
    >
      Cancelar
    </Button>
    <Button 
      onClick={() => {
        window.open('https://github.com/Lynden555/grapeassist-software/releases/download/v2.5.0/Grape.Monitor.Setup.2.9.4.exe');
        setDownloadAgentOpen(false);
        setSuccessMsg('✅ Redirigiendo para descargar el Agente...');
      }}
      variant="contained"
      sx={{ 
        bgcolor: '#00c853', 
        color: 'white',
        borderRadius: '8px',
        px: 3,
        '&:hover': { 
          bgcolor: '#00e676',
          boxShadow: '0 0 15px rgba(0, 200, 83, 0.6)'
        }
      }}
    >
      ✅ Descargar
    </Button>
  </DialogActions>
</Dialog>


    </Box>
  );
}