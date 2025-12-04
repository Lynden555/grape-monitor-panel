import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import loginGif from './images/login.gif';
import grapeLogo from './images/grape.png';
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
  InputLabel
} from '@mui/material';
import { 
  Email, 
  Lock, 
  LocationOn, 
  Visibility, 
  VisibilityOff,
  Business
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

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ciudad: '',
    empresaId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const ciudades = ['Mexicali', 'Tijuana', 'Ensenada', 'Rosarito', 'Tecate'];

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Llamada al endpoint de login CORREGIDO
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess('¡Login exitoso! Redirigiendo...');
      
      // Guardar en localStorage - CORREGIDO según tu backend
      localStorage.setItem('empresaId', data.empresaId);
      localStorage.setItem('ciudad', formData.ciudad);
      localStorage.setItem('userEmail', formData.email);
      
      // Redirigir al monitor
      setTimeout(() => {
        window.location.href = '/monitor';
      }, 1000);
    } else {
      throw new Error(data.error || 'Error en el login');
    }
  } catch (err) {
    setError(err.message || 'Error de conexión');
  } finally {
    setLoading(false);
  }
};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
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
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos flotantes de fondo */}
      <FloatingShape delay={0} size={200} color="#ff6b6b" top="10%" left="10%" />
      <FloatingShape delay={2} size={150} color="#4ecdc4" top="70%" left="20%" />
      <FloatingShape delay={4} size={180} color="#45b7d1" top="20%" right="15%" />
      <FloatingShape delay={1} size={120} color="#96ceb4" bottom="10%" right="20%" />
      <FloatingShape delay={3} size={160} color="#feca57" top="60%" right="10%" />

{/* LADO IZQUIERDO - GIF */}
<Box
  sx={{
    flex: 1,
    display: { xs: 'none', lg: 'flex' },
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  }}
>
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      backdropFilter: 'blur(1px)' // ← Agrega este blur sutil
    }}
  >

    {/* GIF con recarga continua */}
    <img 
      src={`${loginGif}?${Date.now()}`} // Fuerza recarga
      alt="Tecnología animada"
      style={{
        width: '155%',
        height: '155%', 
        objectFit: 'contain',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}
      onLoad={(e) => {
        const img = e.target;
        // Recarga cada 3 segundos
        setInterval(() => {
          const src = img.src.split('?')[0];
          img.src = `${src}?${Date.now()}`;
        },3500);
      }}
    />

    {/* Overlay gradiente para difuminar los bordes */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0, // Gradiente en el borde derecho
        bottom: 0,
        width: '30%', // Ancho del gradiente
        background: 'linear-gradient(90deg, transparent 0%, #2e004f 100%)',
        pointerEvents: 'none'
      }}
    />

    {/* Overlay adicional en todos los bordes para suavizar */}
    {/* Overlay más suave */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(90deg, rgba(46, 0, 79, 0.6) 0%, transparent 30%),
          linear-gradient(180deg, rgba(46, 0, 79, 0.4) 0%, transparent 20%, transparent 80%, rgba(46, 0, 79, 0.4) 100%)
        `,
        pointerEvents: 'none'
      }}
    />
  </div>
  
  {/* Overlay gradiente principal (el que ya tenías) */}
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(90deg, rgba(46, 0, 79, 0.8) 0%, transparent 30%)',
      pointerEvents: 'none'
    }}
  />
</Box>

      {/* LADO DERECHO - FORMULARIO */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          
        style={{ width: '100%', 
          maxWidth: 440,
          marginRight: '80px'  }}
        >
          <Card
            sx={{
              p: 4,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              boxShadow: `
                0 8px 32px 0 rgba(31, 38, 135, 0.37),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1)
              `,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Efecto de brillo superior */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                filter: 'blur(1px)'
              }}
            />

            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                
                {/* LOGO SIN FONDO */}
                <Box
                sx={{
                    width: 70,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    // Quitamos el fondo y sombra
                    background: 'transparent',
                    boxShadow: 'none'
                }}
                >
                {/* Logo PNG sin fondo */}
                <img 
                    src={grapeLogo} 
                    alt="Grape Logo"
                    style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    // Fondo transparente para PNG
                    backgroundColor: 'transparent'
                    }}
                />
                </Box>


                </motion.div>
                
                <Typography 
                  variant="h5" 
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
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 0.9
                  }}
                >
                  Sistema de Monitoreo de Impresoras
                </Typography>
              </Box>
            </motion.div>

            <form onSubmit={handleSubmit}>
              <motion.div variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#667eea',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'rgba(255,255,255,0.5)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#667eea',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'rgba(255,255,255,0.5)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ minWidth: 'auto', color: 'rgba(255,255,255,0.5)' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Ciudad
                  </InputLabel>
                  <Select
                    value={formData.ciudad}
                    onChange={handleChange('ciudad')}
                    label="Ciudad"
                    required
                    sx={{
                      color: 'white',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    }}
                    startAdornment={
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <LocationOn sx={{ color: 'rgba(255,255,255,0.5)' }} />
                      </InputAdornment>
                    }
                  >
                    {ciudades.map((ciudad) => (
                      <MenuItem key={ciudad} value={ciudad} sx={{ color: '#333' }}>
                        {ciudad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </motion.div>

              <motion.div variants={itemVariants}>
             
              <TextField
                fullWidth
                label="Empresa"
                value={formData.empresaId}
                onChange={handleChange('empresaId')}
                required
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: 'rgba(255,255,255,0.5)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
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
                    <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
                      {success}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7173feff 10%, #541888ff 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #541888ff 10%, #7173feff 100%)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      opacity: 0.6
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⏳
                    </motion.span>
                  ) : (
                    'Acceder al Sistema'
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants}>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  mb: 2 
                }}>
                  ¿No tienes cuenta?
                </Typography>
                
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => window.location.href = '/registro'}
                  sx={{
                    py: 1.2,
                    borderRadius: '12px',
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.05)',
                    mb: 1.5,
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.5)',
                      background: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Registrarme Gratis (7 días de Trial)
                </Button>
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => window.location.href = '/planes'}
                  sx={{
                    py: 1.2,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #00C853 0%, #64DD17 100%)',
                    color: 'white',
                    fontWeight: 700,
                    boxShadow: '0 4px 20px rgba(100, 221, 23, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #64DD17 0%, #00C853 100%)',
                      boxShadow: '0 6px 25px rgba(100, 221, 23, 0.5)',
                    }
                  }}
                >
                  Ver Planes de Pago
                </Button>
              </Box>
            </motion.div>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
}