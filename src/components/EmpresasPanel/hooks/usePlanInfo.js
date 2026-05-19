import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../constants';

export const usePlanInfo = () => {
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlanInfo = useCallback(async () => {
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/usuarios/${encodeURIComponent(email)}/plan-info`
      );

      if (!res.ok) {
        throw new Error('Error obteniendo info del plan');
      }

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'Respuesta inválida del servidor');
      }

      setPlanInfo(data);
      setError(null);
    } catch (err) {
      console.error('Error en usePlanInfo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar y refrescar cada 2 minutos
  useEffect(() => {
    fetchPlanInfo();
    const intervalo = setInterval(fetchPlanInfo, 2 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [fetchPlanInfo]);

  // Helpers derivados para usar en componentes
  const porcentajeUso = planInfo
    ? Math.min(100, Math.round((planInfo.impresorasActivas / planInfo.limiteImpresoras) * 100))
    : 0;

  const cercaDelLimite = porcentajeUso >= 80;
  const enLimite = !planInfo?.puedeAgregarMas;

  const enTrial = planInfo?.plan === 'trial';
  const trialPorExpirar = enTrial && planInfo?.diasRestantesTrial <= 7 && planInfo?.diasRestantesTrial > 0;
  const trialExpirado = planInfo?.trialExpirado === true;

  return {
    planInfo,
    loading,
    error,
    refetch: fetchPlanInfo,
    // Helpers derivados
    porcentajeUso,
    cercaDelLimite,
    enLimite,
    enTrial,
    trialPorExpirar,
    trialExpirado,
  };
};