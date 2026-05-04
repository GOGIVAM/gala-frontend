import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgramme } from '../../hooks/useConfig.jsx'

const WHEEL_RADIUS = 200
const CENTER_X = 240
const CENTER_Y = 240

function getSegmentPath(index, total, r, cx, cy, gap = 0.04) {
  const angle = (2 * Math.PI) / total
  const start = angle * index - Math.PI / 2 + gap
  const end = angle * (index + 1) - Math.PI / 2 - gap
  const innerR = r * 0.36

  const x1 = cx + r * Math.cos(start)
  const y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end)
  const y2 = cy + r * Math.sin(end)
  const x3 = cx + innerR * Math.cos(end)
  const y3 = cy + innerR * Math.sin(end)
  const x4 = cx + innerR * Math.cos(start)
  const y4 = cy + innerR * Math.sin(start)

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
        const r1 = outerR + 6
        const r2 = outerR + (isMajor ? 16 : 10)
        return (
          <line
            key={i}
            x1={cx + r1 * Math.cos(angle)}
            y1={cy + r1 * Math.sin(angle)}
            x2={cx + r2 * Math.cos(angle)}
            y2={cy + r2 * Math.sin(angle)}
            stroke={isMajor ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.25)'}
            strokeWidth={isMajor ? 1.8 : 0.8}
          />
        )
      })}
    </>
  )
}

// Aiguille pointant vers le segment actif
function Needle({ active, total, cx, cy, r }) {
  const angle = (2 * Math.PI / total) * active - Math.PI / 2 + Math.PI / total
  const tipX = cx + (r + 22) * Math.cos(angle)
  const tipY = cy + (r + 22) * Math.sin(angle)
  const base1X = cx + 10 * Math.cos(angle + Math.PI / 2)
  const base1Y = cy + 10 * Math.sin(angle + Math.PI / 2)
  const base2X = cx + 10 * Math.cos(angle - Math.PI / 2)
  const base2Y = cy + 10 * Math.sin(angle - Math.PI / 2)
  return (
    <motion.polygon
      points={`${tipX},${tipY} ${base1X},${base1Y} ${base2X},${base2Y}`}
      fill="#C9A84C"
      opacity={0.85}
      animate={{ points: `${tipX},${tipY} ${base1X},${base1Y} ${base2X},${base2Y}` }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    />
  )
}

export default function ProgramWheel() {
  const { programme, loading } = useProgramme()
  const [active, setActive] = useState(0)
  const sectionRef = useRef(null)
  const lastScrollY = useRef(0)
  const scrollLock = useRef(false)
  const accDelta = useRef(0)

  const PROGRAM = (programme && programme.length > 0)
    ? programme.map((p, idx) => ({
        id: idx,
        time: p.time_label,
        title: p.title,
        subtitle: p.subtitle || '',
        description: p.description || '',
        icon: p.icon || '✦',
        color: '#C9A84C',
      }))
    : []

  useEffect(() => {
    if (PROGRAM.length === 0) return
    const section = sectionRef.current
    if (!section) return

    const onWheel = (e) => {
      const rect = section.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4

      if (!inView) return

      // Si pas au début ou fin → bloquer le scroll de page et avancer la roue
      const atStart = active === 0 && e.deltaY < 0
      const atEnd = active === PROGRAM.length - 1 && e.deltaY > 0

      if (!atStart && !atEnd) {
        e.preventDefault()
      }

      if (scrollLock.current) return

      accDelta.current += e.deltaY

      if (Math.abs(accDelta.current) > 80) {
        if (accDelta.current > 0) {
          setActive((prev) => {
            const next = Math.min(prev + 1, PROGRAM.length - 1)
            return next
          })
        } else {
          setActive((prev) => {
            const next = Math.max(prev - 1, 0)
            return next
          })
        }
        accDelta.current = 0
        scrollLock.current = true
        setTimeout(() => { scrollLock.current = false }, 500)
      }
    }

    section.addEventListener('wheel', onWheel, { passive: false })
    return () => section.removeEventListener('wheel', onWheel)
  }, [PROGRAM.length, active])

  if (loading || PROGRAM.length === 0) {
    return <section id="programme" style={{ background: 'var(--cream)' }} className="py-32" />
  }

  const activeStep = PROGRAM[active]
  const NUM = PROGRAM.length
  const SVG_SIZE = 480

  // Rotation de la roue : on aligne le segment actif vers le haut
  const wheelRotation = -(active * (360 / NUM))

  return (
    <section
      id="programme"
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
      style={{ background: 'var(--cream)' }}
    >
      {/* Anneaux décoratifs fond */}
      {[800, 1000, 1200].map((size, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size, height: size,
            borderRadius: '50%',
            border: `1px solid rgba(201,168,76,${0.05 - i * 0.01})`,
          }}
        />
      ))}

      {/* Ornements coins */}
      {[
        { top: 8, left: 8, bt: '1px solid #C9A84C', bl: '1px solid #C9A84C' },
        { top: 8, right: 8, bt: '1px solid #C9A84C', br: '1px solid #C9A84C' },
        { bottom: 8, left: 8, bb: '1px solid #C9A84C', bl: '1px solid #C9A84C' },
        { bottom: 8, right: 8, bb: '1px solid #C9A84C', br: '1px solid #C9A84C' },
      ].map((s, i) => (
        <div key={i} className="absolute pointer-events-none opacity-30" style={{
          width: 60, height: 60,
          top: s.top, left: s.left, right: s.right, bottom: s.bottom,
          borderTop: s.bt, borderLeft: s.bl, borderRight: s.br, borderBottom: s.bb,
        }} />
      ))}

      <div className="max-w-7xl mx-auto px-6">
        {/* En-tête */}
        <div className="text-center mb-16">
          <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
            Le déroulement
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1 }}>
            Programme de la Soirée
          </h2>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="decorative-line w-16" />
            <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(26,26,26,0.4)', fontFamily: 'Jost', textTransform: 'uppercase' }}>
              30 Mai 2026
            </span>
            <div className="decorative-line w-16" />
          </div>
        </div>

        {/* Layout principal */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">

          {/* GAUCHE — Panneau info */}
          <div className="w-full lg:flex-1 lg:max-w-xs order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="text-center lg:text-left"
              >
                {/* Heure grande */}
                <div className="mb-2">
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 'clamp(3rem, 7vw, 5rem)',
                    fontWeight: 300,
                    color: 'rgba(201,168,76,0.18)',
                    lineHeight: 1,
                  }}>
                    {activeStep.time}
                  </span>
                </div>

                {/* Dots navigation */}
                <div className="flex items-center gap-2 mb-5 justify-center lg:justify-start flex-wrap">
                  {PROGRAM.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      style={{
                        width: i === active ? 24 : 6,
                        height: 2,
                        background: i === active ? '#C9A84C' : 'rgba(201,168,76,0.25)',
                        transition: 'all 0.4s ease',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>

                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 400, lineHeight: 1.2, marginBottom: '4px' }}>
                  {activeStep.title}
                </h3>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem', color: '#C9A84C', marginBottom: '14px' }}>
                  {activeStep.subtitle}
                </p>
                <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '13px', lineHeight: 1.8, color: 'rgba(26,26,26,0.6)', marginBottom: '24px' }}>
                  {activeStep.description}
                </p>

                {/* Compteur + barre */}
                <div className="flex items-center gap-3 mb-5 justify-center lg:justify-start">
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.8rem', color: 'rgba(201,168,76,0.5)', letterSpacing: '0.15em' }}>
                    {String(active + 1).padStart(2, '0')} / {String(NUM).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, maxWidth: 70, height: 1, background: 'rgba(201,168,76,0.2)' }}>
                    <div style={{ height: '100%', width: `${((active + 1) / NUM) * 100}%`, background: '#C9A84C', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                {/* Flèches nav */}
                <div className="flex gap-3 justify-center lg:justify-start">
                  <button
                    onClick={() => setActive((p) => Math.max(p - 1, 0))}
                    disabled={active === 0}
                    style={{
                      width: 38, height: 38,
                      border: '1px solid rgba(201,168,76,0.3)',
                      background: 'transparent',
                      color: active === 0 ? 'rgba(201,168,76,0.2)' : '#C9A84C',
                      cursor: active === 0 ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s', fontSize: '14px',
                    }}
                  >←</button>
                  <button
                    onClick={() => setActive((p) => Math.min(p + 1, PROGRAM.length - 1))}
                    disabled={active === PROGRAM.length - 1}
                    style={{
                      width: 38, height: 38,
                      border: '1px solid rgba(201,168,76,0.3)',
                      background: active < PROGRAM.length - 1 ? '#C9A84C' : 'transparent',
                      color: active < PROGRAM.length - 1 ? '#1A1A1A' : 'rgba(201,168,76,0.2)',
                      cursor: active === PROGRAM.length - 1 ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s', fontSize: '14px',
                    }}
                  >→</button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CENTRE — La Roue */}
          <div className="relative flex-shrink-0 order-1 lg:order-2">
            <svg
              width={SVG_SIZE}
              height={SVG_SIZE}
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              style={{ overflow: 'visible', maxWidth: '92vw', maxHeight: '92vw' }}
            >
              {/* Ticks décoratifs — fixes */}
              <WheelTicks cx={CENTER_X} cy={CENTER_Y} outerR={WHEEL_RADIUS} count={60} />

              {/* Anneau externe fixe */}
              <circle cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS + 5} fill="none" stroke="rgba(201,168,76,0.14)" strokeWidth="1" />

              {/* Groupe rotatif */}
              <motion.g
                animate={{ rotate: wheelRotation }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
              >
                {/* Segments */}
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

                {/* Labels sur segments */}
                {PROGRAM.map((step, i) => {
                  const pos = getLabelPos(i, NUM, WHEEL_RADIUS, CENTER_X, CENTER_Y)
                  const isActive = i === active
                  const angle = ((2 * Math.PI) / NUM) * i - Math.PI / 2 + (Math.PI / NUM)
                  const deg = (angle * 180) / Math.PI + 90
                  return (
                    <g
                      key={`label-${i}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActive(i)}
                      transform={`rotate(${deg}, ${pos.x}, ${pos.y})`}
                    >
                      <text
                        x={pos.x} y={pos.y - 6}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isActive ? '#C9A84C' : 'rgba(201,168,76,0.5)'}
                        style={{ fontFamily: 'Jost, sans-serif', fontSize: '9px', fontWeight: isActive ? 600 : 400, letterSpacing: '0.04em' }}
                      >
                        {step.time}
                      </text>
                      <text
                        x={pos.x} y={pos.y + 8}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isActive ? 'rgba(26,26,26,0.7)' : 'rgba(26,26,26,0.3)'}
                        style={{ fontFamily: 'Jost, sans-serif', fontSize: '7px', letterSpacing: '0.03em' }}
                      >
                        {step.title?.split(' ').slice(0, 2).join(' ')}
                      </text>
                    </g>
                  )
                })}
              </motion.g>

              {/* Aiguille fixe (pointe vers le haut) */}
              <polygon
                points={`${CENTER_X},${CENTER_Y - WHEEL_RADIUS - 8} ${CENTER_X - 7},${CENTER_Y - WHEEL_RADIUS + 18} ${CENTER_X + 7},${CENTER_Y - WHEEL_RADIUS + 18}`}
                fill="#C9A84C"
                opacity={0.9}
              />

              {/* Anneau intérieur */}
              <circle cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS * 0.38} fill="var(--cream)" stroke="rgba(201,168,76,0.3)" strokeWidth="1" />
              <circle cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS * 0.30} fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="0.8" />

              {/* Contenu central — icône + numéro */}
              <AnimatePresence mode="wait">
                <motion.g key={active} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
                  <text x={CENTER_X} y={CENTER_Y - 14} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '26px' }}>
                    {activeStep.icon}
                  </text>
                  <text x={CENTER_X} y={CENTER_Y + 14} textAnchor="middle" fill="rgba(201,168,76,0.6)" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '10px', letterSpacing: '0.2em' }}>
                    {String(active + 1).padStart(2, '0')}/{String(NUM).padStart(2, '0')}
                  </text>
                </motion.g>
              </AnimatePresence>

              {/* Point central */}
              <circle cx={CENTER_X} cy={CENTER_Y} r="4" fill="#C9A84C" />
              <circle cx={CENTER_X} cy={CENTER_Y} r="8" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="1" />
            </svg>

            {/* Anneau tournant décoratif */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              className="absolute pointer-events-none"
              style={{
                top: '50%', left: '50%',
                width: (WHEEL_RADIUS + 36) * 2,
                height: (WHEEL_RADIUS + 36) * 2,
                marginTop: -(WHEEL_RADIUS + 36),
                marginLeft: -(WHEEL_RADIUS + 36),
                borderRadius: '50%',
                border: '1px dashed rgba(201,168,76,0.2)',
              }}
            />

            {/* Hint scroll — visible uniquement si pas au début/fin */}
            {active < PROGRAM.length - 1 && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                className="text-center mt-4"
                style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.25em', color: 'rgba(201,168,76,0.4)', textTransform: 'uppercase' }}
              >
                ↓ Scroll pour avancer
              </motion.p>
            )}
          </div>

          {/* DROITE — Timeline verticale */}
          <div className="hidden lg:flex flex-col items-start justify-center flex-1 max-w-xs order-3 gap-0">
            {/* Numéro romain décoratif */}
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(4rem, 6vw, 7rem)',
              fontWeight: 300,
              color: 'rgba(201,168,76,0.07)',
              lineHeight: 1,
              userSelect: 'none',
              marginBottom: '24px',
              alignSelf: 'center',
            }}>
              {['I','II','III','IV','V','VI','VII','VIII','IX','X'][active] || (active + 1)}
            </div>

            {/* Liste timeline */}
            {PROGRAM.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3"
                style={{ cursor: 'pointer', width: '100%' }}
                onClick={() => setActive(i)}
              >
                {/* Trait + point */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: i === active ? 10 : 6,
                    height: i === active ? 10 : 6,
                    borderRadius: '50%',
                    background: i === active ? '#C9A84C' : 'rgba(201,168,76,0.22)',
                    border: i === active ? '2px solid rgba(201,168,76,0.35)' : 'none',
                    boxSizing: 'content-box',
                    transition: 'all 0.3s',
                    marginTop: 3,
                  }} />
                  {i < PROGRAM.length - 1 && (
                    <div style={{
                      width: 1,
                      height: 32,
                      background: i < active
                        ? 'linear-gradient(to bottom, #C9A84C, rgba(201,168,76,0.25))'
                        : 'rgba(201,168,76,0.12)',
                      transition: 'all 0.3s',
                    }} />
                  )}
                </div>

                {/* Texte */}
                <div style={{ paddingBottom: i < PROGRAM.length - 1 ? 20 : 0 }}>
                  <p style={{
                    fontFamily: 'Jost, sans-serif',
                    fontSize: '9px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: i === active ? '#C9A84C' : 'rgba(201,168,76,0.35)',
                    fontWeight: i === active ? 500 : 300,
                    transition: 'color 0.3s',
                    lineHeight: 1,
                    marginBottom: '3px',
                  }}>
                    {step.time}
                  </p>
                  <p style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '15px',
                    color: i === active ? 'rgba(26,26,26,0.85)' : 'rgba(26,26,26,0.32)',
                    transition: 'color 0.3s',
                    lineHeight: 1.3,
                  }}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}