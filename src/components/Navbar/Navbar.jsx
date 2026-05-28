import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogIn, QrCode } from 'lucide-react'

const links = [
  { label: 'Accueil', href: '#hero' },
  { label: 'Programme', href: '#programme' },
  { label: 'Billetterie', href: '#billetterie' },
  { label: 'Awards', href: '#awards' },
  { label: 'Informations', href: '#informations' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (href) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          transition: 'all 0.5s',
          background: scrolled ? 'rgba(250,248,243,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : 'none',
          padding: scrolled ? '12px 0' : '24px 0',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <div
            onClick={() => handleNav('#hero')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <img
              src="/logo_gala.png"
              alt="Éclat & Élégance"
              style={{
                height: scrolled ? '40px' : '48px',
                width: 'auto',
                transition: 'height 0.5s',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '40px' }}>
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'rgba(26,26,26,0.55)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                  padding: '4px 0',
                  position: 'relative',
                }}
                onMouseEnter={e => e.target.style.color = '#C9A84C'}
                onMouseLeave={e => e.target.style.color = 'rgba(26,26,26,0.55)'}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions desktop */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/scanner')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.4)',
                color: '#C9A84C',
                fontFamily: 'Jost, sans-serif',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              <QrCode size={12} />
              Scanner
            </button>
            <button
              onClick={() => navigate('/admin')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.4)',
                color: '#C9A84C',
                fontFamily: 'Jost, sans-serif',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <LogIn size={12} />
              Admin
            </button>
            <button
              onClick={() => handleNav('#billetterie')}
              style={{
                padding: '10px 24px',
                background: '#1A1A1A',
                color: '#FAF8F3',
                border: 'none',
                fontFamily: 'Jost, sans-serif',
                fontSize: '9px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Réserver
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A' }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', inset: 0,
              zIndex: 40,
              background: '#FAF8F3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '36px',
              paddingTop: '80px',
              overflow: 'hidden',
            }}
          >
            {/* Décor SVG mobile */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
              <circle cx="350" cy="150" r="120" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="1" />
              <circle cx="350" cy="150" r="80" fill="none" stroke="rgba(201,168,76,0.08)" strokeWidth="1" />
              <circle cx="50" cy="650" r="100" fill="none" stroke="rgba(201,168,76,0.08)" strokeWidth="1" />
              <line x1="160" y1="0" x2="160" y2="800" stroke="rgba(201,168,76,0.04)" strokeWidth="1" />
              <line x1="240" y1="0" x2="240" y2="800" stroke="rgba(201,168,76,0.04)" strokeWidth="1" />
            </svg>

            {/* Logo centré */}
            <img
              src="/logo_gala.png"
              alt="Éclat & Élégance"
              style={{ height: '80px', width: 'auto', objectFit: 'contain', marginBottom: '-8px' }}
            />

            {links.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleNav(link.href)}
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontSize: '2rem',
                  fontWeight: 300,
                  color: '#1A1A1A',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {link.label}
              </motion.button>
            ))}

            {/* Boutons Scanner et Admin mobiles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: '12px', marginTop: '8px' }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/scanner')
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(201,168,76,0.4)',
                  color: '#C9A84C',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                <QrCode size={12} />
                Scanner
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/admin')
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(201,168,76,0.4)',
                  color: '#C9A84C',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                <LogIn size={12} />
                Admin
              </button>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => handleNav('#billetterie')}
              style={{
                marginTop: '8px',
                padding: '14px 40px',
                background: '#1A1A1A',
                color: '#FAF8F3',
                border: 'none',
                fontFamily: 'Jost, sans-serif',
                fontSize: '10px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Réserver ma place
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}