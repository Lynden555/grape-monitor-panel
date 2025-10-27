import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Monitor from './components/monitor';
import './App.css';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const empresaId = localStorage.getItem('empresaId');
  const ciudad = localStorage.getItem('ciudad');
  
  if (!empresaId || !ciudad) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente para rutas públicas
const PublicRoute = ({ children }) => {
  const empresaId = localStorage.getItem('empresaId');
  const ciudad = localStorage.getItem('ciudad');
  
  if (empresaId && ciudad) {
    return <Navigate to="/monitor" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/registro" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/monitor" element={
          <ProtectedRoute>
            <Monitor />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;