import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import grapeLogo from './images/grape.png';

const API_BASE = 'https://grape-monitor-production.up.railway.app';

/* ── floating bubble (consistent with Login/Planes) ── */
const Bubble = ({ size, top, left, right, bottom, delay, opacity = 0.06, color = 'rgba(139,92,246,' }) => (
  <motion.div
    style={{
      position: 'absolute', width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, ${color}${opacity}) 0%, transparent 70%)`,
      top, left, right, bottom, pointerEvents: 'none',
    }}
    animate={{ y: [0, -15, 0], scale: [1, 1.08, 1] }}
    transition={{ duration: 7, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ── SVG icons ── */
const Icons = {
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  lock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  eye: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>,
  pin: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  building: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>,
  check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  arrowRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  rocket: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
};

/* ── input component ── */
const InputField = ({ icon, label, type = 'text', value, onChange, endIcon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#999', marginBottom: 8,
      }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: focused ? '#f8f8f8' : '#f3f3f3',
        border: `1.5px solid ${focused ? '#8b5cf6' : '#e8e8e8'}`,
        borderRadius: 12, padding: '0 16px', transition: 'all 0.3s ease',
      }}>
        <span style={{ color: focused ? '#8b5cf6' : '#bbb', fontSize: 18, display: 'flex', transition: 'color 0.3s' }}>{icon}</span>
        <input
          type={type} value={value} onChange={onChange} required
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#1a1a1a', fontSize: 15, padding: '13px 0',
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        {endIcon && <span style={{ cursor: 'pointer', color: '#bbb', display: 'flex', fontSize: 18 }}>{endIcon}</span>}
      </div>
    </div>
  );
};

/* ── select component ── */
const SelectField = ({ icon, label, value, onChange, options }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#999', marginBottom: 8,
      }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: focused ? '#f8f8f8' : '#f3f3f3',
        border: `1.5px solid ${focused ? '#8b5cf6' : '#e8e8e8'}`,
        borderRadius: 12, padding: '0 16px', transition: 'all 0.3s ease',
      }}>
        <span style={{ color: focused ? '#8b5cf6' : '#bbb', fontSize: 18, display: 'flex', transition: 'color 0.3s' }}>{icon}</span>
        <select
          value={value} onChange={onChange} required
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: value ? '#1a1a1a' : '#aaa', fontSize: 15, padding: '13px 0',
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
            WebkitAppearance: 'none', MozAppearance: 'none',
          }}
        >
          <option value="" disabled style={{ background: '#fff', color: '#aaa' }}>Seleccionar...</option>
          {options.map(opt => (
            <option key={opt} value={opt} style={{ background: '#fff', color: '#1a1a1a' }}>{opt}</option>
          ))}
        </select>
        <span style={{ color: '#bbb', fontSize: 10 }}>▼</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function Register() {
  const urlParams = new URLSearchParams(window.location.search);
  const planFromUrl = urlParams.get('plan');

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    ciudad: '', empresaId: '',
    planSeleccionado: planFromUrl,
  });

  const ciudades = ['Mexicali', 'Tijuana', 'Ensenada', 'Rosarito', 'Tecate'];
  const steps = ['Credenciales', 'Empresa', 'Confirmar'];

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.email || !formData.password || !formData.confirmPassword) { setError('Todos los campos son obligatorios'); return; }
      if (!/\S+@\S+\.\S+/.test(formData.email)) { setError('Email no válido'); return; }
      if (formData.password !== formData.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
      if (formData.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    }
    if (activeStep === 1) {
      if (!formData.empresaId || !formData.ciudad) { setError('ID de empresa y ciudad son obligatorios'); return; }
      if (formData.empresaId.length < 2) { setError('El ID de empresa debe tener al menos 2 caracteres'); return; }
    }
    setError('');
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => { setError(''); setActiveStep(prev => prev - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const diasTrial = formData.planSeleccionado ? 3 : 7;
      const response = await fetch(`${API_BASE}/api/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email, password: formData.password,
          ciudad: formData.ciudad, empresaId: formData.empresaId,
          plan: formData.planSeleccionado || 'trial', diasTrial,
        })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('empresaId', data.empresaId);
        localStorage.setItem('ciudad', formData.ciudad);
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('plan', formData.planSeleccionado || 'trial');
        if (!formData.planSeleccionado) {
          setSuccess('¡Registro exitoso! Tienes 7 días de trial gratis. Redirigiendo...');
          setTimeout(() => { window.location.href = '/#/monitor'; }, 2000);
        } else {
          setSuccess(`¡Registro exitoso! Tienes ${diasTrial} días de trial. Ahora procede al pago.`);
          setTimeout(() => {
            alert(`[TEMPORAL] Aquí iría Stripe Checkout para el plan ${formData.planSeleccionado}`);
            window.location.href = '/#/monitor';
          }, 3000);
        }
      } else {
        throw new Error(data.error || 'Error en el registro');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const getPlanLabel = () => {
    if (formData.planSeleccionado === 'starter') return 'Starter · $99/mes';
    if (formData.planSeleccionado === 'premium') return 'Premium · $149/mes';
    return 'Trial Gratis · 7 días';
  };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />

      <div style={{
        minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── LEFT: dark branding panel ── */}
        <div className="left-panel" style={{
          flex: 1, background: '#0a0a0a', position: 'relative', display: 'flex',
          flexDirection: 'column', justifyContent: 'center', padding: '60px 70px',
          overflow: 'hidden',
        }}>
          <Bubble size={300} top="-5%" left="60%" delay={0} opacity={0.06} />
          <Bubble size={180} top="30%" left="70%" delay={1.5} opacity={0.05} />
          <Bubble size={220} top="65%" left="55%" delay={3} opacity={0.07} />
          <Bubble size={120} top="15%" left="20%" delay={2} opacity={0.04} color="rgba(255,255,255," />

          <div style={{ position: 'relative', zIndex: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}
            >
              <img src={grapeLogo} alt="Grape" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Crear cuenta
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 700,
                color: '#fff', lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-0.03em',
              }}
            >
              Únete a<br />Grape Monitor
              <span style={{ color: '#8b5cf6' }}>.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, maxWidth: 300, margin: 0 }}>
              Configura tu cuenta en menos de un minuto y comienza a monitorear tus impresoras.
            </motion.p>

            {/* plan badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              style={{
                marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 12, padding: '12px 20px',
              }}
            >
              <span style={{ color: '#8b5cf6', display: 'flex' }}>{Icons.rocket}</span>
              <span style={{ fontSize: 14, color: '#a78bfa', fontWeight: 600 }}>{getPlanLabel()}</span>
            </motion.div>

            {/* step indicators on left */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
              style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                    transition: 'all 0.3s ease',
                    background: i < activeStep ? '#22c55e' : i === activeStep ? '#8b5cf6' : 'rgba(255,255,255,0.06)',
                    color: i <= activeStep ? '#fff' : 'rgba(255,255,255,0.25)',
                    border: i === activeStep ? '2px solid rgba(139,92,246,0.4)' : '2px solid transparent',
                  }}>
                    {i < activeStep ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: 14, fontWeight: i === activeStep ? 600 : 400,
                    color: i === activeStep ? '#fff' : 'rgba(255,255,255,0.25)',
                    transition: 'all 0.3s ease',
                  }}>
                    {step}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* bottom */}
          <div style={{
            position: 'absolute', bottom: 36, left: 70,
            display: 'flex', alignItems: 'center', gap: 8, zIndex: 3,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Sistema operativo</span>
          </div>
        </div>

        {/* ── RIGHT: white form panel ── */}
        <div style={{
          flex: 1, background: '#ffffff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 32,
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 2 }}>

            {/* progress bar */}
            <div style={{
              width: '100%', height: 3, background: '#f0f0f0', borderRadius: 2, marginBottom: 36,
              overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{ height: '100%', background: '#8b5cf6', borderRadius: 2 }}
              />
            </div>

            {/* step title */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{
                fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {activeStep === 0 && 'Tus credenciales'}
                {activeStep === 1 && 'Datos de empresa'}
                {activeStep === 2 && 'Confirmar registro'}
              </h2>
              <p style={{ fontSize: 14, color: '#999', margin: 0 }}>
                {activeStep === 0 && 'Email y contraseña para tu cuenta'}
                {activeStep === 1 && 'Información de tu empresa'}
                {activeStep === 2 && 'Revisa tus datos antes de continuar'}
              </p>
            </div>

            {/* form steps with slide animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* STEP 0: credentials */}
                {activeStep === 0 && (
                  <div>
                    <InputField icon={Icons.mail} label="Email" type="email" value={formData.email} onChange={handleChange('email')} />
                    <InputField
                      icon={Icons.lock} label="Contraseña"
                      type={showPw1 ? 'text' : 'password'}
                      value={formData.password} onChange={handleChange('password')}
                      endIcon={<span onClick={() => setShowPw1(!showPw1)}>{showPw1 ? Icons.eyeOff : Icons.eye}</span>}
                    />
                    <InputField
                      icon={Icons.lock} label="Confirmar contraseña"
                      type={showPw2 ? 'text' : 'password'}
                      value={formData.confirmPassword} onChange={handleChange('confirmPassword')}
                      endIcon={<span onClick={() => setShowPw2(!showPw2)}>{showPw2 ? Icons.eyeOff : Icons.eye}</span>}
                    />
                  </div>
                )}

                {/* STEP 1: empresa */}
                {activeStep === 1 && (
                  <div>
                    <InputField icon={Icons.building} label="ID de Empresa" value={formData.empresaId} onChange={handleChange('empresaId')} />
                    <SelectField icon={Icons.pin} label="Ciudad" value={formData.ciudad} onChange={handleChange('ciudad')} options={ciudades} />
                  </div>
                )}

                {/* STEP 2: confirmation */}
                {activeStep === 2 && (
                  <div>
                    {/* plan card */}
                    <div style={{
                      background: '#f9fafb', border: '1.5px solid #e8e8e8', borderRadius: 14,
                      padding: 20, marginBottom: 16,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                        Plan seleccionado
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {formData.planSeleccionado ? formData.planSeleccionado.charAt(0).toUpperCase() + formData.planSeleccionado.slice(1) : 'Trial Gratis'}
                        </span>
                        <span style={{
                          fontSize: 13, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
                          background: formData.planSeleccionado ? '#f5f3ff' : '#f0fdf4',
                          color: formData.planSeleccionado ? '#7c3aed' : '#16a34a',
                        }}>
                          {formData.planSeleccionado === 'starter' ? '$99/mes' : formData.planSeleccionado === 'premium' ? '$149/mes' : '7 días gratis'}
                        </span>
                      </div>
                    </div>

                    {/* summary */}
                    <div style={{
                      background: '#f9fafb', border: '1.5px solid #e8e8e8', borderRadius: 14,
                      padding: 20, marginBottom: 16,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                        Resumen
                      </div>
                      {[
                        { label: 'Email', value: formData.email },
                        { label: 'Empresa', value: formData.empresaId },
                        { label: 'Ciudad', value: formData.ciudad },
                      ].map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none',
                        }}>
                          <span style={{ fontSize: 13, color: '#999' }}>{item.label}</span>
                          <span style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* info note */}
                    <div style={{
                      padding: '12px 16px', borderRadius: 10,
                      background: formData.planSeleccionado ? '#fffbeb' : '#f0f9ff',
                      border: `1px solid ${formData.planSeleccionado ? '#fde68a' : '#bae6fd'}`,
                      fontSize: 13, color: formData.planSeleccionado ? '#92400e' : '#0369a1',
                      lineHeight: 1.5,
                    }}>
                      {formData.planSeleccionado
                        ? 'Después del registro tendrás 3 días de trial. Completa el pago para activar tu licencia completa.'
                        : 'Tendrás acceso completo por 7 días. Después puedes actualizar a un plan de pago.'}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* alerts */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{
                    padding: '12px 16px', borderRadius: 10, marginTop: 16,
                    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13,
                  }}>
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{
                    padding: '12px 16px', borderRadius: 10, marginTop: 16,
                    background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 13,
                  }}>
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* navigation buttons */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28,
            }}>
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: activeStep === 0 ? 'default' : 'pointer',
                  color: activeStep === 0 ? '#ddd' : '#888', fontSize: 14, fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s',
                  padding: '10px 0',
                }}
              >
                {Icons.arrowLeft} Atrás
              </button>

              <motion.button
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                disabled={loading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 12, border: 'none',
                  background: activeStep === steps.length - 1 ? '#0a0a0a' : '#8b5cf6',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: loading ? 0.5 : 1, transition: 'all 0.2s ease',
                }}
              >
                {loading ? 'Procesando...' :
                  activeStep === steps.length - 1
                    ? (formData.planSeleccionado ? 'Registrar y pagar' : 'Completar registro')
                    : 'Siguiente'}
                {!loading && activeStep < steps.length - 1 && Icons.arrowRight}
              </motion.button>
            </div>

            {/* bottom links */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              {formData.planSeleccionado ? (
                <span style={{ fontSize: 13, color: '#999' }}>
                  ¿Cambiar plan?{' '}
                  <a href="/planes" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>Ver planes</a>
                </span>
              ) : (
                <span style={{ fontSize: 13, color: '#999' }}>
                  ¿Ya tienes cuenta?{' '}
                  <a href="/login" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>Iniciar sesión</a>
                </span>
              )}
            </div>

            {/* footer */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <span style={{ fontSize: 11, color: '#ccc' }}>© {new Date().getFullYear()} GrapeLabs · grapelabs.org</span>
            </div>
          </div>
        </div>

        {/* responsive */}
        <style>{`
          @media (max-width: 900px) {
            .left-panel { display: none !important; }
          }
        `}</style>
      </div>
    </>
  );
}