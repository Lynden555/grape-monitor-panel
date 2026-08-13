import { Link } from 'react-router-dom';
import s from './Landing.module.css';
import useLandingFonts from './useLandingFonts';
import grapeLogo from '../images/grape.png';

const CONTACTO = 'labsgrape@gmail.com';

const PLANES = [
  {
    nombre: 'Starter',
    para: 'Para quien maneja una plaza o va empezando.',
    precio: '1,500',
    tope: '100 impresoras',
    destacado: false,
    asunto: 'Grape Monitor — Starter',
    beneficios: [
      'Tóner y contadores en tiempo real',
      <>Corte del periodo en <b>PDF</b></>,
      'Alertas al celular',
      'Usuarios ilimitados',
    ],
  },
  {
    nombre: 'Pro',
    para: 'Para quien trae varias cuentas al mismo tiempo.',
    precio: '3,200',
    tope: '250 impresoras',
    destacado: true,
    asunto: 'Grape Monitor — Pro',
    beneficios: [
      'Todo lo de Starter',
      'Varios clientes en una cuenta',
      'Alertas ajustables por cliente',
      'Soporte prioritario',
    ],
  },
  {
    nombre: 'Enterprise',
    para: 'Para flotas grandes repartidas en varias plazas.',
    precio: '6,000',
    tope: '600 impresoras',
    destacado: false,
    asunto: 'Grape Monitor — Enterprise',
    beneficios: [
      'Todo lo de Pro',
      <><b>Tu marca</b> en el portal y los PDF</>,
      'Instalación acompañada',
      'Conexión con tu facturación',
    ],
  },
];

export default function Precios() {
  useLandingFonts();

  return (
    <div className={s.root}>
      <div className={`${s.halftone} ${s.halftoneCenter}`} />
      <div className={`${s.glow} ${s.glowCenter}`} />

      <nav className={s.nav}>
        <div className={s.navIn}>
          <Link to="/" className={s.brand}>
            <img src={grapeLogo} alt="" className={s.logo} />
            Grape Monitor
          </Link>
          <Link to="/" className={`${s.btn} ${s.btnQuiet}`}>Inicio</Link>
          <Link to="/login" className={`${s.btn} ${s.btnGhost}`}>Entrar</Link>
        </div>
      </nav>

      <main className={`${s.main} ${s.mainStack}`}>
        <div className={s.head}>
          <h1 className={s.h1Center}>Un precio fijo al mes.</h1>
          <p className={s.subCenter}>
            Eliges el plan según el tamaño de tu flota. Sin costo por usuario
            y sin contrato forzoso.
          </p>
        </div>

        <div className={s.plans}>
          {PLANES.map((plan) => (
            <div
              key={plan.nombre}
              className={`${s.plan} ${plan.destacado ? s.planHot : ''}`}
            >
              {plan.destacado && <span className={s.tag}>Más elegido</span>}

              <h2 className={s.planName}>{plan.nombre}</h2>
              <p className={s.planFor}>{plan.para}</p>

              <div className={s.price}>
                <span className={s.sym}>$</span>
                <span className={s.amt}>{plan.precio}</span>
                <span className={s.cu}>MXN / mes</span>
              </div>
              <p className={s.unit}>Hasta <b>{plan.tope}</b></p>

              <a
                href={`mailto:${CONTACTO}?subject=${encodeURIComponent(plan.asunto)}`}
                className={`${s.btn} ${plan.destacado ? s.btnPrimary : s.btnGhost} ${s.planBtn}`}
              >
                Empezar
              </a>

              <ul className={s.feats}>
                {plan.beneficios.map((texto, i) => (
                  <li key={i}>
                    <span className={s.tick}>✓</span>
                    <span>{texto}</span>
                  </li>
                ))}
              </ul>

              <div className={s.spacer} />
            </div>
          ))}
        </div>

        <p className={s.fine}>
          Precios sin IVA · 30 días de prueba sin tarjeta ·{' '}
          ¿Más de 600 impresoras?{' '}
          <a href={`mailto:${CONTACTO}?subject=${encodeURIComponent('Plan a la medida')}`}>
            Hablemos de un plan a la medida
          </a>
        </p>
      </main>

      <footer className={s.foot}>
        <div className={s.footIn}>
          <span>© {new Date().getFullYear()} Grape Monitor</span>
          <span className={s.footRight}>
            <Link to="/">Inicio</Link>
            <a href={`mailto:${CONTACTO}`}>Contacto</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
