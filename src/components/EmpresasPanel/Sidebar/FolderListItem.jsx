import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const TEXT = '#F4F1FB';
const MUTED = 'rgba(244,241,251,0.42)';
const VIOLET = '#8b5cf6';

const FolderListItem = ({
  folder,
  onSelectFolder,
  onContextMenu,
  onDrop,
  onDragOver,
}) => {
  const [dragActivo, setDragActivo] = useState(false);

  const partes = [];
  if (folder.subcarpetas) partes.push(`${folder.subcarpetas} carpetas`);
  if (folder.clientes) partes.push(`${folder.clientes} clientes`);
  if (folder.impresoras) partes.push(`${folder.impresoras} equipos`);

  return (
    <Box
      onClick={() => onSelectFolder(folder)}
      onDragOver={(e) => {
        setDragActivo(true);
        onDragOver?.(e);
      }}
      onDragLeave={() => setDragActivo(false)}
      onDrop={(e) => {
        setDragActivo(false);
        onDrop?.(e, folder);
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.25,
        py: 1.25,
        minHeight: 54,
        borderRadius: '12px',
        cursor: 'pointer',
        border: dragActivo ? `1px dashed ${VIOLET}` : '1px solid transparent',
        bgcolor: dragActivo ? 'rgba(139,92,246,0.14)' : 'transparent',
        transition: 'all .18s ease',
        '&:hover': {
          bgcolor: dragActivo ? 'rgba(139,92,246,0.14)' : 'rgba(255,255,255,0.045)',
          '& .folder-actions': { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '9px',
          bgcolor: 'rgba(139,92,246,0.14)',
        }}
      >
        <FolderRoundedIcon sx={{ fontSize: 18, color: VIOLET }} />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            color: TEXT,
            fontWeight: 600,
            fontSize: '13.5px',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {folder.nombre}
        </Typography>
        <Typography
          sx={{
            color: MUTED,
            fontSize: '11px',
            fontFamily: 'ui-monospace, monospace',
            mt: '2px',
          }}
        >
          {partes.length ? partes.join(' · ') : 'vacía'}
        </Typography>
      </Box>

      <IconButton
        size="small"
        className="folder-actions"
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(e, folder);
        }}
        sx={{
          opacity: 0,
          flexShrink: 0,
          color: 'rgba(244,241,251,0.3)',
          transition: 'opacity .18s ease',
          '&:hover': { color: TEXT, bgcolor: 'rgba(255,255,255,0.08)' },
        }}
      >
        <MoreVertIcon sx={{ fontSize: 17 }} />
      </IconButton>
    </Box>
  );
};

export default FolderListItem;
