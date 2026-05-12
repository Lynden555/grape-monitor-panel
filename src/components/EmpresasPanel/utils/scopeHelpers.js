// Obtiene el scope (empresa padre + ciudad) desde localStorage
export const getScope = () => ({
  empresaId: localStorage.getItem('empresaId') || '',
  ciudad: localStorage.getItem('ciudad') || '',
});

// Limpia credenciales y redirige a login
export const handleLogout = () => {
  localStorage.removeItem('empresaId');
  localStorage.removeItem('ciudad');
  localStorage.removeItem('userEmail');
  window.location.href = '/login';
};