import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgramme } from '../../hooks/useConfig.jsx'

const WHEEL_RADIUS = 140
const CENTER_X = 180
const CENTER_Y = 180

function getSegmentPath(index, total, r, cx, cy, gap = 0.05) {
  const angle = (2 * Math.PI) / total
  const start = angle * index - Math.PI / 2 + gap
  const end = angle * (index + 1) - Math.PI / 2 - gap
  const innerR = r * 0.38

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
  const lr = r * 0.70
  return { x: cx + lr * Math.cos(mid), y: cy + lr * Math.sin(mid) }
}

function getIconPos(index, total, r, cx, cy) {
  const angle = (2 * Math.PI) / total
  const mid = angle * index - Math.PI / 2 + angle / 2
  const lr = r * 0.70
  return { x: cx + lr * Math.cos(mid), y: cy + lr * Math.sin(mid) }
}

// Decorative tick marks around the wheel
function WheelTicks({ cx, cy, outerR, count = 60 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2
        const isMajor = i % (count / 8) === 0
        const r1 = outerR + 6
        const r2 = outerR + (isMajor ? 14 : 9)
        return (
          <line
            key={i}
            x1={cx + r1 * Math.cos(angle)}
            y1={cy + r1 * Math.sin(angle)}
            x2={cx + r2 * Math.cos(angle)}
            y2={cy + r2 * Math.sin(angle)}
            stroke={isMajor ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.2)'}
            strokeWidth={isMajor ? 1.5 : 0.8}
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

    let lastScrollY = window.scrollY

    const onScroll = () => {
      if (scrollLock.current) return
      const rect = section.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5

      if (inView) {
        const delta = window.scrollY - lastScrollY
        if (Math.abs(delta) > 60) {
          if (delta > 0) setActive((prev) => Math.min(prev + 1, PROGRAM.length - 1))
          else setActive((prev) => Math.max(prev - 1, 0))
          lastScrollY = window.scrollY
          scrollLock.current = true
          setTimeout(() => {
            scrollLock.current = false
            lastScrollY = window.scrollY
          }, 600)
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [PROGRAM.length])

  if (loading || PROGRAM.length === 0) {
    return <section id="programme" style={{ background: 'var(--cream)' }} className="py-32" />
  }

  const activeStep = PROGRAM[active]
  const NUM = PROGRAM.length
  const SVG_SIZE = 360

  return (
    <section
      id="programme"
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
      style={{ background: 'var(--cream)' }}
    >
      {/* Decorative background rings */}
      <div className="absolute pointer-events-none" style={{
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700, height: 700,
        borderRadius: '50%',
        border: '1px solid rgba(201,168,76,0.06)',
      }} />
      <div className="absolute pointer-events-none" style={{
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900, height: 900,
        borderRadius: '50%',
        border: '1px solid rgba(201,168,76,0.04)',
      }} />

      {/* Corner ornaments */}
      <div className="absolute top-8 left-8 pointer-events-none opacity-30"
        style={{ width: 60, height: 60, borderTop: '1px solid #C9A84C', borderLeft: '1px solid #C9A84C' }} />
      <div className="absolute top-8 right-8 pointer-events-none opacity-30"
        style={{ width: 60, height: 60, borderTop: '1px solid #C9A84C', borderRight: '1px solid #C9A84C' }} />
      <div className="absolute bottom-8 left-8 pointer-events-none opacity-30"
        style={{ width: 60, height: 60, borderBottom: '1px solid #C9A84C', borderLeft: '1px solid #C9A84C' }} />
      <div className="absolute bottom-8 right-8 pointer-events-none opacity-30"
        style={{ width: 60, height: 60, borderBottom: '1px solid #C9A84C', borderRight: '1px solid #C9A84C' }} />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <p style={{
            fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em',
            color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px',
          }}>
            Le déroulement
          </p>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif', fontWeight: 300,
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1,
          }}>
            Programme de la Soirée
          </h2>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="decorative-line w-16" />
            <span style={{
              fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(26,26,26,0.4)',
              fontFamily: 'Jost', textTransform: 'uppercase',
            }}>
              30 Mai 2026
            </span>
            <div className="decorative-line w-16" />
          </div>
        </div>

        {/* Main layout — stacks on mobile, side-by-side on lg */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">

          {/* LEFT — Info Panel */}
          <div className="w-full lg:flex-1 lg:max-w-sm order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="text-center lg:text-left"
              >
                {/* Time */}
                <div className="flex items-center gap-4 mb-3 justify-center lg:justify-start">
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 'clamp(3rem, 8vw, 4.5rem)',
                    fontWeight: 300,
                    color: 'rgba(201,168,76,0.22)',
                    lineHeight: 1,
                  }}>
                    {activeStep.time}
                  </span>
                </div>

                {/* Step dots */}
                <div className="flex items-center gap-3 mb-5 justify-center lg:justify-start">
                  {PROGRAM.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      style={{
                        width: i === active ? 28 : 7,
                        height: 2,
                        background: i === active ? '#C9A84C' : 'rgba(201,168,76,0.25)',
                        transition: 'all 0.4s ease',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                  ))}
                </div>

                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  fontWeight: 400,
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}>
                  {activeStep.title}
                </h3>

                <p style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontSize: '1rem',
                  color: '#C9A84C',
                  marginBottom: '16px',
                }}>
                  {activeStep.subtitle}
                </p>

                <p style={{
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: 300,
                  fontSize: '13px',
                  lineHeight: 1.8,
                  color: 'rgba(26,26,26,0.6)',
                  marginBottom: '28px',
                }}>
                  {activeStep.description}
                </p>

                {/* Step counter */}
                <div className="flex items-center gap-3 mb-5 justify-center lg:justify-start">
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '0.85rem',
                    color: 'rgba(201,168,76,0.5)',
                    letterSpacing: '0.15em',
                  }}>
                    {String(active + 1).padStart(2, '0')} / {String(NUM).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, maxWidth: 80, height: 1, background: 'rgba(201,168,76,0.2)' }}>
                    <div style={{
                      height: '100%',
                      width: `${((active + 1) / NUM) * 100}%`,
                      background: '#C9A84C',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>

                {/* Nav buttons */}
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
                      transition: 'all 0.3s',
                      fontSize: '14px',
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
                      transition: 'all 0.3s',
                      fontSize: '14px',
                    }}
                  >→</button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CENTER — The Wheel */}
          <div className="relative flex-shrink-0 order-1 lg:order-2">
            <svg
              width={SVG_SIZE}
              height={SVG_SIZE}
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              style={{ overflow: 'visible', maxWidth: '90vw' }}
            >
              {/* Outer decorative tick ring */}
              <WheelTicks cx={CENTER_X} cy={CENTER_Y} outerR={WHEEL_RADIUS} count={48} />

              {/* Outer faint ring */}
              <circle
                cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS + 4}
                fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="1"
              />

              {/* Segments */}
              {PROGRAM.map((step, i) => {
                const isActive = i === active
                return (
                  <motion.path
                    key={i}
                    d={getSegmentPath(i, NUM, WHEEL_RADIUS, CENTER_X, CENTER_Y)}
                    fill={isActive ? 'rgba(201,168,76,0.13)' : 'transparent'}
                    stroke={isActive ? '#C9A84C' : 'rgba(201,168,76,0.25)'}
                    strokeWidth={isActive ? 1.5 : 0.8}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActive(i)}
                    animate={{ fill: isActive ? 'rgba(201,168,76,0.13)' : 'transparent' }}
                    transition={{ duration: 0.3 }}
                  />
                )
              })}

              {/* Labels + icon on segments */}
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
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isActive ? '#C9A84C' : 'rgba(201,168,76,0.45)'}
                      style={{
                        fontFamily: 'Jost, sans-serif',
                        fontSize: '8px',
                        fontWeight: isActive ? 600 : 400,
                        letterSpacing: '0.04em',
                        transition: 'fill 0.3s',
                      }}
                    >
                      {step.time}
                    </text>
                  </g>
                )
              })}

              {/* Inner ring */}
              <circle
                cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS * 0.41}
                fill="var(--cream)" stroke="rgba(201,168,76,0.25)" strokeWidth="1"
              />

              {/* Second inner decorative ring */}
              <circle
                cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS * 0.33}
                fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="0.8"
              />

              {/* Center content — active icon + step */}
              <text
                x={CENTER_X} y={CENTER_Y - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '20px' }}
              >
                {activeStep.icon}
              </text>
              <text
                x={CENTER_X} y={CENTER_Y + 16}
                textAnchor="middle"
                fill="rgba(201,168,76,0.5)"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                }}
              >
                {String(active + 1).padStart(2, '0')}/{String(NUM).padStart(2, '0')}
              </text>

              {/* Center dot */}
              <circle cx={CENTER_X} cy={CENTER_Y} r="3" fill="#C9A84C" />
            </svg>

            {/* Rotating gold ring animation */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute pointer-events-none"
              style={{
                top: '50%', left: '50%',
                width: (WHEEL_RADIUS + 28) * 2,
                height: (WHEEL_RADIUS + 28) * 2,
                marginTop: -(WHEEL_RADIUS + 28),
                marginLeft: -(WHEEL_RADIUS + 28),
                borderRadius: '50%',
                border: '1px dashed rgba(201,168,76,0.18)',
              }}
            />
          </div>

          {/* RIGHT — decorative ornament panel (no image) */}
          <div className="hidden lg:flex flex-col items-center justify-center flex-1 max-w-sm order-3 gap-8">
            {/* Roman numeral display */}
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(5rem, 8vw, 8rem)',
              fontWeight: 300,
              color: 'rgba(201,168,76,0.08)',
              lineHeight: 1,
              userSelect: 'none',
            }}>
              {['I','II','III','IV','V','VI','VII','VIII','IX','X'][active] || (active + 1)}
            </div>

            {/* Vertical timeline strip */}
            <div className="flex flex-col items-center gap-0">
              {PROGRAM.map((step, i) => (
                <div key={i} className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => setActive(i)}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      width: i === active ? 8 : 5,
                      height: i === active ? 8 : 5,
                      borderRadius: '50%',
                      background: i === active ? '#C9A84C' : 'rgba(201,168,76,0.25)',
                      transition: 'all 0.3s',
                      border: i === active ? '2px solid rgba(201,168,76,0.3)' : 'none',
                      boxSizing: 'content-box',
                    }} />
                    {i < PROGRAM.length - 1 && (
                      <div style={{
                        width: 1,
                        height: 28,
                        background: i < active
                          ? 'linear-gradient(to bottom, #C9A84C, rgba(201,168,76,0.3))'
                          : 'rgba(201,168,76,0.15)',
                        transition: 'all 0.3s',
                      }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < PROGRAM.length - 1 ? 28 : 0 }}>
                    <p style={{
                      fontFamily: 'Jost, sans-serif',
                      fontSize: '10px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: i === active ? '#C9A84C' : 'rgba(201,168,76,0.4)',
                      transition: 'color 0.3s',
                      fontWeight: i === active ? 500 : 300,
                    }}>
                      {step.time}
                    </p>
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '14px',
                      color: i === active ? 'rgba(26,26,26,0.8)' : 'rgba(26,26,26,0.35)',
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
      </div>
    </section>
  )
}