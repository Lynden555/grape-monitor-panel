import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Menu, MenuItem, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const dialogPaperSx = (accentColor = 'rgba(139, 92, 246, 0.3)') => ({
  bgcolor: 'rgba(15, 15, 20, 0.85)',
  backdropFilter: 'blur(20px)',
  color: 'white',
  border: `1px solid ${accentColor}`,
  borderRadius: '16px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
});

const titleSx = {
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '18px',
  letterSpacing: '-0.01em',
  display: 'flex',
  alignItems: 'center',
};

const textFieldSx = {
  mt: 2,
  '& .MuiOutlinedInput-root': {
    color: 'white',
    bgcolor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '1px' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
};

const cancelBtnSx = {
  color: 'rgba(255, 255, 255, 0.6)',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)' }
};

const primaryBtnSx = (color = '#8b5cf6') => ({
  bgcolor: color,
  color: 'white',
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '10px',
  px: 2.5,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: color,
    filter: 'brightness(1.15)',
    boxShadow: `0 0 20px ${color}40`
  },
  '&:disabled': { opacity: 0.4 }
});

const menuPaperSx = {
  bgcolor: 'rgba(15, 15, 20, 0.95)',
  backdropFilter: 'blur(20px)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  minWidth: 200,
};

export const EmpresaContextMenu = ({ contextMenu, onClose, onRename, onDelete }) => (
  <Menu
    open={contextMenu.open}
    onClose={onClose}
    anchorReference="anchorPosition"
    anchorPosition={
      contextMenu.open
        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
        : undefined
    }
    PaperProps={{ sx: menuPaperSx }}
  >
    <MenuItem
      onClick={() => onRename(contextMenu.empresa)}
      sx={{
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: '14px',
        '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.15)', color: '#fff' }
      }}
    >
      <EditIcon sx={{ mr: 1.5, fontSize: '18px' }} />
      Renombrar empresa
    </MenuItem>
    <MenuItem
      onClick={() => onDelete(contextMenu.empresa)}
      sx={{
        color: '#ef4444',
        fontSize: '14px',
        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
      }}
    >
      <DeleteIcon sx={{ mr: 1.5, fontSize: '18px' }} />
      Eliminar empresa
    </MenuItem>
  </Menu>
);

export const RenameEmpresaDialog = ({ dialog, setDialog, onConfirm }) => (
  <Dialog
    open={dialog.open}
    onClose={() => setDialog({ open: false, empresa: null, newName: '' })}
    PaperProps={{ sx: dialogPaperSx() }}
  >
    <DialogTitle sx={titleSx}>
      <Box sx={{
        width: 32, height: 32, borderRadius: '8px',
        bgcolor: 'rgba(139, 92, 246, 0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mr: 1.5
      }}>
        <EditIcon sx={{ color: '#8b5cf6', fontSize: '18px' }} />
      </Box>
      Renombrar empresa
    </DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        label="Nuevo nombre de la empresa"
        fullWidth
        value={dialog.newName}
        onChange={(e) => setDialog(prev => ({ ...prev, newName: e.target.value }))}
        sx={textFieldSx}
      />
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button
        onClick={() => setDialog({ open: false, empresa: null, newName: '' })}
        sx={cancelBtnSx}
      >
        Cancelar
      </Button>
      <Button
        onClick={onConfirm}
        disabled={!dialog.newName.trim()}
        sx={primaryBtnSx('#8b5cf6')}
      >
        Renombrar
      </Button>
    </DialogActions>
  </Dialog>
);

export const DeleteEmpresaDialog = ({ dialog, setDialog, onConfirm }) => (
  <Dialog
    open={dialog.open}
    onClose={() => setDialog({ open: false, empresa: null })}
    PaperProps={{ sx: dialogPaperSx('rgba(239, 68, 68, 0.3)') }}
  >
    <DialogTitle sx={titleSx}>
      <Box sx={{
        width: 32, height: 32, borderRadius: '8px',
        bgcolor: 'rgba(239, 68, 68, 0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mr: 1.5
      }}>
        <DeleteIcon sx={{ color: '#ef4444', fontSize: '18px' }} />
      </Box>
      Eliminar empresa
    </DialogTitle>
    <DialogContent>
      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
        ¿Eliminar la empresa <strong>"{dialog.empresa?.nombre}"</strong>?
      </Typography>
      <Typography sx={{ color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>
        Esta acción no se puede deshacer y se perderán todos los datos históricos de esta empresa y sus impresoras.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button
        onClick={() => setDialog({ open: false, empresa: null })}
        sx={cancelBtnSx}
      >
        Cancelar
      </Button>
      <Button onClick={onConfirm} sx={primaryBtnSx('#ef4444')}>
        Eliminar
      </Button>
    </DialogActions>
  </Dialog>
);