import React from 'react';
import { Box, Typography, LinearProgress, Tooltip } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const UsageBar = ({
  planInfo,
  porcentajeUso,
  cercaDelLimite,
  enLimite,
  trialPorExpirar,
  loading
}) => {
  if (loading || !planInfo) {
    return (
      <Box sx={{
        p: 2,
        borderBottom: '1px solid #f0f0f0',
      }}>
        <Box sx={{
          height: 4,
          bgcolor: '#f0f0f0',
          borderRadius: 2
        }} />
      </Box>
    );
  }

  // Determinar color de la barra según uso
  const getBarColor = () => {
    if (enLimite) return '#ef4444';
    if (cercaDelLimite) return '#f59e0b';
    return '#8b5cf6';
  };

  const barColor = getBarColor();
  const planLabel = planInfo.plan.charAt(0).toUpperCase() + planInfo.plan.slice(1);

  return (
    <Box sx={{
      p: 2,
      borderBottom: '1px solid #f0f0f0',
    }}>
      {/* Header: Plan + Contador */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <PrintIcon sx={{
            color: '#999999',
            fontSize: '16px'
          }} />
          <Typography sx={{
            color: '#999999',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {planLabel}
          </Typography>
        </Box>

        <Tooltip
          title={`${planInfo.impresorasActivas} activas de ${planInfo.limiteImpresoras} disponibles`}
          placement="left"
        >
          <Typography sx={{
            color: enLimite ? '#ef4444' : '#1a1a1a',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'monospace',
          }}>
            {planInfo.impresorasActivas}
            <Box component="span" sx={{ color: '#cccccc', mx: 0.3 }}>
              /
            </Box>
            {planInfo.limiteImpresoras >= 9999 ? '∞' : planInfo.limiteImpresoras}
          </Typography>
        </Tooltip>
      </Box>

      {/* Barra de progreso */}
      {planInfo.limiteImpresoras < 9999 && (
        <LinearProgress
          variant="determinate"
          value={porcentajeUso}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: '#f0f0f0',
            '& .MuiLinearProgress-bar': {
              bgcolor: barColor,
              borderRadius: 2,
              transition: 'all 0.4s ease',
            }
          }}
        />
      )}

      {/* Gradiente para planes ilimitados */}
      {planInfo.limiteImpresoras >= 9999 && (
        <Box sx={{
          height: 4,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #8b5cf6 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '200% 0' },
            '100%': { backgroundPosition: '-200% 0' },
          }
        }} />
      )}

      {/* Mensaje contextual */}
      {enLimite && (
        <Typography sx={{
          color: '#ef4444',
          fontSize: '11px',
          fontWeight: 500,
          mt: 0.75,
        }}>
          Límite alcanzado
        </Typography>
      )}

      {cercaDelLimite && !enLimite && (
        <Typography sx={{
          color: '#f59e0b',
          fontSize: '11px',
          fontWeight: 500,
          mt: 0.75,
        }}>
          Cerca del límite
        </Typography>
      )}

      {/* Banner trial por expirar (≤7 días) */}
      {trialPorExpirar && (
        <Box sx={{
          mt: 1.5,
          p: 1.25,
          borderRadius: '8px',
          bgcolor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <AccessTimeIcon sx={{
            color: '#f59e0b',
            fontSize: '16px'
          }} />
          <Typography sx={{
            color: '#92400e',
            fontSize: '11px',
            fontWeight: 600,
            lineHeight: 1.3,
          }}>
            Trial expira en {planInfo.diasRestantesTrial} {planInfo.diasRestantesTrial === 1 ? 'día' : 'días'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UsageBar;