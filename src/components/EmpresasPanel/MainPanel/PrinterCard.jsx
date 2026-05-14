import React from 'react';
import {
  Box, Typography, Stack, Divider, Chip, Tooltip, IconButton,
  ListItemButton, Button, LinearProgress
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { tonerPercent } from '../utils/tonerHelpers';

const PrinterCard = ({
  printer,
  isExpanded,
  onToggleExpand,
  onContextMenu,
  onConfirmarCorte,
  onGenerarPDF,
  generandoCorte,
  generandoPDF,
}) => {
  const latest = printer.latest || {};
  const low = !!latest.lowToner;
  const online = (typeof printer.online === 'boolean')
    ? printer.online
    : (latest.derivedOnline ?? (latest.online !== false));

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: '12px',
        border: isExpanded
          ? '1px solid rgba(139, 92, 246, 0.3)'
          : '1px solid #f0f0f0',
        bgcolor: isExpanded
          ? 'rgba(139, 92, 246, 0.03)'
          : '#ffffff',
        transition: 'all 0.2s',
      }}
    >
      <ListItemButton
        onClick={() => onToggleExpand(printer._id)}
        onContextMenu={(e) => onContextMenu(e, printer)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          position: 'relative',
          color: '#1a1a1a',
          borderRadius: '8px',
          '&:hover': {
            bgcolor: '#f8f8f8',
            '& .printer-actions': { opacity: 1 }
          }
        }}
      >
        <PrintIcon sx={{ color: '#8b5cf6' }} />
        <Typography sx={{ fontWeight: 800, color: '#1a1a1a' }}>
          {printer.displayName || printer.customName || printer.printerName || printer.sysName || printer.host}
        </Typography>

        <Chip
          label={online ? 'Online' : 'Offline'}
          size="small"
          sx={{
            ml: 1,
            fontWeight: 700,
            borderRadius: '20px',
            ...(online
              ? {
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  bgcolor: '#f0fdf4',
                }
              : {
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  bgcolor: '#fef2f2',
                })
          }}
        />

        {low && (
          <Tooltip title="Tóner bajo">
            <WarningAmberIcon sx={{ color: '#b45309', ml: 0.5, fontSize: 20 }} />
          </Tooltip>
        )}

        <IconButton
          size="small"
          className="printer-actions"
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, printer);
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

        <Box sx={{ flex: 1 }} />
        <Typography sx={{ color: '#999', fontSize: '0.85rem' }}>{printer.host}</Typography>
      </ListItemButton>

      {isExpanded && (
        <>
          <Divider sx={{ my: 1, borderColor: '#f0f0f0' }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

            {/* Columna izquierda: Info */}
            <Box>
              <Typography sx={{ color: '#999', fontSize: '12px' }}>Serial</Typography>
              <Typography sx={{ fontFamily: 'monospace', color: '#1a1a1a', fontWeight: 700 }}>
                {printer.serial || '—'}
              </Typography>

              <Typography sx={{ color: '#999', fontSize: '12px', mt: 1 }}>Modelo</Typography>
              <Typography sx={{ fontFamily: 'monospace', color: '#1a1a1a', fontWeight: 700 }}>
                {printer.model || printer.sysDescr || '—'}
              </Typography>

              <Typography sx={{ color: '#999', fontSize: '12px', mt: 1 }}>Última lectura</Typography>
              <Typography sx={{ fontFamily: 'monospace', color: '#1a1a1a', fontWeight: 700 }}>
                {latest.lastSeenAt ? new Date(latest.lastSeenAt).toLocaleString() : '—'}
              </Typography>

              <Typography sx={{ color: '#999', fontSize: '12px', mt: 1 }}>Contador de páginas</Typography>
              <Typography sx={{ fontWeight: 800, color: '#1a1a1a', fontSize: '16px' }}>
                {latest.lastPageCount ?? '—'}
              </Typography>

              <Typography sx={{ color: '#999', fontSize: '12px', mt: 1 }}>Contador B/N</Typography>
              <Typography sx={{ fontWeight: 800, color: '#1a1a1a' }}>
                {latest.lastPageMono ?? '—'}
              </Typography>

              {latest.lastPageColor != null && latest.lastPageColor > 0 && (
                <>
                  <Typography sx={{ color: '#999', fontSize: '12px', mt: 1 }}>Contador Color</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#1a1a1a' }}>
                    {latest.lastPageColor}
                  </Typography>
                </>
              )}
            </Box>

            {/* Columna derecha */}
            <Box>
              {/* Reportes */}
              <Box sx={{
                p: 2,
                border: '1px solid #f0f0f0',
                borderRadius: '10px',
                bgcolor: '#fafafa',
                mb: 2,
              }}>
                <Typography sx={{
                  color: '#999',
                  fontWeight: 700,
                  mb: 1.5,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}>
                  📊 Reportes mensuales
                </Typography>

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onConfirmarCorte(printer._id)}
                    disabled={generandoCorte === printer._id}
                    startIcon={generandoCorte === printer._id ? null : <>📅</>}
                    sx={{
                      bgcolor: '#1a1a1a',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderRadius: '8px',
                      px: 2, py: 1,
                      minWidth: '140px',
                      boxShadow: 'none',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#0a0a0a',
                        boxShadow: 'none',
                      },
                      '&:disabled': {
                        bgcolor: '#f3f3f3',
                        color: '#ccc',
                      }
                    }}
                  >
                    {generandoCorte === printer._id ? '⌛ Registrando...' : 'Registrar Corte'}
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onGenerarPDF(printer._id)}
                    disabled={generandoPDF === printer._id}
                    startIcon={generandoPDF === printer._id ? null : <>📄</>}
                    sx={{
                      borderColor: 'rgba(139, 92, 246, 0.35)',
                      color: '#8b5cf6',
                      fontWeight: 700,
                      borderRadius: '8px',
                      px: 2, py: 1,
                      minWidth: '140px',
                      boxShadow: 'none',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'rgba(139, 92, 246, 0.05)',
                        borderColor: '#8b5cf6',
                        boxShadow: 'none',
                      },
                      '&:disabled': {
                        opacity: 0.5,
                      }
                    }}
                  >
                    {generandoPDF === printer._id ? '⌛ Generando...' : 'Generar PDF'}
                  </Button>
                </Stack>

                <Typography sx={{ color: '#999', fontSize: '12px', mt: 1 }}>
                  Primero registra un corte, luego genera el reporte PDF
                </Typography>

                <Typography sx={{ color: '#999', fontSize: '12px', mt: 0.5 }}>
                  {latest.lastCutDate
                    ? `Último corte: ${new Date(latest.lastCutDate).toLocaleDateString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}`
                    : 'Aún no se ha registrado ningún corte'
                  }
                </Typography>
              </Box>

              {/* Consumibles */}
              <Typography sx={{ color: '#999', fontSize: '12px', mb: 1 }}>Consumibles</Typography>
              <Stack spacing={1}>
                {(latest.lastSupplies || []).map((s, idx) => {
                  const pct = tonerPercent(s.level, s.max);
                  const isLow = isFinite(pct) && pct <= 20;
                  return (
                    <Box key={idx}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '13px', color: '#1a1a1a' }}>
                          {s.name || `Supply ${idx + 1}`}
                        </Typography>
                        <Typography sx={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: isLow ? '#dc2626' : '#16a34a'
                        }}>
                          {isFinite(pct) ? `${pct}%` : '—'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={isFinite(pct) ? pct : 0}
                        sx={{
                          height: 6,
                          borderRadius: 6,
                          bgcolor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: isLow ? '#dc2626' : '#8b5cf6',
                            transition: 'width .3s'
                          }
                        }}
                      />
                    </Box>
                  );
                })}
                {(!latest.lastSupplies || latest.lastSupplies.length === 0) && (
                  <Typography sx={{ color: '#999', fontSize: '13px' }}>
                    Sin datos de tóner.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default PrinterCard;