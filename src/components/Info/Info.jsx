import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, UtensilsCrossed, Shirt, ExternalLink } from 'lucide-react'

const MENU = [
  { course: 'Entrée', items: ['Velouté de champignons truffe', 'Salade César aux crevettes grillées'], icon: '◇' },
  { course: 'Plat Principal', items: ['Filet de bœuf en croûte dorée', 'Suprême de volaille aux herbes', 'Option végétarienne sur demande'], icon: '◈' },
  { course: 'Dessert', items: ['Fondant au chocolat noir & caramel', 'Coupe de fruits exotiques', 'Café gourmand'], icon: '✦' },
  { course: 'Boissons', items: ['Eau minérale & pétillante', 'Jus de fruits frais', 'Boissons soft incluses'], icon: '◉' },
]

const DRESSCODE = [
  { rule: 'Messieurs', detail: 'Costume sombre, de préférence noir. Chemise blanche ou crème. Nœud papillon ou cravate dorée.', required: true },
  { rule: 'Mesdames', detail: 'Robe de soirée ou ensemble élégant. Couleurs : noir, blanc, champagne, or. Talons ou chaussures habillées.', required: true },
  { rule: 'Accessoires', detail: 'Bijoux en or ou doré encouragés. Pochette ou clutch de soirée.', required: false },
  { rule: 'À éviter', detail: 'Jeans, baskets, tenues décontractées. Le comité d\'organisation se réserve le droit de refuser l\'accès.', required: false },
]

const tabs = [
  { id: 'map', label: 'Lieu', icon: MapPin },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'dresscode', label: 'Dress Code', icon: Shirt },
]

export default function Info() {
  const [activeTab, setActiveTab] = useState('map')

  return (
    <section id="informations" className="relative py-32" style={{ background: 'var(--cream)' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
            Infos Pratiques
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1 }}>
            Tout ce qu'il faut savoir
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-2 mb-16">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px',
                  background: activeTab === tab.id ? '#1A1A1A' : 'transparent',
                  color: activeTab === tab.id ? '#FAF8F3' : 'rgba(26,26,26,0.4)',
                  border: '1px solid',
                  borderColor: activeTab === tab.id ? '#1A1A1A' : 'rgba(26,26,26,0.1)',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* MAP */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid lg:grid-cols-2 gap-16 items-center"
            >
              <div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, marginBottom: '16px' }}>
                  Le Lieu
                </h3>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#C9A84C', fontSize: '1.1rem', marginBottom: '20px' }}>
                  Cadre moderne et prestigieux
                </p>
                <p style={{ fontFamily: 'Jost', fontWeight: 300, fontSize: '13px', color: 'rgba(26,26,26,0.6)', lineHeight: 1.8, marginBottom: '32px' }}>
                  L'adresse exacte sera communiquée par email à tous les participants confirmés 48h avant l'événement. Le lieu a été sélectionné pour son cadre contemporain et son standing à la hauteur de l'événement.
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Date', value: 'Samedi 30 Mai 2026' },
                    { label: 'Accueil', value: 'À partir de 19h00' },
                    { label: 'Tenue', value: 'Black Tie — Noir & Or' },
                    { label: 'Accès', value: 'Sur présentation QR Code uniquement' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <span style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', minWidth: '80px', paddingTop: '1px' }}>
                        {item.label}
                      </span>
                      <span style={{ fontFamily: 'Jost', fontWeight: 300, fontSize: '13px', color: '#1A1A1A' }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginTop: '32px',
                    background: 'transparent',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: '#C9A84C',
                    padding: '12px 24px',
                    fontFamily: 'Jost, sans-serif',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={12} />
                  Suivre sur Instagram
                </button>
              </div>

              {/* Map placeholder (will be replaced with actual Google Maps) */}
              <div
                style={{
                  aspectRatio: '4/3',
                  background: 'rgba(201,168,76,0.05)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <MapPin size={32} color="rgba(201,168,76,0.4)" style={{ marginBottom: '12px' }} />
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'rgba(201,168,76,0.5)', fontSize: '1.1rem' }}>
                  Lieu à confirmer
                </p>
                <p style={{ fontFamily: 'Jost', fontSize: '10px', color: 'rgba(26,26,26,0.3)', marginTop: '8px', letterSpacing: '0.1em' }}>
                  Carte disponible après confirmation
                </p>
                {/* Corner decorations */}
                <div style={{ position: 'absolute', top: 12, left: 12, width: 20, height: 20, borderTop: '1px solid rgba(201,168,76,0.3)', borderLeft: '1px solid rgba(201,168,76,0.3)' }} />
                <div style={{ position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderBottom: '1px solid rgba(201,168,76,0.3)', borderRight: '1px solid rgba(201,168,76,0.3)' }} />
              </div>
            </motion.div>
          )}

          {/* MENU */}
          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-12">
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, marginBottom: '8px' }}>
                  Menu de la Soirée
                </h3>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#C9A84C' }}>
                  Dîner gastronomique · Service à table
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MENU.map((course, i) => (
                  <motion.div
                    key={course.course}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      background: 'var(--warm-white)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      padding: '32px 24px',
                      position: 'relative',
                    }}
                  >
                    <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '1.2rem', color: 'rgba(201,168,76,0.4)' }}>
                      {course.icon}
                    </div>
                    <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '12px' }}>
                      {course.course}
                    </p>
                    <ul className="space-y-3">
                      {course.items.map((item) => (
                        <li
                          key={item}
                          style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '1rem',
                            fontWeight: 400,
                            lineHeight: 1.4,
                            color: '#1A1A1A',
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontFamily: 'Jost', fontSize: '11px', color: 'rgba(26,26,26,0.35)', marginTop: '24px', fontStyle: 'italic' }}>
                Menu susceptible d'évoluer · Régimes alimentaires spécifiques sur demande à l'inscription
              </p>
            </motion.div>
          )}

          {/* DRESS CODE */}
          {activeTab === 'dresscode' && (
            <motion.div
              key="dresscode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-12">
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, marginBottom: '8px' }}>
                  Black Tie
                </h3>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#C9A84C' }}>
                  Noir & Or — Tenue de Rigueur
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {DRESSCODE.map((item, i) => (
                  <motion.div
                    key={item.rule}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      background: item.required ? '#1A1A1A' : 'var(--warm-white)',
                      border: `1px solid ${item.required ? 'rgba(201,168,76,0.3)' : 'rgba(26,26,26,0.1)'}`,
                      padding: '32px',
                      position: 'relative',
                    }}
                  >
                    {item.required && (
                      <div
                        style={{
                          position: 'absolute', top: 16, right: 16,
                          fontSize: '8px', letterSpacing: '0.2em',
                          color: '#C9A84C', fontFamily: 'Jost',
                          textTransform: 'uppercase',
                          border: '1px solid rgba(201,168,76,0.3)',
                          padding: '3px 8px',
                        }}
                      >
                        Obligatoire
                      </div>
                    )}
                    <h4 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '1.4rem',
                      fontWeight: 400,
                      color: item.required ? '#FAF8F3' : '#1A1A1A',
                      marginBottom: '12px',
                    }}>
                      {item.rule}
                    </h4>
                    <p style={{
                      fontFamily: 'Jost',
                      fontSize: '12px',
                      fontWeight: 300,
                      lineHeight: 1.7,
                      color: item.required ? 'rgba(250,248,243,0.6)' : 'rgba(26,26,26,0.6)',
                    }}>
                      {item.detail}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Reference photos */}
              <div className="photo-asymmetric mt-16 max-w-3xl mx-auto">
                {[
                  'https://images.unsplash.com/photo-1594938298603-c8148c4b4ae4?w=400&q=80',
                  'https://images.unsplash.com/photo-1519657337289-077653f724ed?w=400&q=80',
                  'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=400&q=80',
                ].map((src, i) => (
                  <div key={i} className={`photo-frame ${i === 1 ? 'photo-center' : ''}`} style={{ aspectRatio: i === 1 ? '3/4' : '3/4', overflow: 'hidden', borderRadius: i === 1 ? '50% 50% 50% 50% / 40% 40% 60% 60%' : '2px' }}>
                    <img src={src} alt="Dress code reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
