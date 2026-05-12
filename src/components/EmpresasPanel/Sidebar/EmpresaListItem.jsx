import React, { useState } from 'react';
import { Box, Typography, ListItemButton, ListItemText, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import printerIcon from '../../images/printer.png';

const EmpresaListItem = ({
  empresa,
  onSelectEmpresa,
  isSelected,
  onEmpresaContextMenu
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
  bgcolor: 'rgba(139, 92, 246, 0.06)',
  border: '1px solid rgba(139, 92, 246, 0.3)'
},
'&:hover': {
  bgcolor: '#f8f8f8',
          '& .empresa-actions': { opacity: 1 }
        },
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
        borderRadius: '12px',
        margin: '4px 8px',
       border: '1px solid #f0f0f0',
        transition: 'all 0.3s ease',
        padding: '14px 16px',
        height: '65px'
      }}
    >
      <Box
        component="img"
        src={printerIcon}
        alt="Impresora"
        sx={{
          width: '28px',
          height: '28px',
          mr: 2,
          filter: isSelected
            ? 'brightness(1.2) saturate(1.5)'
            : 'brightness(0.9) saturate(0.8)',
          opacity: isSelected ? 1 : 0.9,
        }}
      />

      <ListItemText
        primary={
          <Typography sx={{
            fontWeight: 800,
            color: isSelected ? '#7c3aed' : '#1a1a1a',
            fontSize: '16px',
            letterSpacing: '0.2px'
          }}>
            {empresa.nombre}
          </Typography>
        }
        secondary={
          <Typography sx={{
            color: isSelected ? '#a78bfa' : '#999999',
            fontSize: '0.8rem',
            marginTop: '2px'
          }}>
            Click para ver impresoras
          </Typography>
        }
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
          color: '#ccc',
          transition: 'opacity 0.2s',
         '&:hover': { color: '#1a1a1a' }
        }}
      >
        <MoreVertIcon />
      </IconButton>
    </ListItemButton>
  );
};

export default EmpresaListItem;