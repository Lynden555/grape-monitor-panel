export const API_BASE = 'https://grape-monitor-production.up.railway.app';

export const FolderType = {
  ROOT: 'root',
  FOLDER: 'folder'
};

export const STALE_MS = 2 * 60 * 1000;
export const GRACE_MS = 60 * 1000;

export const generateId = () =>
  `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Colores únicos para empresas
export const EMPRESA_COLORS = [
  '#fe5953', '#4f46de', '#00c853', '#ffb74d',
  '#9c27b0', '#2196f3', '#ff9800', '#4caf50',
  '#e91e63', '#3f51b5', '#ff5722', '#009688'
];