import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  TextField, 
  Button, 
  Card, 
  Typography, 
  Alert,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import { 
  Email, 
  Lock, 
  LocationOn, 
  Business,
  Person,
  Phone,
  CheckCircle,
  ArrowBack
} from '@mui/icons-material';

const API_BASE = 'https://grape-monitor-production.up.railway.app';

const FloatingShape = ({ delay, size, color, top, left, right, bottom }) => (
  <motion.div
    style={{
      position: 'absolute',
      width: size,
      height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      borderRadius: '50%',
      top,
      left,
      right,
      bottom,
      filter: 'blur(40px)',
      opacity: 0.3
    }}
    animate={{
      y: [0, -20, 0],
      x: [0, 10, 0],
      scale: [1, 1.1, 1]
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

const steps = ['Información Personal', 'Datos Empresa', 'Confirmación'];

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

const [formData, setFormData] = useState({

  email: '',
  password: '',
  confirmPassword: '',
  ciudad: '',
  empresaId: ''
});

  const ciudades = ['Mexicali', 'Tijuana', 'Ensenada', 'Rosarito', 'Tecate'];

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

 // SOLO REEMPLAZA COMPLETAMENTE ESTA FUNCIÓN:
const handleNext = () => {
  // Validaciones por paso - CORREGIDAS
  if (activeStep === 0) {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
  }
  
  if (activeStep === 1) {
    if (!formData.empresaId || !formData.ciudad) {
      setError('ID de empresa y ciudad son obligatorios');
      return;
    }
    if (formData.empresaId.length < 3) {
      setError('El ID de empresa debe tener al menos 3 caracteres');
      return;
    }
  }

  setError('');
  setActiveStep((prev) => prev + 1);
};

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
  setLoading(true);
  setError('');

  try {
    const response = await fetch(`${API_BASE}/api/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        ciudad: formData.ciudad,
        empresaId: formData.empresaId
      })
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess('¡Registro exitoso! Te contactaremos para activar tu licencia.');
      setActiveStep(3);
    } else {
      throw new Error(data.error || 'Error en el registro');
    }

  } catch (err) {
    setError(err.message || 'Error de conexión con el servidor');
  } finally {
    setLoading(false);
  }
};

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email sx={{ color: 'rgba(255,255,255,0.5)' }} />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        label="Contraseña"
        type="password"
        value={formData.password}
        onChange={handleChange('password')}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ color: 'rgba(255,255,255,0.5)' }} />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        label="Confirmar Contraseña"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ color: 'rgba(255,255,255,0.5)' }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );

// Y SOLO CAMBIA EL PASO 2 DEL FORMULARIO:
case 1:
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        fullWidth
        label="ID de Empresa"
        value={formData.empresaId}
        onChange={handleChange('empresaId')}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Business sx={{ color: 'rgba(255,255,255,0.5)' }} />
            </InputAdornment>
          ),
        }}
      />
      <FormControl fullWidth>
        <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Ciudad
        </InputLabel>
        <Select
          value={formData.ciudad}
          onChange={handleChange('ciudad')}
          label="Ciudad"
          required
          startAdornment={
            <InputAdornment position="start" sx={{ mr: 1 }}>
              <LocationOn sx={{ color: 'rgba(255,255,255,0.5)' }} />
            </InputAdornment>
          }
        >
          {ciudades.map((ciudad) => (
            <MenuItem key={ciudad} value={ciudad}>
              {ciudad}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

// Y SOLO CAMBIA EL RESUMEN EN EL PASO 2:
case 2:
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)' }}>
        <Typography variant="h6" sx={{ color: '#b8a9ff', mb: 2 }}>
          Resumen del Registro
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#d0bfff' }}>
              Credenciales
            </Typography>
            <Typography sx={{ color: 'white' }}>Email: {formData.email}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#d0bfff' }}>
              Datos Empresa
            </Typography>
            <Typography sx={{ color: 'white' }}>Empresa: {formData.empresaId}</Typography>
            <Typography sx={{ color: 'white' }}>Ciudad: {formData.ciudad}</Typography>
          </Box>
        </Box>
      </Paper>
      <Alert severity="info" sx={{ bgcolor: 'rgba(229, 206, 246, 0.55)' }}>
        Después del registro, nuestro equipo se pondrá en contacto contigo para activar tu licencia.
      </Alert>
    </Box>
  );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#b8a9ff', mb: 2 }}>
              ¡Registro Completado!
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
              Hemos recibido tu solicitud de registro. Nos pondremos en contacto contigo dentro de las próximas 24 horas para activar tu licencia.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/login'}
              sx={{ color: '#b8a9ff', borderColor: '#4f46de' }}
            >
              Volver al Login
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, #4f46de 0%, transparent 55%),
          radial-gradient(circle at 80% 20%, #351d79 0%, transparent 50%),
          radial-gradient(circle at 60% 40%, #fe5953 5%, transparent 60%),
          linear-gradient(135deg, #2e004f 0%, #351d79 50%, #4f46de 100%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 2
      }}
    >
      {/* Elementos flotantes de fondo */}
      <FloatingShape delay={0} size={200} color="#ff6b6b" top="10%" left="10%" />
      <FloatingShape delay={2} size={150} color="#4ecdc4" top="70%" left="20%" />
      <FloatingShape delay={4} size={180} color="#45b7d1" top="20%" right="15%" />
      <FloatingShape delay={1} size={120} color="#96ceb4" bottom="10%" right="20%" />
      <FloatingShape delay={3} size={160} color="#feca57" top="60%" right="10%" />

      <Card
        sx={{
          width: '100%',
          maxWidth: 600,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          boxShadow: `
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #fff 0%, #a8edea 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 1
              }}
            >
              Grape Monitor Pro
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Sistema Profesional de Monitoreo de Impresoras
            </Typography>
          </Box>

          {/* Stepper */}
          {activeStep < 3 && (
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ color: 'white' }}>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          {/* Contenido del Formulario */}
          <form>
            {renderStepContent(activeStep)}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
                    {error}
                  </Alert>
                </motion.div>
              )}
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert severity="success" sx={{ mt: 2, borderRadius: '12px' }}>
                    {success}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botones de Navegación */}
            {activeStep < 3 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0 || loading}
                  startIcon={<ArrowBack />}
                  sx={{ color: '#b8a9ff' }}
                >
                  Atrás
                </Button>

                <Button
                  onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                  disabled={loading}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #7173feff 10%, #541888ff 100%)',
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #541888ff 10%, #7173feff 100%)',
                    }
                  }}
                >
                  {loading ? 'Procesando...' : 
                   activeStep === steps.length - 1 ? 'Completar Registro' : 'Siguiente'}
                </Button>
              </Box>
            )}
          </form>

          {/* Link al Login */}
          {activeStep < 3 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                ¿Ya tienes cuenta?{' '}
                <Button 
                  onClick={() => window.location.href = '/login'}
                  sx={{ color: '#b8a9ff', textTransform: 'none' }}
                >
                  Iniciar Sesión
                </Button>
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}