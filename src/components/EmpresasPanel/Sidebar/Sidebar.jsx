import React from 'react';
import { Box, Typography, Tooltip, IconButton, LinearProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/Download';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderListItem from './FolderListItem';
import EmpresaListItem from './EmpresaListItem';
import { handleLogout } from '../utils/scopeHelpers';
import grapeLogo from '../../images/grape.png';

const INK = '#15101F';
const INK_SOFT = '#1D1630';
const LINE = 'rgba(255,255,255,0.07)';
const TEXT = '#F4F1FB';
const MUTED = 'rgba(244,241,251,0.45)';
const VIOLET = '#8b5cf6';

const Sidebar = ({
  onCreateFolder,
  onCreateEmpresa,
  onDownloadAgent,
  onOpenUpgrade,
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
  loadingEmpresas,
  empresasEnCarpetaActual,
  selectedEmpresa,
  onSelectEmpresa,
  onEmpresaContextMenu,
  onMoveEmpresaToFolder,
  planInfo,
  planLoading,
  porcentajeUso,
  cercaDelLimite,
  enLimite,
  trialPorExpirar,
}) => {
  const handleLogoutClick = () => {
    if (window.confirm('¿Cerrar sesión?')) handleLogout();
  };

  const activas = planInfo?.impresorasActivas ?? 0;
  const limite = planInfo?.limiteImpresoras;
  const ilimitado = !limite || limite >= 9999;
  const pct = ilimitado ? 0 : Math.min(100, porcentajeUso || 0);
  const mostrarUpgrade = true;

  const totalItems = childFolders.length + empresasEnCarpetaActual.length;
  const vacio =
    !loading && !loadingEmpresas && totalItems === 0;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        bgcolor: INK,
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 18px 50px -24px rgba(21,16,31,0.65)',
      }}
    >
      {/* Línea de uso del plan */}
      <Box sx={{ height: '3px', bgcolor: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
        {!ilimitado && (
          <Box
            sx={{
              height: '100%',
              width: `${pct}%`,
              background: enLimite
                ? 'linear-gradient(90deg,#f43f5e,#fb7185)'
                : cercaDelLimite
                  ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                  : `linear-gradient(90deg,${VIOLET},#ec4899)`,
              transition: 'width .5s ease',
            }}
          />
        )}
      </Box>

{/* Marca */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.75,
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={grapeLogo}
          alt=""
          sx={{ width: 32, height: 32, flexShrink: 0, objectFit: 'contain', display: 'block' }}
        />

        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            color: TEXT,
            fontWeight: 800,
            fontSize: '15px',
            letterSpacing: '-0.02em',
          }}
        >
          Grape Monitor
        </Typography>

        <Tooltip title="Cerrar sesión">
          <IconButton
            size="small"
            onClick={handleLogoutClick}
            sx={{
              color: 'rgba(244,241,251,0.3)',
              '&:hover': { color: '#fb7185', bgcolor: 'rgba(251,113,133,0.1)' },
            }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Plan */}
      {!planLoading && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mx: 2,
            mb: 1.75,
            px: 1.5,
            py: 1.25,
            borderRadius: '12px',
            flexShrink: 0,
            border: `1px solid ${LINE}`,
            bgcolor: 'rgba(255,255,255,0.03)',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: 'rgba(244,241,251,0.3)',
                fontSize: '9.5px',
                fontWeight: 700,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
              }}
            >
              Impresoras
            </Typography>
            <Typography
              sx={{
                color: TEXT,
                fontSize: '15px',
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {activas} <Box component="span" sx={{ color: MUTED }}>/ {ilimitado ? '∞' : limite}</Box>
            </Typography>
          </Box>

          {mostrarUpgrade && (
            <Box
              component="button"
              onClick={onOpenUpgrade}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                flexShrink: 0,
                px: 1.4,
                py: '7px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                color: enLimite ? '#fda4af' : cercaDelLimite ? '#fcd34d' : '#c4b5fd',
                border: `1px solid ${
                  enLimite
                    ? 'rgba(251,113,133,0.35)'
                    : cercaDelLimite
                      ? 'rgba(251,191,36,0.35)'
                      : 'rgba(139,92,246,0.32)'
                }`,
                bgcolor: enLimite
                  ? 'rgba(251,113,133,0.12)'
                  : cercaDelLimite
                    ? 'rgba(251,191,36,0.12)'
                    : 'rgba(139,92,246,0.12)',
                transition: 'all .18s ease',
                '&:hover': { filter: 'brightness(1.2)' },
              }}
            >
              <RocketLaunchIcon sx={{ fontSize: 13 }} />
              {enLimite ? 'Límite' : cercaDelLimite ? 'Casi lleno' : 'Planes'}
            </Box>
          )}
        </Box>
      )}

      {/* Acciones */}
      <Box sx={{ display: 'flex', gap: 1, px: 2, pb: 1.5, flexShrink: 0 }}>
        <Box
          component="button"
          onClick={onCreateEmpresa}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            height: 38,
            border: 'none',
            borderRadius: '11px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '13px',
            color: '#fff',
            background: `linear-gradient(135deg,${VIOLET},#7C3AED)`,
            boxShadow: `0 6px 16px -6px ${VIOLET}`,
            transition: 'all .18s ease',
            '&:hover': { filter: 'brightness(1.12)', transform: 'translateY(-1px)' },
          }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
          Cliente
        </Box>

        <Tooltip title="Crear carpeta">
          <Box
            component="button"
            onClick={onCreateFolder}
            disabled={loading}
            sx={{
              width: 38,
              height: 38,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '11px',
              cursor: 'pointer',
              border: `1px solid ${LINE}`,
              bgcolor: 'rgba(255,255,255,0.04)',
              color: MUTED,
              transition: 'all .18s ease',
              '&:hover': { color: TEXT, bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            <CreateNewFolderOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
        </Tooltip>

        <Tooltip title="Descargar agente">
          <Box
            component="button"
            onClick={onDownloadAgent}
            sx={{
              width: 38,
              height: 38,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '11px',
              cursor: 'pointer',
              border: `1px solid ${LINE}`,
              bgcolor: 'rgba(255,255,255,0.04)',
              color: MUTED,
              transition: 'all .18s ease',
              '&:hover': { color: TEXT, bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
        </Tooltip>
      </Box>

      {/* Ruta */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 1,
          flexShrink: 0,
          borderTop: `1px solid ${LINE}`,
          borderBottom: `1px solid ${LINE}`,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Box
          component="button"
          onClick={onBackToRoot}
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 24,
            height: 24,
            flexShrink: 0,
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer',
            bgcolor: currentFolderId ? 'transparent' : 'rgba(139,92,246,0.18)',
            color: currentFolderId ? MUTED : VIOLET,
            transition: 'all .18s ease',
            '&:hover': { color: TEXT },
          }}
        >
          <HomeRoundedIcon sx={{ fontSize: 15 }} />
        </Box>

        {folderPath.map((f, i) => (
          <React.Fragment key={f._id || i}>
            <ChevronRightIcon sx={{ fontSize: 13, color: 'rgba(244,241,251,0.2)', flexShrink: 0 }} />
            <Box
              component="button"
              onClick={() => onNavigateToFolder(f, i)}
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                px: 0.5,
                color: i === folderPath.length - 1 ? VIOLET : MUTED,
                '&:hover': { color: TEXT },
              }}
            >
              {f.nombre}
            </Box>
          </React.Fragment>
        ))}
      </Box>

      {(loading || loadingEmpresas) && (
        <LinearProgress
          sx={{
            height: 2,
            flexShrink: 0,
            bgcolor: 'transparent',
            '& .MuiLinearProgress-bar': { bgcolor: VIOLET },
          }}
        />
      )}

      {/* Lista */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 1.25,
          py: 1.25,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255,255,255,0.12)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
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

        {empresasEnCarpetaActual.map((empresa, i) => (
          <EmpresaListItem
            key={empresa._id}
            empresa={empresa}
            index={i}
            onSelectEmpresa={onSelectEmpresa}
            isSelected={selectedEmpresa?._id === empresa._id}
            onMoveToFolder={(folderId) => onMoveEmpresaToFolder(empresa._id, folderId)}
            onEmpresaContextMenu={onEmpresaContextMenu}
          />
        ))}

        {vacio && (
          <Box sx={{ textAlign: 'center', px: 2, py: 6 }}>
            <Typography sx={{ color: MUTED, fontSize: '13px', lineHeight: 1.6 }}>
              {currentFolderId
                ? 'Esta carpeta está vacía'
                : 'Aún no hay clientes.\nAgrega el primero arriba.'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
