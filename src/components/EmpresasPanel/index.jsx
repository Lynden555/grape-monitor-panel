import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';

// Hooks
import { useFolderManager } from './hooks/useFolderManager';
import { useEmpresas } from './hooks/useEmpresas';
import { usePrinters } from './hooks/usePrinters';
import { usePlanInfo } from './hooks/usePlanInfo';

// Componentes
import Sidebar from './Sidebar/Sidebar';
import PulseBar from './MainPanel/PulseBar';
import EmptyState from './MainPanel/EmptyState';
import CreateEmpresaForm from './MainPanel/CreateEmpresaForm';
import EmpresaDetail from './MainPanel/EmpresaDetail';

// Modales
import {
  FolderContextMenu,
  CreateFolderDialog,
  RenameFolderDialog,
  DeleteFolderDialog
} from './modals/FolderDialogs';
import {
  PrinterContextMenu,
  RenamePrinterDialog,
  DeletePrinterDialog
} from './modals/PrinterDialogs';
import {
  EmpresaContextMenu,
  RenameEmpresaDialog,
  DeleteEmpresaDialog
} from './modals/EmpresaDialogs';
import ConfirmCorteModal from './modals/ConfirmCorteModal';
import ApiKeyModal from './modals/ApiKeyModal';
import DownloadAgentModal from './modals/DownloadAgentModal';
import UpgradeModal from './modals/UpgradeModal';
import TrialExpiredModal from './modals/TrialExpiredModal';

// Utils
import { getScope } from './utils/scopeHelpers';

export default function EmpresasPanel() {
  // ============== ESTADOS LOCALES (UI) ==============
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'empresa'
  const [nombre, setNombre] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

const [modalOpen, setModalOpen] = useState(false);
  const [empresaRecienCreada, setEmpresaRecienCreada] = useState(null);
  const [downloadAgentOpen, setDownloadAgentOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMotivo, setUpgradeMotivo] = useState(null);

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // ============== HOOKS ==============
const {
    planInfo,
    loading: planLoading,
    refetch: refetchPlanInfo,
    porcentajeUso,
    cercaDelLimite,
    enLimite,
    trialPorExpirar,
    trialExpirado,
  } = usePlanInfo();

  // Determinar si la cuenta está bloqueada
  // (trial expirado o cuenta inactiva)
  const cuentaBloqueada = planInfo
    ? (planInfo.trialExpirado === true || planInfo.activo === false)
    : false;

  const folderManager = useFolderManager();
  const empresasManager = useEmpresas();
  const printersManager = usePrinters();

  const {
    folders, folderContextMenu, renameDialog, deleteDialog,
    loading, createFolder,
    getFolderPath, getChildFolders,
    moveEmpresaToFolder, getEmpresasInFolder,
    handleContextMenu, handleCloseContextMenu,
    handleOpenRenameDialog, handleOpenDeleteDialog,
    handleConfirmRename, handleConfirmDelete,
    setRenameDialog, setDeleteDialog,
  } = folderManager;

  const {
    empresas, setEmpresas, loadingEmpresas,
    selectedEmpresa, setSelectedEmpresa,
    empresaContextMenu, renameEmpresaDialog, setRenameEmpresaDialog,
    deleteEmpresaDialog, setDeleteEmpresaDialog,
    loadEmpresas, createEmpresa, getEmpresaApiKey,
    deleteEmpresa, renameEmpresa,
    handleEmpresaContextMenu, handleCloseEmpresaContextMenu,
    handleOpenRenameEmpresaDialog, handleOpenDeleteEmpresaDialog,
  } = empresasManager;

  const {
    printers, loadingPrinters,
    expandedPrinterId, setExpandedPrinterId,
    generandoCorte, generandoPDF,
    confirmacionCorte, setConfirmacionCorte,
    printerContextMenu, renamePrinterDialog, setRenamePrinterDialog,
    deletePrinterDialog, setDeletePrinterDialog,
    loadPrinters, renamePrinter, deletePrinter,
    registrarCorte, generarPDF,
    handlePrinterContextMenu, handleClosePrinterContextMenu,
    handleOpenRenamePrinterDialog, handleOpenDeletePrinterDialog,
    clearPrinters,
  } = printersManager;

  // ============== AUTH READY ==============
  useEffect(() => {
    const { empresaId } = getScope();
    if (!empresaId) {
      window.location.replace('/#/login');
      return;
    }
    setIsAuthReady(true);
  }, []);

  // ============== CARGAR EMPRESAS ==============
  useEffect(() => {
    if (!isAuthReady) return;
    loadEmpresas();
  }, [isAuthReady]);

  // ============== POLLING DE IMPRESORAS ==============
// Detectar si hay impresoras inactivas (agente detectó la 6ª+)
  // Auto-abre modal upgrade la primera vez que detecta
  useEffect(() => {
    if (!planInfo || planInfo.impresorasInactivas === 0) return;

    const yaAvisado = sessionStorage.getItem('upgrade_avisado');
    if (yaAvisado) return;

    setUpgradeMotivo('agente_excedido');
    setUpgradeModalOpen(true);
    sessionStorage.setItem('upgrade_avisado', 'true');
  }, [planInfo?.impresorasInactivas]);

  // Refrescar plan info cuando se actualiza la lista de impresoras
  useEffect(() => {
    if (printers.length > 0) {
      refetchPlanInfo();
    }
  }, [printers.length]);

  // ============== DETECCIÓN DE CAMBIO DE SCOPE ==============
  useEffect(() => {
    if (!isAuthReady) return;
    let prev = getScope();

    const enforceAuth = () => {
      const { empresaId } = getScope();
      if (!empresaId) {
        setEmpresas([]);
        setSelectedEmpresa(null);
        clearPrinters();
        localStorage.removeItem('selectedEmpresaId');
        window.location.replace('/#/login');
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
        clearPrinters();
        setMode('list');
        loadEmpresas();
      }
    };

    const onFocus = () => handleScopeChange();
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

  // ============== HANDLERS DE EMPRESAS ==============
  const handleSelectEmpresa = async (emp) => {
    if (!emp) {
      setSelectedEmpresa(null);
      clearPrinters();
      setMode('list');
      return;
    }

    clearPrinters();
    setSelectedEmpresa(emp);
    setMode('empresa');

    if (!currentFolderId) {
      localStorage.setItem('selectedEmpresaId', emp._id);
    }

    try {
      await loadPrinters(emp._id, emp.nombre);
    } catch (error) {
      setErrorMsg(`Error al cargar impresoras: ${error.message}`);
    }
  };

  const handleCrearEmpresa = async () => {
    try {
      setErrorMsg(''); setSuccessMsg(''); setLoadingCreate(true);
      const nueva = await createEmpresa(nombre);

      setEmpresaRecienCreada({
        empresaId: nueva._id,
        apiKey: nueva.apiKey,
        nombre: nueva.nombre
      });
      setModalOpen(true);
      setSuccessMsg(`Empresa creada: ${nueva.nombre}`);
      setNombre('');

      // Si estamos dentro de una carpeta, asignar automáticamente
      if (currentFolderId) {
        folderManager.assignEmpresaToFolder(nueva._id, currentFolderId);
        setSuccessMsg(`Empresa "${nueva.nombre}" creada dentro de la carpeta actual`);
      } else {
        setSelectedEmpresa(nueva);
        localStorage.setItem('selectedEmpresaId', nueva._id);
        setMode('empresa');
        await loadPrinters(nueva._id, nueva.nombre);
      }
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleViewApiKey = async () => {
    if (!selectedEmpresa?._id) return;
    try {
      setErrorMsg(''); setSuccessMsg('');
      const data = await getEmpresaApiKey(selectedEmpresa._id);
      setEmpresaRecienCreada({
        empresaId: data._id,
        apiKey: data.apiKey,
        nombre: data.nombre
      });
      setModalOpen(true);
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  const handleDeleteSelectedEmpresa = async () => {
    if (!selectedEmpresa?._id) return;
    if (!window.confirm(`¿Seguro que quieres eliminar la empresa "${selectedEmpresa.nombre}"?`)) return;

    try {
      await deleteEmpresa(selectedEmpresa._id);
      setSelectedEmpresa(null);
      localStorage.removeItem('selectedEmpresaId');
      clearPrinters();
      setMode('list');
      setSuccessMsg(`Empresa "${selectedEmpresa.nombre}" eliminada`);
    } catch (e) {
      setErrorMsg(e.message || 'Error eliminando la empresa');
    }
  };

  const handleConfirmRenameEmpresa = async () => {
    if (renameEmpresaDialog.empresa && renameEmpresaDialog.newName.trim()) {
      try {
        const empresaId = renameEmpresaDialog.empresa._id;
        const newName = renameEmpresaDialog.newName.trim();
        await renameEmpresa(empresaId, newName);
        setSuccessMsg(`✅ Empresa renombrada a "${newName}"`);
        setRenameEmpresaDialog({ open: false, empresa: null, newName: '' });
      } catch (err) {
        setErrorMsg(`Error al renombrar empresa: ${err.message}`);
      }
    }
  };

  const handleConfirmDeleteEmpresa = async () => {
    if (deleteEmpresaDialog.empresa) {
      try {
        const empresaId = deleteEmpresaDialog.empresa._id;
        const empresaNombre = deleteEmpresaDialog.empresa.nombre;
        await deleteEmpresa(empresaId);

        if (selectedEmpresa?._id === empresaId) {
          setSelectedEmpresa(null);
          clearPrinters();
          setMode('list');
        }

        setSuccessMsg(`Empresa "${empresaNombre}" eliminada correctamente`);
        setDeleteEmpresaDialog({ open: false, empresa: null });
      } catch (err) {
        setErrorMsg(`Error al eliminar empresa: ${err.message}`);
      }
    }
  };

  // ============== HANDLERS DE IMPRESORAS ==============
  const handleConfirmarCorte = (printerId) => {
    const printer = printers.find(p => p._id === printerId);
    setConfirmacionCorte({
      printerId,
      printerName: printer?.displayName || 'Impresora'
    });
  };

  const handleRegistrarCorte = async () => {
    if (!confirmacionCorte) return;
    try {
      setErrorMsg(''); setSuccessMsg('');
      const data = await registrarCorte(confirmacionCorte.printerId);
      setSuccessMsg(`✅ Corte registrado: ${data.datos?.totalPaginas || 0} páginas este período`);
      if (selectedEmpresa?._id) {
        await loadPrinters(selectedEmpresa._id, selectedEmpresa.nombre);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleGenerarPDF = async (printerId) => {
    try {
      setErrorMsg(''); setSuccessMsg('');
      const printer = printers.find(p => p._id === printerId);
      const printerName = printer?.displayName || 'impresora';
      const fileName = await generarPDF(printerId, printerName);
      setSuccessMsg(`📄 PDF "${fileName}" descargado correctamente`);
    } catch (err) {
      setErrorMsg(`Error al generar PDF: ${err.message}`);
    }
  };

const handleConfirmRenamePrinter = async () => {
  console.log('🔵 handleConfirmRenamePrinter llamado', renamePrinterDialog);
  if (renamePrinterDialog.printer && renamePrinterDialog.newName.trim()) {
    console.log('🟢 Entró al if, llamando renamePrinter...');
      try {
        const printerId = renamePrinterDialog.printer._id;
        const newName = renamePrinterDialog.newName.trim();
        await renamePrinter(printerId, newName);
        setSuccessMsg(`Impresora renombrada a "${newName}"`);
        setRenamePrinterDialog({ open: false, printer: null, newName: '' });
      } catch (err) {
        setErrorMsg(`Error al renombrar impresora: ${err.message}`);
      }
    }
  };

  const handleConfirmDeletePrinter = async () => {
    if (deletePrinterDialog.printer) {
      try {
        const printerId = deletePrinterDialog.printer._id;
        const printerName = deletePrinterDialog.printer.displayName;
        await deletePrinter(printerId);
        setSuccessMsg(`Impresora "${printerName}" eliminada correctamente`);
        setDeletePrinterDialog({ open: false, printer: null });
      } catch (err) {
        setErrorMsg(`Error al eliminar impresora: ${err.message}`);
      }
    }
  };

  // ============== HANDLERS DE CARPETAS ==============
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
    setCurrentFolderId(folder._id);
    clearPrinters();
    setSelectedEmpresa(null);
    setMode('list');
  };

  const handleBackToRoot = () => {
    setCurrentFolderId(null);
    clearPrinters();
    setSelectedEmpresa(null);
    setMode('list');
  };

  const handleNavigateToFolder = (folderId) => {
    setCurrentFolderId(folderId);
    clearPrinters();
    setSelectedEmpresa(null);
    setMode('list');
  };

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

  // ============== COMPUTED VALUES ==============
  const empresasEnCarpetaActual = useMemo(() => {
    return getEmpresasInFolder(currentFolderId, empresas);
  }, [empresas, currentFolderId, folderManager.empresaFolderAssignments]);

  const folderPath = useMemo(() => getFolderPath(currentFolderId), [folders, currentFolderId]);
  const childFolders = useMemo(() => getChildFolders(currentFolderId), [folders, currentFolderId]);

  // ============== RENDER ==============
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 2,
        p: 2,
        minHeight: '100vh',
background: '#fcfcfc',
      }}
    >
<Sidebar
        onCreateFolder={() => setFolderDialogOpen(true)}
        onCreateEmpresa={() => { setMode('create'); setSelectedEmpresa(null); }}
        onDownloadAgent={() => setDownloadAgentOpen(true)}
        onOpenUpgrade={() => {
          setUpgradeMotivo(null); // Apertura manual desde botón
          setUpgradeModalOpen(true);
        }}
        planInfo={planInfo}
        planLoading={planLoading}
        porcentajeUso={porcentajeUso}
        cercaDelLimite={cercaDelLimite}
        enLimite={enLimite}
        trialPorExpirar={trialPorExpirar}
        loading={loading}
        currentFolderId={currentFolderId}
        folderPath={folderPath}
        childFolders={childFolders}
        onSelectFolder={handleSelectFolder}
        onBackToRoot={handleBackToRoot}
        onNavigateToFolder={handleNavigateToFolder}
        onFolderContextMenu={handleContextMenu}
        onFolderDrop={handleFolderDrop}
        onDragOver={handleDragOver}
        loadingEmpresas={loadingEmpresas}
        empresasEnCarpetaActual={empresasEnCarpetaActual}
        selectedEmpresa={selectedEmpresa}
        onSelectEmpresa={handleSelectEmpresa}
        onEmpresaContextMenu={handleEmpresaContextMenu}
        onMoveEmpresaToFolder={moveEmpresaToFolder}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <PulseBar />

        {mode === 'create' && (
          <CreateEmpresaForm
            nombre={nombre}
            setNombre={setNombre}
            errorMsg={errorMsg}
            successMsg={successMsg}
            loadingCreate={loadingCreate}
            onSubmit={handleCrearEmpresa}
          />
        )}

        {mode === 'empresa' && selectedEmpresa && (
          <EmpresaDetail
            empresa={selectedEmpresa}
            printers={printers}
            loadingPrinters={loadingPrinters}
            expandedPrinterId={expandedPrinterId}
            onToggleExpand={(id) => setExpandedPrinterId(expandedPrinterId === id ? null : id)}
            onPrinterContextMenu={handlePrinterContextMenu}
            onConfirmarCorte={handleConfirmarCorte}
            onGenerarPDF={handleGenerarPDF}
            generandoCorte={generandoCorte}
            generandoPDF={generandoPDF}
            onViewApiKey={handleViewApiKey}
            onDeleteEmpresa={handleDeleteSelectedEmpresa}
          />
        )}

        {mode === 'list' && !selectedEmpresa && (
          <EmptyState
            onCreateEmpresa={() => setMode('create')}
            onCreateFolder={() => setFolderDialogOpen(true)}
          />
        )}
      </Box>

      {/* ============== MODALES DE CARPETAS ============== */}
      <CreateFolderDialog
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        onCreate={handleCreateFolder}
      />
      <FolderContextMenu
        contextMenu={folderContextMenu}
        onClose={handleCloseContextMenu}
        onRename={handleOpenRenameDialog}
        onDelete={handleOpenDeleteDialog}
      />
      <RenameFolderDialog
        dialog={renameDialog}
        setDialog={setRenameDialog}
        onConfirm={handleConfirmRename}
      />
      <DeleteFolderDialog
        dialog={deleteDialog}
        setDialog={setDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      {/* ============== MODALES DE IMPRESORAS ============== */}
      <PrinterContextMenu
        contextMenu={printerContextMenu}
        onClose={handleClosePrinterContextMenu}
        onRename={handleOpenRenamePrinterDialog}
        onDelete={handleOpenDeletePrinterDialog}
      />
      <RenamePrinterDialog
        dialog={renamePrinterDialog}
        setDialog={setRenamePrinterDialog}
        onConfirm={handleConfirmRenamePrinter}
      />
      <DeletePrinterDialog
        dialog={deletePrinterDialog}
        setDialog={setDeletePrinterDialog}
        onConfirm={handleConfirmDeletePrinter}
      />

      {/* ============== MODALES DE EMPRESAS ============== */}
      <EmpresaContextMenu
        contextMenu={empresaContextMenu}
        onClose={handleCloseEmpresaContextMenu}
        onRename={handleOpenRenameEmpresaDialog}
        onDelete={handleOpenDeleteEmpresaDialog}
      />
      <RenameEmpresaDialog
        dialog={renameEmpresaDialog}
        setDialog={setRenameEmpresaDialog}
        onConfirm={handleConfirmRenameEmpresa}
      />
      <DeleteEmpresaDialog
        dialog={deleteEmpresaDialog}
        setDialog={setDeleteEmpresaDialog}
        onConfirm={handleConfirmDeleteEmpresa}
      />

      {/* ============== MODALES DE ACCIONES ============== */}
      <ConfirmCorteModal
        confirmacionCorte={confirmacionCorte}
        onClose={() => setConfirmacionCorte(null)}
        onConfirm={handleRegistrarCorte}
      />
      <ApiKeyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        empresa={empresaRecienCreada}
        onCopySuccess={(msg) => setSuccessMsg(msg)}
        onCopyError={(msg) => setErrorMsg(msg)}
      />
<DownloadAgentModal
        open={downloadAgentOpen}
        onClose={() => setDownloadAgentOpen(false)}
        onDownloadSuccess={(msg) => setSuccessMsg(msg)}
      />

      {/* ============== MODALES DE PLAN ============== */}
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        planActual={planInfo?.plan || 'trial'}
        impresorasActivas={planInfo?.impresorasActivas || 0}
        limiteActual={planInfo?.limiteImpresoras || 5}
        motivo={upgradeMotivo}
      />

<TrialExpiredModal
        open={cuentaBloqueada}
        onUpgrade={() => {
          setUpgradeMotivo('limite_alcanzado');
          setUpgradeModalOpen(true);
        }}
      />
    </Box>
  );
}