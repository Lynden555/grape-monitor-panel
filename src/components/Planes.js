import React from 'react';
import { motion } from 'framer-motion';

/* ── floating bubble (same as Login) ── */
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

/* ── check icon ── */
const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

/* ── plan card ── */
const PlanCard = ({ plan, price, period, features, highlighted, buttonText, buttonStyle, onSelect, badge }) => (
  <motion.div
    whileHover={{ y: -6, transition: { duration: 0.25 } }}
    style={{
      flex: 1, minWidth: 0, maxWidth: 360, width: '100%',
      background: highlighted ? '#fff' : '#f9f9f9',
      borderRadius: 20,
      border: highlighted ? '2px solid #8b5cf6' : '1.5px solid #e8e8e8',
      padding: 32,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      transition: 'box-shadow 0.3s ease',
      boxShadow: highlighted ? '0 20px 60px rgba(139,92,246,0.12)' : 'none',
    }}
  >
    {badge && (
      <div style={{
        position: 'absolute', top: -12, right: 24,
        background: '#8b5cf6', color: '#fff',
        fontSize: 11, fontWeight: 700, padding: '5px 14px',
        borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {badge}
      </div>
    )}

    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 14, fontWeight: 600, color: '#888',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
      }}>
        {plan}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontSize: 42, fontWeight: 700, color: '#1a1a1a',
          fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1,
        }}>
          {price}
        </span>
        <span style={{ fontSize: 15, color: '#aaa' }}>{period}</span>
      </div>
    </div>

    <div style={{ flex: 1, marginBottom: 28 }}>
      {features.map((feature, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 0',
          borderBottom: i < features.length - 1 ? '1px solid #f0f0f0' : 'none',
        }}>
          <Check />
          <span style={{ fontSize: 14, color: '#555' }}>{feature}</span>
        </div>
      ))}
    </div>

    <button
      onClick={onSelect}
      style={{
        width: '100%', padding: '14px 0', borderRadius: 12,
        border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s ease',
        ...buttonStyle,
      }}
      onMouseEnter={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'scale(1.01)'; }}
      onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'scale(1)'; }}
    >
      {buttonText}
    </button>
  </motion.div>
);

/* ── feature icon ── */
const FeatureIcon = ({ children }) => (
  <div style={{
    width: 40, height: 40, borderRadius: 10,
    background: 'rgba(139,92,246,0.08)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function Planes() {
  const planes = [
    {
      plan: 'Free Trial',
      price: '$0',
      period: '/ 7 días',
      features: [
        '1 empresa registrada',
        'Acceso completo por 7 días',
        'Todas las funciones básicas',
        'Soporte por email',
        'Sin tarjeta de crédito',
      ],
      highlighted: false,
      buttonText: 'Comenzar Trial',
      buttonStyle: {
        background: 'transparent', color: '#1a1a1a',
        border: '1.5px solid #ddd',
      },
      onSelect: () => window.location.href = '/#/registro',
    },
    {
      plan: 'Starter',
      price: '$99',
      period: '/ mes',
      features: [
        'Hasta 10 empresas',
        'Monitoreo en tiempo real',
        'Alertas por WhatsApp',
        'Soporte prioritario',
        'Reportes avanzados',
        'Backup diario',
      ],
      highlighted: true,
      badge: 'Más popular',
      buttonText: 'Seleccionar Starter',
      buttonStyle: {
        background: '#0a0a0a', color: '#fff',
        border: 'none',
      },
      onSelect: () => alert('Próximamente: Pago con Stripe para Starter'),
    },
    {
      plan: 'Premium',
      price: '$149',
      period: '/ mes',
      features: [
        'Hasta 30 empresas',
        'Todas las funciones Starter',
        'Soporte 24/7',
        'API access',
        'Dashboard personalizado',
        'Migración asistida',
        'Entrenamiento incluido',
      ],
      highlighted: false,
      buttonText: 'Seleccionar Premium',
      buttonStyle: {
        background: '#8b5cf6', color: '#fff',
        border: 'none',
      },
      onSelect: () => alert('Próximamente: Pago con Stripe para Premium'),
    },
  ];

  const allFeatures = [
    { icon: '⚡', text: 'Monitoreo en tiempo real' },
    { icon: '🔒', text: 'Cifrado de extremo a extremo' },
    { icon: '🏢', text: 'Multi-sucursal' },
    { icon: '🛠', text: 'Soporte técnico' },
    { icon: '✨', text: 'Actualizaciones gratuitas' },
    { icon: '✅', text: 'Garantía de satisfacción' },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
    }),
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />

      <div style={{
        minHeight: '100vh', background: '#0a0a0a', position: 'relative',
        overflow: 'hidden', fontFamily: "'DM Sans', sans-serif",
        padding: '40px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {/* bubbles */}
        <Bubble size={350} top="-5%" left="10%" delay={0} opacity={0.05} />
        <Bubble size={250} top="60%" right="5%" delay={2} opacity={0.04} />
        <Bubble size={200} top="30%" left="70%" delay={1} opacity={0.06} />
        <Bubble size={150} bottom="10%" left="20%" delay={3} opacity={0.03} color="rgba(255,255,255," />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* ── header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 32 }}
          >
            <div style={{
              fontSize: 13, fontWeight: 500, color: '#8b5cf6',
              textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16,
            }}>
              Precios
            </div>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 36, fontWeight: 700, color: '#fff',
              margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em',
            }}>
              Elige tu Plan
            </h1>
            <p style={{
              fontSize: 16, color: 'rgba(255,255,255,0.35)',
              maxWidth: 480, margin: '0 auto 8px', lineHeight: 1.6,
            }}>
              Comienza gratis y escala según crece tu negocio.
            </p>
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: 0,
            }}>
              Sin contratos, sin sorpresas. Cancela en cualquier momento.
            </p>
          </motion.div>

          {/* ── plan cards ── */}
          <div style={{
display: 'flex', gap: 24, justifyContent: 'center',
flexWrap: 'nowrap', marginBottom: 0,
          }}>
            {planes.map((plan, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                style={{ display: 'flex' }}
              >
                <PlanCard {...plan} />
              </motion.div>
            ))}
          </div>


          {/* ── footer ── */}
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: '0 0 20px' }}>
              ¿Tienes preguntas? Contacta a nuestro equipo en ventas@grape.com
            </p>
            <button
              onClick={() => window.location.href = '/#/'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
            >
              ← Volver al Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}