import React from 'react';
import { Typography, ListItemButton, ListItemText, IconButton } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const FolderListItem = ({
  folder,
  onSelectFolder,
  onContextMenu,
  onDrop,
  onDragOver
}) => {
  return (
    <ListItemButton
      onContextMenu={(e) => onContextMenu(e, folder)}
      onClick={() => onSelectFolder(folder)}
      onDrop={(e) => onDrop(e, folder._id)}
      onDragOver={onDragOver}
      sx={{
        color: 'white',
'&:hover': {
  bgcolor: '#f8f8f8',
          '& .folder-actions': { opacity: 1 }
        }
      }}
    >
     <FolderIcon sx={{ color: '#8b5cf6', mr: 1 }} />
      <ListItemText
        primary={
          <Typography sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            {folder.nombre}
          </Typography>
        }
        secondary={
         <Typography sx={{ color: '#999999', fontSize: '0.75rem' }}>
            Carpeta
          </Typography>
        }
      />
      <IconButton
        size="small"
        className="folder-actions"
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(e, folder);
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

export default FolderListItem;