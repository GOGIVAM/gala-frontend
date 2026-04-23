import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const TARGET_DATE = new Date('2026-05-30T19:00:00')

function useCountdown() {
  const [time, setTime] = useState({})

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const diff = TARGET_DATE - now
      if (diff <= 0) return setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [])

  return time
}

function CountdownUnit({ value, label }) {
  const display = String(value ?? 0).padStart(2, '0')
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <span
          className="countdown-digit"
          data-value={display}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(4rem, 9vw, 9rem)',
            fontWeight: 300,
            color: '#1A1A1A',
            letterSpacing: '0.02em',
          }}
        >
          {display}
        </span>
      </div>
      <span style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: '11px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#C9A84C',
        marginTop: '10px',
        fontWeight: 400,
      }}>
        {label}
      </span>
    </div>
  )
}

// ── SVG clip-path shapes ──────────────────────────────────────
// Chaque image a un clipPath SVG unique injecté dans le DOM
const SHAPES = {
  // Croissant de lune — cercle avec un autre cercle découpé
  moon: {
    clipPathDef: (id) => (
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <path d="M 0.75,0.05 A 0.5,0.5 0 1,0 0.75,0.95 A 0.35,0.45 0 1,1 0.75,0.05 Z" />
        </clipPath>
      </defs>
    ),
    clip: (id) => `url(#${id})`,
    width: 190, height: 220,
  },
  // Étoile à 5 branches
  star: {
    clipPathDef: (id) => (
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <polygon points="
            0.5,0.02
            0.61,0.35 0.98,0.35
            0.68,0.57 0.79,0.92
            0.5,0.70 0.21,0.92
            0.32,0.57 0.02,0.35
            0.39,0.35
          " />
        </clipPath>
      </defs>
    ),
    clip: (id) => `url(#${id})`,
    width: 210, height: 210,
  },
  // Œuf / Poule — ovale arrondi vers le bas
  egg: {
    clipPathDef: (id) => (
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <ellipse cx="0.5" cy="0.52" rx="0.42" ry="0.48" />
        </clipPath>
      </defs>
    ),
    clip: (id) => `url(#${id})`,
    width: 180, height: 240,
  },
  // Étoile à 6 branches (étoile de Noël / flocon)
  star6: {
    clipPathDef: (id) => (
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <polygon points="
            0.5,0.04 0.57,0.36 0.87,0.18 0.68,0.44
            0.98,0.5 0.68,0.56 0.87,0.82
            0.57,0.64 0.5,0.96 0.43,0.64
            0.13,0.82 0.32,0.56 0.02,0.5
            0.32,0.44 0.13,0.18 0.43,0.36
          " />
        </clipPath>
      </defs>
    ),
    clip: (id) => `url(#${id})`,
    width: 200, height: 200,
  },
  // Diamant (losange)
  diamond: {
    clipPathDef: (id) => (
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <polygon points="0.5,0.02 0.98,0.5 0.5,0.98 0.02,0.5" />
        </clipPath>
      </defs>
    ),
    clip: (id) => `url(#${id})`,
    width: 185, height: 250,
  },
}

const HERO_IMAGES = [
  // ── Gauche ──
  {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80',
    side: 'left',
    top: '20%', left: '2%',
    shape: 'moon',
    delay: 0.3, parallax: 0.2,
  },
  {
    src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&q=80',

    side: 'left',
    top: '70%', left: '5%',
    shape: 'egg',
    delay: 0.5, parallax: 0.35,
  },
  // ── Droite ──
  {
    src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=500&q=80',
    side: 'right',
    top: '15%', right: '3%',
    shape: 'star',
    delay: 0.4, parallax: 0.25,
  },
  {
    src: 'https://images.unsplash.com/photo-1493225457124-e3c3ccc3a5ae?w=500&q=80',
    side: 'right',
    top: '52%', right: '2%',
    shape: 'star6',
    delay: 0.6, parallax: 0.15,
  },
]

export default function Hero() {
  const countdown = useCountdown()
  const sectionRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollDown = () => {
    document.querySelector('#programme')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--cream)' }}
    >
      {/* SVG clip-path definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        {Object.entries(SHAPES).map(([key, shape]) =>
          shape.clipPathDef(`clip-${key}`)
        )}
      </svg>

      {/* Background organic blobs */}
      <div className="absolute pointer-events-none" style={{ top: '10%', left: '-5%', width: 600, height: 600, borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', border: '1px solid rgba(201,168,76,0.12)', transform: `translateY(${scrollY * 0.1}px)` }} />
      <div className="absolute pointer-events-none" style={{ bottom: '5%', right: '-8%', width: 500, height: 500, borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%', border: '1px solid rgba(201,168,76,0.08)', transform: `translateY(${-scrollY * 0.08}px)` }} />
      <div className="absolute pointer-events-none" style={{ top: '30%', right: '20%', width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.3)' }} />

      {/* ── Images de part et d'autre ── */}
      {HERO_IMAGES.map((img, i) => {
        const shape = SHAPES[img.shape]
        const posStyle = {
          top: img.top,
          left: img.left,
          right: img.right,
          width: shape.width,
          height: shape.height,
        }
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.4, delay: img.delay, ease: [0.6, 0, 0.2, 1] }}
            className="absolute hidden lg:block"
            style={{
              ...posStyle,
              transform: `translateY(${-scrollY * img.parallax * 0.1}px)`,
              zIndex: 1,
            }}
          >
            {/* Bord doré autour de la forme */}
            <div style={{
              position: 'absolute', inset: -2,
              clipPath: shape.clip(`clip-${img.shape}`),
              background: 'rgba(201,168,76,0.35)',
              zIndex: 0,
            }} />
            {/* Image clippée */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: shape.clip(`clip-${img.shape}`),
              overflow: 'hidden',
              zIndex: 1,
            }}>
              <img
                src={img.src}
                alt="Gala"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Voile doré */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 55%)',
              }} />
            </div>
          </motion.div>
        )
      })}

      {/* ── Main Content — identique, inchangé ── */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        {/* Pre-title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="decorative-line w-12" />
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '13px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 400 }}>
            Sciences de l'Ingénieur · Promotion 2
          </span>
          <div className="decorative-line w-12" />
        </motion.div>

        {/* Éclat */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.6, 0, 0.2, 1] }}
          className="mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(5rem, 12vw, 11rem)', lineHeight: 0.95, letterSpacing: '0.02em' }}
        >
          Éclat
        </motion.h1>

        {/* & */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex items-center justify-center gap-6 mb-2"
        >
          <div className="decorative-line w-20" />
          <span style={{ color: '#C9A84C', fontSize: '2rem', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>&amp;</span>
          <div className="decorative-line w-20" />
        </motion.div>

        {/* Élégance */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.6, 0, 0.2, 1] }}
          className="mb-10"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(5rem, 12vw, 11rem)', lineHeight: 0.95, letterSpacing: '0.02em' }}
        >
          Élégance
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          style={{ fontFamily: 'Jost, sans-serif', fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(26,26,26,0.5)', marginBottom: '3rem' }}
        >
          Samedi 30 Mai 2026 · 19h00 · Black Tie — Noir & Or
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex items-start justify-center gap-8 md:gap-16 mb-14"
        >
          {[
            { value: countdown.days, label: 'Jours' },
            { value: countdown.hours, label: 'Heures' },
            { value: countdown.minutes, label: 'Minutes' },
            { value: countdown.seconds, label: 'Secondes' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-8 md:gap-16">
              <CountdownUnit value={item.value} label={item.label} />
              {i < 3 && (
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(3rem, 7vw, 7rem)', fontWeight: 300, color: 'rgba(201,168,76,0.4)', marginTop: '-4px', lineHeight: 1.1 }}>
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
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button onClick={() => document.querySelector('#billetterie')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary min-w-[200px]">
            Réserver ma place
          </button>
          <button onClick={() => document.querySelector('#programme')?.scrollIntoView({ behavior: 'smooth' })} className="btn-gold min-w-[200px]">
            Voir le programme
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-charcoal/30 hover:text-gold transition-colors"
        style={{ zIndex: 10, background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
          Découvrir
        </span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>
    </section>
  )
}