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
            fontSize: 'clamp(2.5rem, 7vw, 6rem)',
            fontWeight: 300,
            color: '#1A1A1A',
            letterSpacing: '0.02em',
          }}
        >
          {display}
        </span>
      </div>
      <span
        style={{
          fontFamily: 'Jost, sans-serif',
          fontSize: '9px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#C9A84C',
          marginTop: '8px',
          fontWeight: 400,
        }}
      >
        {label}
      </span>
    </div>
  )
}

// Parallax images config
const HERO_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    style: { top: '15%', left: '3%', width: 180, height: 240, borderRadius: '4px' },
    delay: 0.3,
    shape: 'rect',
    parallax: 0.3,
  },
  {
    src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=500&q=80',
    style: { top: '8%', right: '4%', width: 200, height: 280, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' },
    delay: 0.5,
    shape: 'oval',
    parallax: 0.5,
  },
  {
    src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80',
    style: { bottom: '10%', right: '6%', width: 160, height: 210, borderRadius: '4px' },
    delay: 0.4,
    shape: 'rect',
    parallax: 0.2,
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
      {/* Background organic blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%', left: '-5%',
          width: 600, height: 600,
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          border: '1px solid rgba(201, 168, 76, 0.12)',
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '5%', right: '-8%',
          width: 500, height: 500,
          borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
          border: '1px solid rgba(201, 168, 76, 0.08)',
          transform: `translateY(${-scrollY * 0.08}px)`,
        }}
      />
      {/* Small accent circle */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%', right: '20%',
          width: 80, height: 80,
          borderRadius: '50%',
          border: '1px solid rgba(201, 168, 76, 0.3)',
        }}
      />

      {/* Parallax Photos */}
      {HERO_IMAGES.map((img, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: img.delay, ease: [0.6, 0, 0.2, 1] }}
          className="absolute hidden lg:block photo-frame"
          style={{
            ...img.style,
            transform: `translateY(${-scrollY * img.parallax * 0.1}px)`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          <img
            src={img.src}
            alt="Gala"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: img.style.borderRadius,
            }}
          />
          {/* Gold overlay */}
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(201,168,76,0.1) 0%, transparent 60%)',
              borderRadius: img.style.borderRadius,
            }}
          />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Pre-title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="decorative-line w-12" />
          <span
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              fontWeight: 400,
            }}
          >
            Sciences de l'Ingénieur · Promotion 2
          </span>
          <div className="decorative-line w-12" />
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.6, 0, 0.2, 1] }}
          className="section-title mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
        >
          Éclat
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex items-center justify-center gap-6 mb-2"
        >
          <div className="decorative-line w-20" />
          <span style={{ color: '#C9A84C', fontSize: '1.5rem', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>&amp;</span>
          <div className="decorative-line w-20" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.6, 0, 0.2, 1] }}
          className="section-title mb-10"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300 }}
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
            fontSize: '12px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(26,26,26,0.5)',
            marginBottom: '3rem',
          }}
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
                <span
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                    fontWeight: 300,
                    color: 'rgba(201,168,76,0.4)',
                    marginTop: '-4px',
                    lineHeight: 1.1,
                  }}
                >
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
          <button
            onClick={() => document.querySelector('#billetterie')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary min-w-[200px]"
          >
            Réserver ma place
          </button>
          <button
            onClick={() => document.querySelector('#programme')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-gold min-w-[200px]"
          >
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
      >
        <span style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
          Découvrir
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>
    </section>
  )
}
