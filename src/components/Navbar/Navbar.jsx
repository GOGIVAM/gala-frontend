import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-cream/95 backdrop-blur-md border-b border-gold/20 py-3'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex flex-col items-start"
            whileHover={{ opacity: 0.8 }}
          >
            <span
              className="font-display text-lg tracking-widest text-charcoal cursor-pointer"
              style={{ fontStyle: 'italic', lineHeight: 1 }}
              onClick={() => handleNav('#hero')}
            >
              Éclat & Élégance
            </span>
            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-gold mt-0.5">
              Promo 2 · 2026
            </span>
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="nav-link"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNav('#billetterie')}
              className="hidden md:block btn-primary text-[10px]"
            >
              Réserver
            </button>
            <button
              className="md:hidden text-charcoal"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-cream flex flex-col items-center justify-center gap-10 pt-20"
          >
            {/* Decorative gold circles */}
            <div className="absolute top-1/4 right-8 w-40 h-40 gold-circle opacity-20" />
            <div className="absolute bottom-1/4 left-8 w-24 h-24 gold-circle opacity-10" />

            {links.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleNav(link.href)}
                className="font-display text-3xl font-light text-charcoal hover:text-gold transition-colors"
                style={{ fontStyle: 'italic' }}
              >
                {link.label}
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => handleNav('#billetterie')}
              className="btn-primary mt-4"
            >
              Réserver ma place
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
