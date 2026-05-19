import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Chip
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const PLAN_OPTIONS = [
  {
    nombre: 'Starter',
    precio: '$1,500',
    periodo: '/mes',
    impresoras: 50,
    color: '#8b5cf6',
    destacado: false,
    beneficios: [
      'Hasta 50 impresoras',
      'Monitoreo en tiempo real',
      'Reportes mensuales PDF',
      'Soporte por email',
    ]
  },
  {
    nombre: 'Pro',
    precio: '$4,000',
    periodo: '/mes',
    impresoras: 200,
    color: '#ec4899',
    destacado: true,
    beneficios: [
      'Hasta 200 impresoras',
      'Todo lo de Starter',
      'Soporte prioritario',
      'API access',
    ]
  },
  {
    nombre: 'Enterprise',
    precio: '$8,000',
    periodo: '/mes',
    impresoras: 500,
    color: '#06b6d4',
    destacado: false,
    beneficios: [
      'Hasta 500 impresoras',
      'Todo lo de Pro',
      'Onboarding dedicado',
      'SLA garantizado',
    ]
  }
];

const UpgradeModal = ({ open, onClose, planActual, impresorasActivas, limiteActual, motivo }) => {

  // Mensaje contextual según el motivo de apertura
  const getMensajeContexto = () => {
    if (motivo === 'limite_alcanzado') {
      return `Tu plan ${planActual} permite ${limiteActual} impresoras y actualmente tienes ${impresorasActivas} activas. Actualiza para agregar más.`;
    }
    if (motivo === 'agente_excedido') {
      return `El agente detectó una nueva impresora pero alcanzaste el límite de ${limiteActual} de tu plan ${planActual}. Actualiza para activarla.`;
    }
    return `Estás usando el plan ${planActual} con ${impresorasActivas} de ${limiteActual} impresoras. Conoce los demás planes disponibles.`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(15, 15, 20, 0.92)',
          backdropFilter: 'blur(24px)',
          color: 'white',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          overflow: 'visible',
        }
      }}
    >
      {/* Botón cerrar */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          color: 'rgba(255, 255, 255, 0.4)',
          '&:hover': {
            color: 'white',
            bgcolor: 'rgba(255, 255, 255, 0.05)'
          }
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogTitle sx={{
        textAlign: 'center',
        pt: 4,
        pb: 1,
      }}>
        <Box sx={{
          width: 56, height: 56,
          borderRadius: '14px',
          bgcolor: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}>
          <RocketLaunchIcon sx={{ color: '#8b5cf6', fontSize: '28px' }} />
        </Box>
        <Typography sx={{
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '22px',
          letterSpacing: '-0.02em',
        }}>
          Actualiza tu plan
        </Typography>
        <Typography sx={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px',
          mt: 1,
          maxWidth: 480,
          mx: 'auto',
          lineHeight: 1.5,
        }}>
          {getMensajeContexto()}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        {/* Cards de planes */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          mt: 2,
        }}>
          {PLAN_OPTIONS.map((plan) => (
            <Box
              key={plan.nombre}
              sx={{
                position: 'relative',
                p: 2.5,
                borderRadius: '14px',
                bgcolor: plan.destacado
                  ? 'rgba(236, 72, 153, 0.05)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: plan.destacado
                  ? `1px solid ${plan.color}`
                  : '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  borderColor: plan.color,
                  bgcolor: `${plan.color}10`,
                  boxShadow: `0 10px 30px ${plan.color}25`,
                }
              }}
            >
              {plan.destacado && (
                <Chip
                  label="Más popular"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: 12,
                    bgcolor: plan.color,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '10px',
                    height: 20,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                />
              )}

              <Typography sx={{
                color: plan.color,
                fontWeight: 700,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: 1,
              }}>
                {plan.nombre}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
                <Typography sx={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '26px',
                  letterSpacing: '-0.03em',
                }}>
                  {plan.precio}
                </Typography>
                <Typography sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '12px',
                }}>
                  MXN{plan.periodo}
                </Typography>
              </Box>

              <Typography sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px',
                mb: 2,
              }}>
                Hasta <Box component="span" sx={{ color: 'white', fontWeight: 600 }}>
                  {plan.impresoras}
                </Box> impresoras
              </Typography>

              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                mb: 2,
              }}>
                {plan.beneficios.map((beneficio, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                    }}
                  >
                    <CheckCircleIcon sx={{
                      color: plan.color,
                      fontSize: '14px',
                      opacity: 0.8
                    }} />
                    <Typography sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '12px',
                    }}>
                      {beneficio}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Button
                fullWidth
                onClick={() => {
                  // TODO: Conectar con Stripe Checkout cuando esté listo
                  window.open(`mailto:grapelabs-contact@proton.me?subject=Upgrade a plan ${plan.nombre}&body=Hola, quiero actualizar mi cuenta al plan ${plan.nombre}.`);
                }}
                sx={{
                  bgcolor: plan.destacado ? plan.color : 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderRadius: '10px',
                  py: 1,
                  boxShadow: 'none',
                  border: plan.destacado
                    ? 'none'
                    : `1px solid ${plan.color}40`,
                  '&:hover': {
                    bgcolor: plan.color,
                    filter: 'brightness(1.1)',
                    boxShadow: `0 0 20px ${plan.color}40`,
                  }
                }}
              >
                Elegir {plan.nombre}
              </Button>
            </Box>
          ))}
        </Box>

        {/* Mensaje de contacto */}
        <Typography sx={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '12px',
          mt: 3,
        }}>
          ¿Necesitas más de 500 impresoras? Contacta para plan Custom
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '13px',
            '&:hover': {
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          Quizás después
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpgradeModal;