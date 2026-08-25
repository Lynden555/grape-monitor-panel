import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { EMPRESA_COLORS } from '../constants';

const TEXT = '#F4F1FB';
const MUTED = 'rgba(244,241,251,0.42)';

const colorDe = (empresa, index) => {
  const semilla = String(empresa._id || '').slice(-4);
  const n = parseInt(semilla, 16);
  const i = Number.isFinite(n) ? n : index;
  return EMPRESA_COLORS[i % EMPRESA_COLORS.length];
};

const EmpresaListItem = ({
  empresa,
  index = 0,
  onSelectEmpresa,
  isSelected,
  onEmpresaContextMenu,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const total = empresa.totalImpresoras ?? 0;
  const online = empresa.impresorasOnline ?? 0;
  const acento = colorDe(empresa, index);

  const LEDS = {
    verde: { color: '#22c55e', glow: '0 0 8px rgba(34,197,94,0.9)' },
    amarillo: { color: '#f59e0b', glow: '0 0 8px rgba(245,158,11,0.85)' },
    rojo: { color: '#ef4444', glow: '0 0 8px rgba(239,68,68,0.8)' },
    gris: { color: 'rgba(255,255,255,0.18)', glow: 'none' },
  };
  const led = LEDS[empresa.estadoFlota] || LEDS.gris;

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('empresaId', empresa._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => onSelectEmpresa(empresa)}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        pl: 1.75,
        pr: 0.5,
        py: 1.25,
        minHeight: 54,
        borderRadius: '12px',
        cursor: 'pointer',
        opacity: isDragging ? 0.45 : 1,
        overflow: 'hidden',
        bgcolor: isSelected ? 'rgba(139,92,246,0.16)' : 'transparent',
        transition: 'background .18s ease',
        '&:hover': {
          bgcolor: isSelected ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.045)',
          '& .empresa-actions': { opacity: 1 },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: isSelected ? '70%' : '38%',
          borderRadius: '0 3px 3px 0',
          bgcolor: acento,
          opacity: isSelected ? 1 : 0.65,
          transition: 'all .22s ease',
        },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            color: isSelected ? '#c4b5fd' : TEXT,
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
          {empresa.nombre}
        </Typography>
        <Typography
          sx={{
            color: MUTED,
            fontSize: '11px',
            fontFamily: 'ui-monospace, monospace',
            mt: '2px',
          }}
        >
          {total === 0
            ? 'sin equipos'
            : empresa.estadoFlota === 'rojo'
              ? `${online}/${total} · revisar`
              : `${online}/${total} en línea`}
        </Typography>
      </Box>

      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          flexShrink: 0,
          bgcolor: led.color,
          boxShadow: led.glow,
        }}
      />

      <IconButton
        size="small"
        className="empresa-actions"
        onClick={(e) => {
          e.stopPropagation();
          onEmpresaContextMenu(e, empresa);
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

export default EmpresaListItem;
