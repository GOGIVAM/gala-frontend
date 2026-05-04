import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgramme } from '../../hooks/useConfig.jsx'

const WHEEL_RADIUS = 180
const CENTER_X = 210
const CENTER_Y = 210
const SVG_SIZE = 420

function getSegmentPath(index, total, r, cx, cy, gap = 0.04) {
  const angle = (2 * Math.PI) / total
  const start = angle * index - Math.PI / 2 + gap
  const end = angle * (index + 1) - Math.PI / 2 - gap
  const innerR = r * 0.36
  const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
  const x3 = cx + innerR * Math.cos(end),   y3 = cy + innerR * Math.sin(end)
  const x4 = cx + innerR * Math.cos(start), y4 = cy + innerR * Math.sin(start)
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`
}

function getLabelPos(index, total, r, cx, cy) {
  const angle = (2 * Math.PI) / total
  const mid = angle * index - Math.PI / 2 + angle / 2
  const lr = r * 0.68
  return { x: cx + lr * Math.cos(mid), y: cy + lr * Math.sin(mid) }
}

function WheelTicks({ cx, cy, outerR, count = 60 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2
        const isMajor = i % (count / 8) === 0
        const r1 = outerR + 5
        const r2 = outerR + (isMajor ? 14 : 9)
        return (
          <line
            key={i}
            x1={cx + r1 * Math.cos(angle)} y1={cy + r1 * Math.sin(angle)}
            x2={cx + r2 * Math.cos(angle)} y2={cy + r2 * Math.sin(angle)}
            stroke={isMajor ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.25)'}
            strokeWidth={isMajor ? 1.8 : 0.8}
          />
        )
      })}
    </>
  )
}

export default function ProgramWheel() {
  const { programme, loading } = useProgramme()
  const [active, setActive] = useState(0)
  const sectionRef = useRef(null)
  const scrollLock = useRef(false)
  const accDelta = useRef(0)
  const inViewRef = useRef(false)

  const PROGRAM = (programme && programme.length > 0)
    ? programme.map((p, idx) => ({
        id: idx,
        time: p.time_label,
        title: p.title,
        subtitle: p.subtitle || '',
        description: p.description || '',
        icon: p.icon || '✦',
      }))
    : []

  useEffect(() => {
    if (PROGRAM.length === 0) return
    const section = sectionRef.current
    if (!section) return

    const checkInView = () => {
      const rect = section.getBoundingClientRect()
      inViewRef.current = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2
    }

    const onWheel = (e) => {
      checkInView()
      if (!inViewRef.current) return
      const atStart = active === 0 && e.deltaY < 0
      const atEnd = active === PROGRAM.length - 1 && e.deltaY > 0
      if (!atStart && !atEnd) { e.preventDefault(); e.stopPropagation() }
      if (scrollLock.current) return
      accDelta.current += e.deltaY
      if (Math.abs(accDelta.current) > 60) {
        setActive(prev => accDelta.current > 0 ? Math.min(prev + 1, PROGRAM.length - 1) : Math.max(prev - 1, 0))
        accDelta.current = 0
        scrollLock.current = true
        setTimeout(() => { scrollLock.current = false }, 400)
      }
    }

    section.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', checkInView)
    return () => {
      section.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', checkInView)
    }
  }, [PROGRAM.length, active])

  if (loading || PROGRAM.length === 0) {
    return <section id="programme" style={{ background: 'var(--cream)', paddingTop: 128, paddingBottom: 128 }} />
  }

  const activeStep = PROGRAM[active]
  const NUM = PROGRAM.length
  const wheelRotation = -(active * (360 / NUM))
  const ROMANS = ['I','II','III','IV','V','VI','VII','VIII','IX','X']

  return (
    <section
      id="programme"
      ref={sectionRef}
      style={{ position: 'relative', padding: '96px 0', overflow: 'hidden', background: 'var(--cream)' }}
    >
      {/* Anneaux fond */}
      {[700, 900, 1100].map((size, i) => (
        <div key={i} style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size, height: size, borderRadius: '50%',
          border: `1px solid rgba(201,168,76,${0.05 - i * 0.01})`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Ornements coins */}
      {[
        { top: 8, left: 8, borderTop: '1px solid rgba(201,168,76,0.3)', borderLeft: '1px solid rgba(201,168,76,0.3)' },
        { top: 8, right: 8, borderTop: '1px solid rgba(201,168,76,0.3)', borderRight: '1px solid rgba(201,168,76,0.3)' },
        { bottom: 8, left: 8, borderBottom: '1px solid rgba(201,168,76,0.3)', borderLeft: '1px solid rgba(201,168,76,0.3)' },
        { bottom: 8, right: 8, borderBottom: '1px solid rgba(201,168,76,0.3)', borderRight: '1px solid rgba(201,168,76,0.3)' },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 50, height: 50, pointerEvents: 'none', ...s }} />
      ))}

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
            Le déroulement
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1 }}>
            Programme de la Soirée
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
            <svg width="64" height="2" viewBox="0 0 64 2"><line x1="0" y1="1" x2="56" y2="1" stroke="#C9A84C" strokeWidth="0.8"/><circle cx="62" cy="1" r="1.5" fill="#C9A84C" opacity="0.6"/></svg>
            <span style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(26,26,26,0.4)', textTransform: 'uppercase' }}>30 Mai 2026</span>
            <svg width="64" height="2" viewBox="0 0 64 2"><circle cx="2" cy="1" r="1.5" fill="#C9A84C" opacity="0.6"/><line x1="8" y1="1" x2="64" y2="1" stroke="#C9A84C" strokeWidth="0.8"/></svg>
          </div>
        </div>

        {/* ── Layout desktop : 3 colonnes ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)',
          gridTemplateRows: 'auto',
          alignItems: 'center',
          gap: '40px',
        }}
          className="programme-grid"
        >

          {/* COL 1 — Infos actives */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{ textAlign: 'left' }}
            >
              {/* Numéro romain décoratif */}
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(4rem, 8vw, 7rem)',
                fontWeight: 300,
                color: 'rgba(201,168,76,0.1)',
                lineHeight: 1,
                userSelect: 'none',
                marginBottom: '8px',
              }}>
                {ROMANS[active] || (active + 1)}
              </div>

              {/* Heure */}
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 300,
                color: 'rgba(201,168,76,0.35)',
                lineHeight: 1,
                marginBottom: '12px',
              }}>
                {activeStep.time}
              </p>

              {/* Titre */}
              <h3 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 400,
                lineHeight: 1.2,
                color: '#1A1A1A',
                marginBottom: '6px',
              }}>
                {activeStep.title}
              </h3>

              {/* Sous-titre */}
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
                color: '#C9A84C',
                marginBottom: '16px',
              }}>
                {activeStep.subtitle}
              </p>

              {/* Description */}
              <p style={{
                fontFamily: 'Jost, sans-serif',
                fontWeight: 300,
                fontSize: 'clamp(11px, 1.4vw, 13px)',
                lineHeight: 1.8,
                color: 'rgba(26,26,26,0.55)',
                marginBottom: '28px',
                maxWidth: 340,
              }}>
                {activeStep.description}
              </p>

              {/* Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {PROGRAM.map((_, i) => (
                  <button key={i} onClick={() => setActive(i)} style={{
                    width: i === active ? 28 : 8,
                    height: 3,
                    background: i === active ? '#C9A84C' : 'rgba(201,168,76,0.25)',
                    transition: 'all 0.4s ease',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }} />
                ))}
              </div>

              {/* Flèches */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setActive(p => Math.max(p - 1, 0))}
                  disabled={active === 0}
                  style={{
                    width: 40, height: 40,
                    border: '1px solid rgba(201,168,76,0.3)',
                    background: 'transparent',
                    color: active === 0 ? 'rgba(201,168,76,0.2)' : '#C9A84C',
                    cursor: active === 0 ? 'default' : 'pointer',
                    fontSize: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s',
                  }}
                >←</button>
                <button
                  onClick={() => setActive(p => Math.min(p + 1, PROGRAM.length - 1))}
                  disabled={active === PROGRAM.length - 1}
                  style={{
                    width: 40, height: 40,
                    border: '1px solid rgba(201,168,76,0.3)',
                    background: active < PROGRAM.length - 1 ? '#C9A84C' : 'transparent',
                    color: active < PROGRAM.length - 1 ? '#1A1A1A' : 'rgba(201,168,76,0.2)',
                    cursor: active === PROGRAM.length - 1 ? 'default' : 'pointer',
                    fontSize: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s',
                  }}
                >→</button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* COL 2 — La Roue */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg
              width={SVG_SIZE}
              height={SVG_SIZE}
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              style={{ overflow: 'visible', width: '100%', maxWidth: SVG_SIZE }}
            >
              <WheelTicks cx={CENTER_X} cy={CENTER_Y} outerR={WHEEL_RADIUS} count={60} />
              <circle cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS + 5} fill="none" stroke="rgba(201,168,76,0.14)" strokeWidth="1" />

              <motion.g
                animate={{ rotate: wheelRotation }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
              >
                {PROGRAM.map((step, i) => {
                  const isActive = i === active
                  return (
                    <motion.path
                      key={i}
                      d={getSegmentPath(i, NUM, WHEEL_RADIUS, CENTER_X, CENTER_Y)}
                      fill={isActive ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.03)'}
                      stroke={isActive ? '#C9A84C' : 'rgba(201,168,76,0.3)'}
                      strokeWidth={isActive ? 1.5 : 0.8}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActive(i)}
                    />
                  )
                })}

                {PROGRAM.map((step, i) => {
                  const pos = getLabelPos(i, NUM, WHEEL_RADIUS, CENTER_X, CENTER_Y)
                  const isActive = i === active
                  const angle = ((2 * Math.PI) / NUM) * i - Math.PI / 2 + (Math.PI / NUM)
                  const deg = (angle * 180) / Math.PI + 90
                  return (
                    <g key={`label-${i}`} style={{ cursor: 'pointer' }} onClick={() => setActive(i)}
                      transform={`rotate(${deg}, ${pos.x}, ${pos.y})`}>
                      <text x={pos.x} y={pos.y - 7} textAnchor="middle" dominantBaseline="middle"
                        fill={isActive ? '#C9A84C' : 'rgba(201,168,76,0.5)'}
                        style={{ fontFamily: 'Jost, sans-serif', fontSize: '12px', fontWeight: isActive ? 700 : 500, letterSpacing: '0.06em' }}>
                        {step.time}
                      </text>
                      <text x={pos.x} y={pos.y + 9} textAnchor="middle" dominantBaseline="middle"
                        fill={isActive ? 'rgba(26,26,26,0.8)' : 'rgba(26,26,26,0.35)'}
                        style={{ fontFamily: 'Jost, sans-serif', fontSize: '9px', letterSpacing: '0.04em' }}>
                        {step.title?.split(' ').slice(0, 2).join(' ')}
                      </text>
                    </g>
                  )
                })}
              </motion.g>

              {/* Aiguille fixe en haut */}
              <polygon
                points={`${CENTER_X},${CENTER_Y - WHEEL_RADIUS - 6} ${CENTER_X - 6},${CENTER_Y - WHEEL_RADIUS + 16} ${CENTER_X + 6},${CENTER_Y - WHEEL_RADIUS + 16}`}
                fill="#C9A84C" opacity={0.9}
              />

              {/* Disque centre */}
              <circle cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS * 0.38} fill="var(--cream)" stroke="rgba(201,168,76,0.3)" strokeWidth="1" />
              <circle cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS * 0.30} fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="0.8" />

              {/* Contenu central */}
              <AnimatePresence mode="wait">
                <motion.g key={active} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
                  <text x={CENTER_X} y={CENTER_Y - 12} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '28px' }}>
                    {activeStep.icon}
                  </text>
                  <text x={CENTER_X} y={CENTER_Y + 16} textAnchor="middle" fill="rgba(201,168,76,0.6)"
                    style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '10px', letterSpacing: '0.3em' }}>
                    {String(active + 1).padStart(2, '0')}/{String(NUM).padStart(2, '0')}
                  </text>
                </motion.g>
              </AnimatePresence>

              <circle cx={CENTER_X} cy={CENTER_Y} r="5" fill="#C9A84C" />
              <circle cx={CENTER_X} cy={CENTER_Y} r="10" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="1" />
            </svg>

            {/* Anneau tournant */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                width: (WHEEL_RADIUS + 32) * 2,
                height: (WHEEL_RADIUS + 32) * 2,
                borderRadius: '50%',
                border: '1px dashed rgba(201,168,76,0.18)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* COL 3 — Timeline verticale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} className="timeline-col">
            {PROGRAM.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActive(idx)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}
              >
                {/* Dot + ligne */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: idx === active ? 10 : 6,
                    height: idx === active ? 10 : 6,
                    borderRadius: '50%',
                    background: idx === active ? '#C9A84C' : 'rgba(201,168,76,0.22)',
                    border: idx === active ? '2px solid rgba(201,168,76,0.35)' : 'none',
                    boxSizing: 'content-box',
                    transition: 'all 0.3s',
                    marginTop: 3,
                    flexShrink: 0,
                  }} />
                  {idx < PROGRAM.length - 1 && (
                    <div style={{
                      width: 1,
                      height: 28,
                      background: idx < active
                        ? 'linear-gradient(to bottom, #C9A84C, rgba(201,168,76,0.25))'
                        : 'rgba(201,168,76,0.12)',
                      transition: 'all 0.3s',
                    }} />
                  )}
                </div>

                <div style={{ paddingBottom: idx < PROGRAM.length - 1 ? 14 : 0 }}>
                  <p style={{
                    fontFamily: 'Jost, sans-serif',
                    fontSize: '8px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: idx === active ? '#C9A84C' : 'rgba(201,168,76,0.35)',
                    fontWeight: idx === active ? 600 : 300,
                    lineHeight: 1,
                    marginBottom: '2px',
                    transition: 'color 0.3s',
                  }}>
                    {step.time}
                  </p>
                  <p style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '13px',
                    color: idx === active ? 'rgba(26,26,26,0.85)' : 'rgba(26,26,26,0.32)',
                    lineHeight: 1.3,
                    transition: 'color 0.3s',
                  }}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hint scroll — desktop seulement */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(26,26,26,0.25)', textTransform: 'uppercase' }}>
            Scroll ou cliquez les segments pour naviguer
          </p>
        </div>
      </div>

      {/* CSS responsive inline */}
      <style>{`
        @media (max-width: 1024px) {
          .programme-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto auto !important;
          }
          .timeline-col {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .timeline-col > div {
            flex-direction: column !important;
            align-items: center !important;
            gap: 4px !important;
            min-width: 60px;
          }
        }
        @media (max-width: 640px) {
          .timeline-col {
            display: none !important;
          }
        }
      `}</style>
    </section>
  )
}