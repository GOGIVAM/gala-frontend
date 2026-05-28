import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useSettings } from '../../hooks/useConfig.jsx'

function useCountdown(targetDateString) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const TARGET = targetDateString
      ? new Date(targetDateString)
      : new Date('2026-05-30T19:00:00')

    const calc = () => {
      const diff = TARGET - new Date()
      if (diff <= 0) return setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDateString])

  return time
}

function CountdownUnit({ value, label }) {
  const display = String(value ?? 0).padStart(2, '0')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Chiffre principal */}
      <span style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(3.5rem, 8vw, 8rem)',
        fontWeight: 300,
        color: '#1A1A1A',
        lineHeight: 1,
        position: 'relative',
        zIndex: 1,
      }}>
        {display}
      </span>
      {/* Double écho doré — décalé derrière */}
      <span
        aria-hidden="true"
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(3.5rem, 8vw, 8rem)',
          fontWeight: 300,
          color: 'rgba(201,168,76,0.13)',
          lineHeight: 1,
          position: 'absolute',
          top: '6px',
          left: '4px',
          zIndex: 0,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {display}
      </span>
      <span style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: 'clamp(8px, 1.5vw, 11px)',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#C9A84C',
        marginTop: '12px',
        position: 'relative',
        zIndex: 1,
      }}>
        {label}
      </span>
    </div>
  )
}

/* ── Décors SVG ──────────────────────────── */
function HeroDecor({ scrollY }) {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Cercles concentriques gauche */}
      <g transform={`translate(0, ${scrollY * 0.06})`}>
        <circle cx="-30" cy="450" r="320" fill="none" stroke="rgba(201,168,76,0.09)" strokeWidth="1" />
        <circle cx="-30" cy="450" r="220" fill="none" stroke="rgba(201,168,76,0.07)" strokeWidth="1" />
        <circle cx="-30" cy="450" r="140" fill="none" stroke="rgba(201,168,76,0.05)" strokeWidth="1" />
      </g>

      {/* Cercles concentriques droite */}
      <g transform={`translate(0, ${-scrollY * 0.05})`}>
        <circle cx="1430" cy="300" r="300" fill="none" stroke="rgba(201,168,76,0.09)" strokeWidth="1" />
        <circle cx="1430" cy="300" r="200" fill="none" stroke="rgba(201,168,76,0.06)" strokeWidth="1" />
      </g>

      {/* Losange décoratif haut-gauche */}
      <g transform={`translate(80, 80) rotate(15)`}>
        <polygon points="0,-40 28,0 0,40 -28,0" fill="none" stroke="rgba(201,168,76,0.25)" strokeWidth="0.8" />
        <polygon points="0,-24 17,0 0,24 -17,0" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="0.5" />
      </g>

      {/* Losange décoratif bas-droite */}
      <g transform={`translate(1320, 820) rotate(-10)`}>
        <polygon points="0,-36 25,0 0,36 -25,0" fill="none" stroke="rgba(201,168,76,0.25)" strokeWidth="0.8" />
      </g>

      {/* Étoile décorative haut-droite */}
      <g transform="translate(1280, 120)">
        {[0,45,90,135].map(a => (
          <line key={a}
            x1={Math.cos(a * Math.PI/180) * -22} y1={Math.sin(a * Math.PI/180) * -22}
            x2={Math.cos(a * Math.PI/180) * 22}  y2={Math.sin(a * Math.PI/180) * 22}
            stroke="rgba(201,168,76,0.3)" strokeWidth="0.7"
          />
        ))}
        <circle cx="0" cy="0" r="4" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="0.8" />
      </g>

      {/* Étoile décorative bas-gauche */}
      <g transform="translate(120, 780)">
        {[0,45,90,135].map(a => (
          <line key={a}
            x1={Math.cos(a * Math.PI/180) * -18} y1={Math.sin(a * Math.PI/180) * -18}
            x2={Math.cos(a * Math.PI/180) * 18}  y2={Math.sin(a * Math.PI/180) * 18}
            stroke="rgba(201,168,76,0.25)" strokeWidth="0.7"
          />
        ))}
      </g>

      {/* Lignes diagonales légères */}
      <line x1="0" y1="0" x2="200" y2="200" stroke="rgba(201,168,76,0.04)" strokeWidth="1" />
      <line x1="1400" y1="0" x2="1200" y2="200" stroke="rgba(201,168,76,0.04)" strokeWidth="1" />
      <line x1="0" y1="900" x2="200" y2="700" stroke="rgba(201,168,76,0.04)" strokeWidth="1" />
      <line x1="1400" y1="900" x2="1200" y2="700" stroke="rgba(201,168,76,0.04)" strokeWidth="1" />

      {/* Petit carré central très discret */}
      <rect x="670" y="20" width="60" height="60" fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="0.5" transform="rotate(45 700 50)" />

      {/* Trait horizontal bas */}
      <line x1="100" y1="870" x2="500" y2="870" stroke="rgba(201,168,76,0.15)" strokeWidth="0.5" />
      <line x1="900" y1="870" x2="1300" y2="870" stroke="rgba(201,168,76,0.15)" strokeWidth="0.5" />
      <circle cx="700" cy="870" r="3" fill="rgba(201,168,76,0.3)" />
    </svg>
  )
}

export default function Hero() {
  const { settings } = useSettings()
  const countdown = useCountdown(settings?.event_date)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--cream, #FAF8F3)',
      }}
    >
      <HeroDecor scrollY={scrollY} />

      {/* Contenu principal */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', width: '100%', maxWidth: 900, margin: '0 auto' }}>

        {/* Pre-title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}
        >
          {/* Ligne décor SVG inline */}
          <svg width="48" height="2" viewBox="0 0 48 2">
            <line x1="0" y1="1" x2="40" y2="1" stroke="#C9A84C" strokeWidth="0.8" />
            <circle cx="46" cy="1" r="1.5" fill="#C9A84C" opacity="0.6" />
          </svg>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 'clamp(9px,1.5vw,13px)', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C9A84C' }}>
            Sciences de l'Ingénieur · Promotion 2
          </span>
          <svg width="48" height="2" viewBox="0 0 48 2">
            <circle cx="2" cy="1" r="1.5" fill="#C9A84C" opacity="0.6" />
            <line x1="8" y1="1" x2="48" y2="1" stroke="#C9A84C" strokeWidth="0.8" />
          </svg>
        </motion.div>

        {/* ÉCLAT */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.6, 0, 0.2, 1] }}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 300,
            fontSize: 'clamp(4.5rem, 13vw, 11rem)',
            lineHeight: 0.95,
            letterSpacing: '0.02em',
            margin: 0,
          }}
        >
          Éclat
        </motion.h1>

        {/* Séparateur & */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', margin: '8px 0' }}
        >
          <svg width="80" height="2" viewBox="0 0 80 2">
            <line x1="0" y1="1" x2="72" y2="1" stroke="#C9A84C" strokeWidth="0.8" />
            <circle cx="78" cy="1" r="1.5" fill="#C9A84C" opacity="0.7" />
          </svg>
          <span style={{ color: '#C9A84C', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
            &amp;
          </span>
          <svg width="80" height="2" viewBox="0 0 80 2">
            <circle cx="2" cy="1" r="1.5" fill="#C9A84C" opacity="0.7" />
            <line x1="8" y1="1" x2="80" y2="1" stroke="#C9A84C" strokeWidth="0.8" />
          </svg>
        </motion.div>

        {/* ÉLÉGANCE */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.6, 0, 0.2, 1] }}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(4.5rem, 13vw, 11rem)',
            lineHeight: 0.95,
            letterSpacing: '0.02em',
            margin: '0 0 32px',
          }}
        >
          Élégance
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: 'clamp(9px, 1.8vw, 13px)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(26,26,26,0.5)',
            marginBottom: '48px',
          }}
        >
          Samedi 21 Juin 2026 · 19h00 · Black Tie — Noir & Or
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 'clamp(16px, 4vw, 48px)',
            marginBottom: '56px',
          }}
        >
          {[
            { value: countdown.days,    label: 'Jours' },
            { value: countdown.hours,   label: 'Heures' },
            { value: countdown.minutes, label: 'Minutes' },
            { value: countdown.seconds, label: 'Secondes' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(16px, 4vw, 48px)' }}>
              <CountdownUnit value={item.value} label={item.label} />
              {i < 3 && (
                <span style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 'clamp(2.5rem, 6vw, 7rem)',
                  fontWeight: 300,
                  color: 'rgba(201,168,76,0.4)',
                  lineHeight: 1,
                  marginTop: '-2px',
                }}>
                  :
                </span>
              )}
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}
        >
          <button
            onClick={() => document.querySelector('#billetterie')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              minWidth: '200px',
              padding: '14px 32px',
              background: '#1A1A1A',
              color: '#FAF8F3',
              border: 'none',
              fontFamily: 'Jost, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'opacity 0.3s',
            }}
          >
            Réserver ma place
          </button>
          <button
            onClick={() => document.querySelector('#programme')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              minWidth: '200px',
              padding: '14px 32px',
              background: 'transparent',
              color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.5)',
              fontFamily: 'Jost, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            Voir le programme
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => document.querySelector('#programme')?.scrollIntoView({ behavior: 'smooth' })}
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          color: 'rgba(26,26,26,0.3)',
        }}
      >
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Découvrir
        </span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>
    </section>
  )
}