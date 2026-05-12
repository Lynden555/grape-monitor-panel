import React from 'react';
import {
  Box, Card, Typography, List, ListSubheader, LinearProgress
} from '@mui/material';
import SidebarActions from './SidebarActions';
import Breadcrumb from './Breadcrumb';
import FolderListItem from './FolderListItem';
import EmpresaListItem from './EmpresaListItem';
import { handleLogout } from '../utils/scopeHelpers';

const Sidebar = ({
  // Acciones
  onCreateFolder,
  onCreateEmpresa,
  onDownloadAgent,
  // Carpetas
  loading,
  currentFolderId,
  folderPath,
  childFolders,
  onSelectFolder,
  onBackToRoot,
  onNavigateToFolder,
  onFolderContextMenu,
  onFolderDrop,
  onDragOver,
  // Empresas
  loadingEmpresas,
  empresasEnCarpetaActual,
  selectedEmpresa,
  onSelectEmpresa,
  onEmpresaContextMenu,
  onMoveEmpresaToFolder,
}) => {
  return (
    <Card
      sx={{
        bgcolor: '#ffffff',
        color: 'white',
       border: '1px solid #e8e8e8',
        borderRadius: '16px',
boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <SidebarActions
        onLogout={handleLogout}
        onCreateFolder={onCreateFolder}
        onCreateEmpresa={onCreateEmpresa}
        onDownloadAgent={onDownloadAgent}
        loading={loading}
      />

      <Breadcrumb
        folderPath={folderPath}
        onBackToRoot={onBackToRoot}
        onNavigateToFolder={onNavigateToFolder}
      />

      <List
        dense
        subheader={
          <ListSubheader
            sx={{
bgcolor: 'transparent',
color: '#999999',
borderBottom: '1px solid #f0f0f0'
            }}
          >
            {currentFolderId ? 'Contenido de la carpeta' : 'Empresas y Carpetas'}
          </ListSubheader>
        }
        sx={{ flex: 1, overflowY: 'auto' }}
      >
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

        {childFolders.map((folder) => (
          <FolderListItem
            key={folder._id}
            folder={folder}
            onSelectFolder={onSelectFolder}
            onContextMenu={onFolderContextMenu}
            onDrop={onFolderDrop}
            onDragOver={onDragOver}
          />
        ))}

        {empresasEnCarpetaActual.map((empresa) => (
          <EmpresaListItem
            key={empresa._id}
            empresa={empresa}
            onSelectEmpresa={onSelectEmpresa}
            isSelected={selectedEmpresa?._id === empresa._id}
            onMoveToFolder={(folderId) => onMoveEmpresaToFolder(empresa._id, folderId)}
            onEmpresaContextMenu={onEmpresaContextMenu}
          />
        ))}

        {!loading && !loadingEmpresas &&
          childFolders.length === 0 &&
          empresasEnCarpetaActual.length === 0 && (
            <Typography sx={{ p: 2, color: '#b8a9ff', textAlign: 'center' }}>
              {currentFolderId
                ? 'La carpeta está vacía'
                : 'No hay empresas. Crea la primera con el botón de arriba.'}
            </Typography>
          )}
      </List>
    </Card>
  );
};

export default Sidebar;