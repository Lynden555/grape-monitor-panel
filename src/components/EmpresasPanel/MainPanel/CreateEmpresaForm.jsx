import React, { useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Stack, Alert
} from '@mui/material';

const CreateEmpresaForm = ({
  nombre,
  setNombre,
  errorMsg,
  successMsg,
  loadingCreate,
  onSubmit,
}) => {
  const canSubmit = useMemo(() => nombre.trim().length >= 3, [nombre]);

  return (
    <Card
      sx={{
        bgcolor: '#ffffff',
        color: '#1a1a1a',
        border: '1px solid #e8e8e8',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 3, py: 2,
          background: '#1a1a1a',
          borderBottom: '1px solid #333',
        }}
      >
        <Typography variant="h5" sx={{
          color: '#ffffff',
          fontWeight: 800,
          letterSpacing: 0.5,
          fontFamily: '"Space Grotesk", sans-serif',
        }}>
          ⚙️ Agregar impresoras & generar ApiKey
        </Typography>
        <Typography sx={{ color: '#999999', mt: 0.5, fontSize: '0.9rem' }}>
          Crea una impresora y comparte su ApiKey al técnico para configurar el Agente.
        </Typography>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {errorMsg && (
            <Alert severity="error" sx={{
              bgcolor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '10px',
            }}>
              {errorMsg}
            </Alert>
          )}
          {successMsg && (
            <Alert severity="success" sx={{
              bgcolor: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
            }}>
              {successMsg}
            </Alert>
          )}

          <TextField
            label="Nombre de la locacion o empresa"
            variant="outlined"
            fullWidth
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            inputProps={{ maxLength: 64 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#1a1a1a',
                bgcolor: '#f8f8f8',
                borderRadius: '10px',
                '& fieldset': { borderColor: '#e8e8e8' },
                '&:hover fieldset': { borderColor: '#8b5cf6' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                '&.Mui-focused': { bgcolor: '#ffffff' },
              },
              '& .MuiInputLabel-root': { color: '#999999' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
            }}
            helperText={
              <span style={{ color: '#999999' }}>
                Ingresa un nombre único. Se generará una ApiKey segura.
              </span>
            }
          />

          <Button
            variant="contained"
            disabled={!canSubmit || loadingCreate}
            onClick={onSubmit}
            sx={{
              alignSelf: 'flex-start',
              color: '#ffffff',
              fontWeight: 800,
              px: 3, py: 1.2,
              textTransform: 'none',
              borderRadius: '10px',
              bgcolor: '#1a1a1a',
              boxShadow: 'none',
              border: 'none',
              '&:hover': {
                bgcolor: '#0a0a0a',
                boxShadow: 'none',
              },
              '&:disabled': {
                bgcolor: '#f3f3f3',
                color: '#ccc',
                boxShadow: 'none',
              }
            }}
          >
            {loadingCreate ? 'Creando...' : 'Crear y generar ApiKey'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CreateEmpresaForm;