import { API_BASE } from '../constants';

// Copia texto al portapapeles
export const copyToClipboard = async (txt) => {
  try {
    await navigator.clipboard.writeText(txt);
    return { ok: true, message: 'Copiado al portapapeles' };
  } catch {
    return { ok: false, message: 'No se pudo copiar' };
  }
};

// Descarga un archivo de texto genérico
export const downloadFile = (filename, content) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Genera y descarga el archivo .env de configuración del agente
export const downloadEnv = (empresa) => {
  if (!empresa) return;
  const env = [
    `API_URL=${API_BASE}/api/metrics/impresoras`,
    `SITE_API_KEY=${empresa.apiKey}`,
    `EMPRESA_ID=${empresa.empresaId}`,
    `SNMP_COMMUNITY=public`,
    `INTERVAL_MS=300000`,
    `AGENT_VERSION=1.0.0`,
  ].join('\n');
  downloadFile(`${empresa.nombre.replace(/\s+/g, '_')}.env`, env + '\n');
};

// Genera y descarga el config.json del agente
export const downloadConfig = (empresa) => {
  if (!empresa) return;
  const cfg = {
    apiUrl: `${API_BASE}/api/metrics/impresoras`,
    siteApiKey: empresa.apiKey,
    empresaId: empresa.empresaId,
    community: 'public',
    intervalMs: 300000,
    printers: []
  };
  downloadFile(
    `config_${empresa.nombre.replace(/\s+/g, '_')}.json`,
    JSON.stringify(cfg, null, 2)
  );
};