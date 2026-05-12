import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import grapeLogo from './images/grape.png';

const API_BASE = 'https://grape-monitor-production.up.railway.app';

/* ── wavy divider SVG: black spilling into white ── */
const WavyDivider = () => (
  <div style={{
    position: 'absolute', top: -40, bottom: 0, left: 'calc(50% - 200px)',
    width: 300,  zIndex: 2, pointerEvents: 'none',
  }}>
    <svg
      viewBox="0 0 200 1000"
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%' }}
    >
      <path
        d="M0,0 L20,0 
C110,60 160,130 130,220 
           C70,320 170,380 140,480 
           C80,580 175,640 135,740 
           C85,840 165,900 120,1000
           L60,1000 L0,1000 Z"
        fill="#0a0a0a"
      />
    </svg>
  </div>
);

/* ── floating bubble circles ── */
const Bubble = ({ size, top, left, delay, opacity = 0.06, color = 'rgba(139,92,246,' }) => (
  <motion.div
    style={{
      position: 'absolute', width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, ${color}${opacity}) 0%, transparent 70%)`,
      top, left, pointerEvents: 'none',
    }}
    animate={{ y: [0, -15, 0], scale: [1, 1.08, 1] }}
    transition={{ duration: 7, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ── reusable input (dark text on white bg) ── */
const InputField = ({ icon, label, type = 'text', value, onChange, endIcon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#999', marginBottom: 8,
      }}>
        {label}
      </label>
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
            color: '#1a1a1a', fontSize: 15, padding: '14px 0',
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        {endIcon && <span style={{ cursor: 'pointer', color: '#bbb', display: 'flex', fontSize: 18 }}>{endIcon}</span>}
      </div>
    </div>
  );
};

/* ── select field (dark text on white bg) ── */
const SelectField = ({ icon, label, value, onChange, options }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#999', marginBottom: 8,
      }}>
        {label}
      </label>
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
            color: value ? '#1a1a1a' : '#aaa', fontSize: 15, padding: '14px 0',
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

/* ── SVG icons ── */
const Icons = {
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  lock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  eye: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  eyeOff: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  ),
  pin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  building: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
  ),
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '', ciudad: '', empresaId: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const ciudades = ['Mexicali', 'Tijuana', 'Ensenada', 'Rosarito', 'Tecate'];

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('¡Login exitoso! Redirigiendo...');
        localStorage.setItem('empresaId', data.empresaId);
        localStorage.setItem('ciudad', formData.ciudad);
        localStorage.setItem('userEmail', formData.email);
        if (data.licencia) {
          localStorage.setItem('plan', data.licencia.plan);
          localStorage.setItem('licenciaTrial', data.licencia.licenciaTrial);
          localStorage.setItem('diasRestantesTrial', data.licencia.diasRestantesTrial);
        }
        setTimeout(() => { window.location.href = '/monitor'; }, 1000);
      } else {
        if (data.codigo === 'TRIAL_EXPIRADO') {
          setError(`${data.error} Actualiza tu plan para continuar.`);
          setTimeout(() => { window.location.href = '/planes?expirado=true'; }, 2000);
        } else if (data.codigo === 'PENDIENTE_PAGO') {
          setError(`${data.error} Serás redirigido para completar el pago.`);
          setTimeout(() => { window.location.href = '/planes?pendiente_pago=true'; }, 2000);
        } else if (data.codigo === 'LICENCIA_EXPIRADA') {
          setError(`${data.error} Serás redirigido para renovar.`);
          setTimeout(() => { window.location.href = '/planes?renovar=true'; }, 2000);
        } else {
          throw new Error(data.error || 'Error en el login');
        }
      }
    } catch (err) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } }
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />

      <div style={{
        minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── LEFT PANEL: BLACK with branding ── */}
        <div className="left-panel" style={{
          flex: 1, background: '#0a0a0a', position: 'relative', display: 'flex',
          flexDirection: 'column', justifyContent: 'center', padding: '60px 70px',
          overflow: 'hidden',
        }}>
          {/* bubbles on dark side */}
          <Bubble size={300} top="-5%" left="60%" delay={0} opacity={0.06} />
          <Bubble size={180} top="30%" left="70%" delay={1.5} opacity={0.05} />
          <Bubble size={220} top="65%" left="55%" delay={3} opacity={0.07} />
          <Bubble size={120} top="15%" left="20%" delay={2} opacity={0.04} color="rgba(255,255,255," />
          <Bubble size={160} top="80%" left="10%" delay={4} opacity={0.03} color="rgba(255,255,255," />
          <Bubble size={80} top="45%" left="80%" delay={1} opacity={0.09} />
          <Bubble size={60} top="10%" left="45%" delay={3.5} opacity={0.04} color="rgba(255,255,255," />

          {/* content */}
          <div style={{ position: 'relative', zIndex: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}
            >
              <img src={grapeLogo} alt="Grape" style={{ width: 100, height: 100, objectFit: 'contain' }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              style={{ marginBottom: 20 }}
            >
              <span style={{
                fontSize: 13, fontWeight: 500, color: '#8b5cf6',
                textTransform: 'uppercase', letterSpacing: '0.2em',
              }}>
                Bienvenido a
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 56, fontWeight: 700, color: '#fff',
                lineHeight: 1.05, margin: '0 0 24px', letterSpacing: '-0.03em',
              }}
            >
              Grape<br />Monitor
              <span style={{ color: '#8b5cf6' }}>.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                fontSize: 15, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8,
                maxWidth: 320, margin: 0,
              }}
            >
              Sistema inteligente de monitoreo para tus impresoras. Controla tóner, copias y estado desde un solo lugar.
            </motion.p>

            {/* stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              style={{
                display: 'flex', gap: 32, marginTop: 48,
                padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {[
                { num: '99.9%', label: 'Uptime' },
                { num: '24/7', label: 'Monitoreo' },
                { num: '5min', label: 'Refresh' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* bottom indicator */}
          <div style={{
            position: 'absolute', bottom: 36, left: 70,
            display: 'flex', alignItems: 'center', gap: 8, zIndex: 3,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Sistema operativo</span>
          </div>
        </div>

        {/* ── WAVY DIVIDER: black spilling over white ── */}
        <div className="wavy-divider">
          <WavyDivider />
        </div>

        {/* ── RIGHT PANEL: WHITE with form ── */}
        <div style={{
          flex: 1.5, background: '#ffffff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 32,
          position: 'relative', zIndex: 0,
        }}>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 2 }}
          >
            {/* header */}
            <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 26, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                Iniciar sesión
              </h2>
              <p style={{ fontSize: 14, color: '#999', margin: 0 }}>
                Ingresa tus credenciales para continuar
              </p>
            </motion.div>

            {/* form */}
            <form onSubmit={handleSubmit}>
              <motion.div variants={fadeUp}>
                <InputField icon={Icons.mail} label="Email" type="email" value={formData.email} onChange={handleChange('email')} />
              </motion.div>

              <motion.div variants={fadeUp}>
                <InputField
                  icon={Icons.lock} label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange('password')}
                  endIcon={
                    <span onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? Icons.eyeOff : Icons.eye}
                    </span>
                  }
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <SelectField icon={Icons.pin} label="Ciudad" value={formData.ciudad} onChange={handleChange('ciudad')} options={ciudades} />
              </motion.div>

              <motion.div variants={fadeUp}>
                <InputField icon={Icons.building} label="Empresa ID" value={formData.empresaId} onChange={handleChange('empresaId')} />
              </motion.div>

              {/* alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    style={{
                      padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                      background: '#fef2f2', border: '1px solid #fecaca',
                      color: '#dc2626', fontSize: 13,
                    }}
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    style={{
                      padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                      background: '#f0fdf4', border: '1px solid #bbf7d0',
                      color: '#16a34a', fontSize: 13,
                    }}
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* submit - black button on white bg */}
              <motion.div variants={fadeUp}>
                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '15px 0', border: 'none', borderRadius: 12,
                    background: '#0a0a0a', color: '#fff',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    opacity: loading ? 0.5 : 1, transition: 'all 0.2s ease',
                  }}
                >
                  {loading ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'inline-block' }}
                    >⏳</motion.span>
                  ) : 'Acceder'}
                </motion.button>
              </motion.div>
            </form>

            {/* divider */}
            <motion.div variants={fadeUp} style={{
              display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: '#eee' }} />
              <span style={{ fontSize: 11, color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.12em' }}>o</span>
              <div style={{ flex: 1, height: 1, background: '#eee' }} />
            </motion.div>

            {/* secondary actions */}
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => window.location.href = '/registro'}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12,
                  background: 'transparent', border: '1.5px solid #e5e5e5',
                  color: '#888', fontSize: 13, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#ccc'; e.target.style.color = '#333'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#e5e5e5'; e.target.style.color = '#888'; }}
              >
                Registrarme gratis
              </button>
              <button
                onClick={() => window.location.href = '/planes'}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12,
                  background: '#f5f3ff', border: '1.5px solid #e9e5ff',
                  color: '#7c3aed', fontSize: 13, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.target.style.background = '#ede9fe'; e.target.style.borderColor = '#ddd6fe'; }}
                onMouseLeave={e => { e.target.style.background = '#f5f3ff'; e.target.style.borderColor = '#e9e5ff'; }}
              >
                Ver planes
              </button>
            </motion.div>

            {/* footer */}
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginTop: 28 }}>
              <span style={{ fontSize: 11, color: '#ccc' }}>
                © {new Date().getFullYear()} GrapeLabs · grapelabs.org
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* ── responsive ── */}
        <style>{`
          @media (max-width: 900px) {
            .left-panel { display: none !important; }
            .wavy-divider { display: none !important; }
          }
        `}</style>
      </div>
    </>
  );
}