import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PROGRAM = [
  {
    id: 0,
    time: '19h00',
    title: 'L\'Arrivée',
    subtitle: 'La Révélation',
    description:
      'Les portes s\'ouvrent. Chaque invité franchit le seuil comme une scène. Contrôle QR Code, accueil personnalisé, et la première note de musique brise le quotidien.',
    icon: '✦',
    color: '#C9A84C',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=80',
  },
  {
    id: 1,
    time: '19h30',
    title: 'Cocktail',
    subtitle: 'Les Retrouvailles',
    description:
      'Moment libre et photographique. Ambiance musicale lounge, fond photobooth Noir & Or. Les souvenirs de promotion se cristallisent pour la dernière fois dans un cadre commun.',
    icon: '◈',
    color: '#B8962E',
    image: 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=600&q=80',
  },
  {
    id: 2,
    time: '20h30',
    title: 'Dîner',
    subtitle: 'La Célébration',
    description:
      'Tables dressées, discours des représentants, hommage aux formateurs. Chaque table porte le nom d\'un grand ingénieur ou d\'une invention majeure.',
    icon: '◇',
    color: '#C9A84C',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  },
  {
    id: 3,
    time: '22h00',
    title: 'Engineer Awards',
    subtitle: 'La Consécration',
    description:
      'Point culminant de la soirée. Les lauréats sont révélés dans une mise en scène soignée. Catégories sérieuses et légères pour maintenir l\'énergie à son maximum.',
    icon: '★',
    color: '#E8D5A3',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  },
  {
    id: 4,
    time: '23h00',
    title: 'Soirée Dansante',
    subtitle: 'L\'Évasion',
    description:
      'Le protocole se lève, la fête commence vraiment. Transition musicale marquée. C\'est la liberté après l\'excellence.',
    icon: '◉',
    color: '#C9A84C',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
  },
]

const WHEEL_RADIUS = 160
const CENTER_X = 200
const CENTER_Y = 200
const NUM = PROGRAM.length

function getSegmentPath(index, total, r, cx, cy, gap = 0.06) {
  const angle = (2 * Math.PI) / total
  const start = angle * index - Math.PI / 2 + gap
  const end = angle * (index + 1) - Math.PI / 2 - gap
  const innerR = r * 0.42

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
  const lr = r * 0.72
  return { x: cx + lr * Math.cos(mid), y: cy + lr * Math.sin(mid) }
}

export default function ProgramWheel() {
  const [active, setActive] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const sectionRef = useRef(null)
  const wheelRef = useRef(null)
  const scrollLock = useRef(false)

  // Scroll-driven wheel advancement
  useEffect(() => {
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
          setIsScrolling(true)
          if (delta > 0) {
            setActive((prev) => Math.min(prev + 1, PROGRAM.length - 1))
          } else {
            setActive((prev) => Math.max(prev - 1, 0))
          }
          lastScrollY = window.scrollY
          scrollLock.current = true
          setTimeout(() => {
            scrollLock.current = false
            lastScrollY = window.scrollY
            setIsScrolling(false)
          }, 600)
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeStep = PROGRAM[active]

  return (
    <section
      id="programme"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{ background: 'var(--cream)' }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%', right: '-5%',
          width: 400, height: 400,
          borderRadius: '70% 30% 30% 70%',
          border: '1px solid rgba(201,168,76,0.1)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20 reveal">
          <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
            Le déroulement
          </p>
          <h2
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1 }}
          >
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

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* LEFT — Info Panel */}
          <div className="flex-1 max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Time */}
                <div className="flex items-center gap-4 mb-4">
                  <span
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '4rem',
                      fontWeight: 300,
                      color: 'rgba(201,168,76,0.25)',
                      lineHeight: 1,
                    }}
                  >
                    {activeStep.time}
                  </span>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-6">
                  {PROGRAM.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      style={{
                        width: i === active ? 32 : 8,
                        height: 2,
                        background: i === active ? '#C9A84C' : 'rgba(201,168,76,0.25)',
                        transition: 'all 0.4s ease',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>

                <h3
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: 400,
                    lineHeight: 1.2,
                    marginBottom: '4px',
                  }}
                >
                  {activeStep.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: 'italic',
                    fontSize: '1.1rem',
                    color: '#C9A84C',
                    marginBottom: '20px',
                  }}
                >
                  {activeStep.subtitle}
                </p>
                <p
                  style={{
                    fontFamily: 'Jost, sans-serif',
                    fontWeight: 300,
                    fontSize: '14px',
                    lineHeight: 1.8,
                    color: 'rgba(26,26,26,0.65)',
                    marginBottom: '32px',
                  }}
                >
                  {activeStep.description}
                </p>

                {/* Nav buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setActive((p) => Math.max(p - 1, 0))}
                    disabled={active === 0}
                    style={{
                      width: 40, height: 40,
                      border: '1px solid rgba(201,168,76,0.3)',
                      background: 'transparent',
                      color: active === 0 ? 'rgba(201,168,76,0.2)' : '#C9A84C',
                      cursor: active === 0 ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s',
                      fontSize: '14px',
                    }}
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setActive((p) => Math.min(p + 1, PROGRAM.length - 1))}
                    disabled={active === PROGRAM.length - 1}
                    style={{
                      width: 40, height: 40,
                      border: '1px solid rgba(201,168,76,0.3)',
                      background: active < PROGRAM.length - 1 ? '#C9A84C' : 'transparent',
                      color: active < PROGRAM.length - 1 ? '#1A1A1A' : 'rgba(201,168,76,0.2)',
                      cursor: active === PROGRAM.length - 1 ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s',
                      fontSize: '14px',
                    }}
                  >
                    →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CENTER — The Wheel */}
          <div className="relative flex-shrink-0" ref={wheelRef}>
            <svg
              width="400"
              height="400"
              viewBox="0 0 400 400"
              style={{ overflow: 'visible' }}
            >
              {/* Outer ring */}
              <circle cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS + 20} fill="none" stroke="rgba(201,168,76,0.08)" strokeWidth="1" />
              <circle cx={CENTER_X} cy={CENTER_Y} r={WHEEL_RADIUS + 35} fill="none" stroke="rgba(201,168,76,0.05)" strokeWidth="1" />

              {/* Segments */}
              {PROGRAM.map((step, i) => {
                const isActive = i === active
                return (
                  <motion.path
                    key={i}
                    d={getSegmentPath(i, NUM, WHEEL_RADIUS, CENTER_X, CENTER_Y)}
                    fill={isActive ? '#1A1A1A' : 'transparent'}
                    stroke={isActive ? '#C9A84C' : 'rgba(201,168,76,0.3)'}
                    strokeWidth={isActive ? 1.5 : 1}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActive(i)}
                    animate={{
                      scale: isActive ? 1.04 : 1,
                      filter: isActive ? 'drop-shadow(0 0 12px rgba(201,168,76,0.4))' : 'none',
                    }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ fill: isActive ? '#1A1A1A' : 'rgba(201,168,76,0.06)' }}
                  />
                )
              })}

              {/* Labels on segments */}
              {PROGRAM.map((step, i) => {
                const pos = getLabelPos(i, NUM, WHEEL_RADIUS, CENTER_X, CENTER_Y)
                const isActive = i === active
                return (
                  <g key={`label-${i}`} style={{ cursor: 'pointer' }} onClick={() => setActive(i)}>
                    <text
                      x={pos.x}
                      y={pos.y - 8}
                      textAnchor="middle"
                      fill={isActive ? '#C9A84C' : 'rgba(201,168,76,0.5)'}
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '9px',
                        fontStyle: 'italic',
                        transition: 'all 0.4s',
                      }}
                    >
                      {step.time}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 8}
                      textAnchor="middle"
                      fill={isActive ? '#FAF8F3' : 'rgba(26,26,26,0.5)'}
                      style={{
                        fontFamily: 'Jost, sans-serif',
                        fontSize: '8px',
                        fontWeight: 500,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        transition: 'all 0.4s',
                      }}
                    >
                      {step.title}
                    </text>
                  </g>
                )
              })}

              {/* Center circle */}
              <circle
                cx={CENTER_X} cy={CENTER_Y}
                r={WHEEL_RADIUS * 0.38}
                fill="var(--cream)"
                stroke="rgba(201,168,76,0.3)"
                strokeWidth="1"
              />
              <circle
                cx={CENTER_X} cy={CENTER_Y}
                r={WHEEL_RADIUS * 0.32}
                fill="var(--cream)"
                stroke="rgba(201,168,76,0.15)"
                strokeWidth="1"
              />

              {/* Center Icon */}
              <AnimatePresence mode="wait">
                <motion.text
                  key={`icon-${active}`}
                  x={CENTER_X} y={CENTER_Y + 6}
                  textAnchor="middle"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                  fill="#C9A84C"
                  style={{ fontSize: '1.8rem' }}
                >
                  {activeStep.icon}
                </motion.text>
              </AnimatePresence>

              {/* Progress arc */}
              {(() => {
                const progress = (active + 1) / NUM
                const circumference = 2 * Math.PI * (WHEEL_RADIUS + 10)
                return (
                  <circle
                    cx={CENTER_X} cy={CENTER_Y}
                    r={WHEEL_RADIUS + 10}
                    fill="none"
                    stroke="#C9A84C"
                    strokeWidth="1.5"
                    strokeDasharray={`${circumference * progress} ${circumference * (1 - progress)}`}
                    strokeDashoffset={circumference * 0.25}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)', transform: 'rotate(-90deg)', transformOrigin: '200px 200px' }}
                  />
                )
              })()}
            </svg>

            {/* Scroll hint */}
            <p
              style={{
                textAlign: 'center',
                fontSize: '9px',
                letterSpacing: '0.2em',
                color: 'rgba(201,168,76,0.5)',
                textTransform: 'uppercase',
                fontFamily: 'Jost, sans-serif',
                marginTop: '16px',
              }}
            >
              ↕ Scrollez pour naviguer
            </p>
          </div>

          {/* RIGHT — Photo */}
          <div className="flex-1 max-w-sm hidden xl:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${active}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div
                  style={{
                    borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                    overflow: 'hidden',
                    aspectRatio: '3/4',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.15)',
                  }}
                >
                  <img
                    src={activeStep.image}
                    alt={activeStep.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to bottom, transparent 40%, rgba(26,26,26,0.4))',
                    }}
                  />
                </div>
                {/* Gold accent circle */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-20px', right: '-20px',
                    width: 100, height: 100,
                    borderRadius: '50%',
                    border: '1px solid rgba(201,168,76,0.3)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '20px', left: '-30px',
                    width: 60, height: 60,
                    borderRadius: '50%',
                    border: '1px solid rgba(201,168,76,0.2)',
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
