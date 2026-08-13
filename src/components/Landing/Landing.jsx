import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import s from './Landing.module.css';
import useLandingFonts from './useLandingFonts';
import grapeLogo from '../images/grape.png';

const CONTACTO = 'labsgrape@gmail.com';

const COLORES = [
  { key: 'c', label: 'C', clase: s.barC },
  { key: 'm', label: 'M', clase: s.barM },
  { key: 'y', label: 'Y', clase: s.barY },
  { key: 'k', label: 'K', clase: s.barK },
];

const NIVELES_BASE = { c: 64, m: 38, y: 71, k: 52 };

function horaCorta() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export default function Landing() {
  useLandingFonts();

  const [niveles, setNiveles] = useState(NIVELES_BASE);
  const [alerta, setAlerta] = useState(false);
  const [toast, setToast] = useState(false);
  const [sello, setSello] = useState(horaCorta);
  const [contador, setContador] = useState({ bn: 148204, color: 36716 });

  const timers = useRef([]);

  const programar = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducido) return undefined;

    const tickContador = setInterval(() => {
      setContador((prev) => ({
        bn: prev.bn + Math.floor(Math.random() * 4),
        color: prev.color + (Math.random() < 0.5 ? 1 : 0),
      }));
    }, 2200);

    let drenaje = null;

    const ciclo = () => {
      let m = NIVELES_BASE.m;

      drenaje = setInterval(() => {
        m -= 6;
        const valor = Math.max(m, 8);
        setNiveles((prev) => ({ ...prev, m: valor }));

        if (m <= 8) {
          clearInterval(drenaje);
          drenaje = null;
          setAlerta(true);
          programar(() => setToast(true), 450);

          programar(() => {
            setToast(false);
            setAlerta(false);
            setNiveles((prev) => ({ ...prev, m: NIVELES_BASE.m }));
            setSello(horaCorta());
            programar(ciclo, 3500);
          }, 5200);
        }
      }, 900);
    };

    const arranque = programar(ciclo, 1200);

    return () => {
      clearInterval(tickContador);
      if (drenaje) clearInterval(drenaje);
      clearTimeout(arranque);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [programar]);

  return (
    <div className={s.root}>
      <div className={s.halftone} />
      <div className={s.glow} />

      <nav className={s.nav}>
        <div className={s.navIn}>
          <Link to="/" className={s.brand}>
            <img src={grapeLogo} alt="" className={s.logo} />
            Grape Monitor
          </Link>
          <Link to="/precios" className={`${s.btn} ${s.btnQuiet} ${s.hideSmall}`}>
            Precios
          </Link>
          <Link to="/login" className={`${s.btn} ${s.btnGhost}`}>
            Entrar
          </Link>
        </div>
      </nav>

      <main className={s.main}>
        <div>
          <span className={s.eyebrow}><i /> Monitoreo de impresión</span>

          <h1 className={s.h1}>
            Tu flota avisa <em>antes</em> de fallar.
          </h1>

          <p className={s.sub}>
            Tóner, contadores y alertas de todas las impresoras de tus clientes,
            en tiempo real y sin salir a revisar.
          </p>

          <div className={s.actions}>
            <Link to="/login" className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`}>
              Entrar
            </Link>
            <Link to="/precios" className={`${s.btn} ${s.btnGhost} ${s.btnLg}`}>
              Ver precios
            </Link>
          </div>
        </div>

        <div className={s.stage}>
          <article className={`${s.card} ${alerta ? s.cardAlert : ''}`}>
            <div className={s.cardH}>
              <span className={s.live}><i /> En línea</span>
              <span className={s.stamp}>Actualizado {sello}</span>
            </div>

            <div className={s.cardB}>
              <div className={s.model}>Ricoh IM C3010</div>
              <div className={s.client}>Notaría 4</div>

              <div className={s.bars}>
                {COLORES.map(({ key, label, clase }) => {
                  const valor = niveles[key];
                  const bajo = valor <= 10;
                  return (
                    <div className={s.brow} key={key}>
                      <span className={s.bkey}>{label}</span>
                      <span className={`${s.bar} ${clase} ${bajo ? s.barLow : ''}`}>
                        <span style={{ width: `${valor}%` }} />
                      </span>
                      <span className={`${s.bval} ${bajo ? s.bvalLow : ''}`}>
                        {Math.round(valor)}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className={s.meta}>
                <div>
                  <div className={s.metaLbl}>Blanco y negro</div>
                  <div className={s.metaVal}>{contador.bn.toLocaleString('es-MX')}</div>
                </div>
                <div>
                  <div className={s.metaLbl}>Color</div>
                  <div className={s.metaVal}>{contador.color.toLocaleString('es-MX')}</div>
                </div>
              </div>
            </div>
          </article>

          <div
            className={`${s.toast} ${toast ? s.toastShow : ''}`}
            role="status"
            aria-live="polite"
          >
            <div className={s.tico}>🔔</div>
            <div>
              <div className={s.tt}>Tóner magenta bajo</div>
              <div className={s.tb}>Notaría 4 — Ricoh IM C3010 · 8%</div>
            </div>
            <div className={s.tw}>ahora</div>
          </div>
        </div>
      </main>

      <footer className={s.foot}>
        <div className={s.footIn}>
          <span>© {new Date().getFullYear()} Grape Monitor</span>
          <span className={s.footRight}>
            <Link to="/precios">Precios</Link>
            <a href={`mailto:${CONTACTO}`}>Contacto</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
