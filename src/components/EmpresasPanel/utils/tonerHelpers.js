import { STALE_MS } from '../constants';

// Calcula porcentaje de tóner
export const tonerPercent = (lvl, max) => {
  if (!max || max <= 0) return 0;
  const p = Math.round((Number(lvl) / Number(max)) * 100);
  return Math.max(0, Math.min(100, p));
};

// Calcula si una impresora está online basado en su última lectura
export const computeDerivedOnline = (latest, now = Date.now()) => {
  if (!latest || !latest.lastSeenAt) return false;
  if (latest.online === false) return false;

  const lastSeen = new Date(latest.lastSeenAt).getTime();
  const age = now - lastSeen;

  return age <= STALE_MS;
};

// Determina online con lógica de "hold" (gracia)
export const isOnlineUI = (p, nowTs = Date.now()) => {
  const latest = p.latest || {};
  if (latest.online === false) return false;
  if ((p._holdUntil || 0) > nowTs) return true;
  if (!p._lastSeenAt) return false;
  const age = nowTs - new Date(p._lastSeenAt).getTime();
  return age <= STALE_MS;
};

// Asigna color único por empresa según su posición en la lista
export const getColorForEmpresa = (empresaId, empresas, colors) => {
  const index = empresas.findIndex(e => e._id === empresaId);
  return colors[index % colors.length] || '#fe5953';
};