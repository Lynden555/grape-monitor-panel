import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import homeIcon from '../../images/home.png';

const Breadcrumb = ({ folderPath, onBackToRoot, onNavigateToFolder }) => {
  if (folderPath.length === 0) return null;
  return (
    <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Button
          onClick={onBackToRoot}
          size="small"
          sx={{
            color: '#1a1a1a',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '6px',
            border: '1px solid #e8e8e8',
            bgcolor: '#f3f3f3',
            minWidth: 'auto',
            px: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              bgcolor: '#e8e8e8',
              border: '1px solid #d0d0d0'
            }
          }}
        >
          <Box
            component="img"
            src={homeIcon}
            alt="Inicio"
            sx={{
              width: '18px',
              height: '18px',
              filter: 'brightness(0) saturate(100%)',
            }}
          />
        </Button>

        {folderPath.map((folder, index) => {
          const isLast = index === folderPath.length - 1;
          return (
            <Box key={folder._id} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ color: '#ccc', mx: 0.5 }}>/</Typography>
              <Button
                onClick={() => onNavigateToFolder(folder._id)}
                size="small"
                sx={{
                  color: isLast ? '#8b5cf6' : '#999999',
                  fontWeight: isLast ? 700 : 500,
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1,
                  fontSize: '0.8rem',
                  '&:hover': {
                    bgcolor: 'rgba(139, 92, 246, 0.06)',
                    color: '#8b5cf6'
                  }
                }}
              >
                {folder.nombre}
              </Button>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Breadcrumb;