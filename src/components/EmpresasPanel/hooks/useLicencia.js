import { useState, useEffect } from 'react';
import { API_BASE } from '../constants';

export const useLicencia = () => {
  const [licenciaInfo, setLicenciaInfo] = useState(null);

  const verificarLicencia = async () => {
    try {
      const empresaId = localStorage.getItem('empresaId');
      const ciudad = localStorage.getItem('ciudad');
      const email = localStorage.getItem('userEmail');

      if (!empresaId || !ciudad || !email) {
        console.log('❌ No hay credenciales, redirigiendo a login');
        window.location.href = '/login';
        return false;
      }

      const response = await fetch(
        `${API_BASE}/api/verificar-licencia/${empresaId}?ciudad=${ciudad}`
      );

      if (!response.ok) {
        throw new Error('Error al verificar licencia');
      }

      const licenciaData = await response.json();

      // SI NO PUEDE ACCEDER → REDIRIGIR
      if (!licenciaData.puedeAcceder) {
        let mensaje = '';
        let url = '/planes';

        if (licenciaData.datosLicencia.tipo === 'trial_expirado') {
          mensaje = `⏰ Tu trial expiró. Actualiza tu plan para continuar usando Grape Monitor.`;
          url = '/planes?expirado=true';
        } else if (licenciaData.datosLicencia.tipo === 'pendiente_pago') {
          mensaje = `💳 Tu plan ${licenciaData.usuario.plan.toUpperCase()} está pendiente de pago.`;
          url = `/planes?pendiente_pago=true&plan=${licenciaData.usuario.plan}`;
        } else {
          mensaje = '🚫 Tu licencia no es válida. Contacta a soporte.';
        }

        alert(mensaje);
        window.location.href = url;
        return false;
      }

      // Trial cerca de expirar
      if (
        licenciaData.datosLicencia.tipo === 'trial' &&
        licenciaData.datosLicencia.diasRestantes <= 3
      ) {
        console.log(
          `⚠️ Trial cerca de expirar: ${licenciaData.datosLicencia.diasRestantes} días restantes`
        );
      }

      console.log('✅ Licencia válida, plan:', licenciaData.usuario.plan);
      setLicenciaInfo(licenciaData.datosLicencia);

      return true;
    } catch (error) {
      console.error('❌ Error verificando licencia:', error);
      // No bloqueamos por error técnico
      return true;
    }
  };

  // Verificar al montar y cada 5 minutos
useEffect(() => {
    verificarLicencia();
    const intervalo = setInterval(verificarLicencia, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  return { licenciaInfo, verificarLicencia };
};