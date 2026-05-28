import { MessageCircle } from 'lucide-react'
import { useSettings } from '../hooks/useConfig.jsx'

export default function Footer() {
  const { settings } = useSettings()
  const whatsappUrl = settings?.whatsapp_group_url || null

  return (
    <footer style={{ background: '#0F0F0F', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div style={{
              display: 'inline-block',
              marginBottom: '16px',
              border: '1px solid rgba(201,168,76,0.25)',
              padding: '6px',
            }}>
              <img
                src="/logo_gala.png"
                alt="Éclat & Élégance"
                style={{ height: '56px', width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '12px' }}>
              Gala Promotion 2 · 2026
            </p>
            <p style={{ fontFamily: 'Jost', fontSize: '12px', fontWeight: 300, color: 'rgba(250,248,243,0.35)', lineHeight: 1.7 }}>
              Sciences de l'Ingénieur<br />
              30 Mai 2026 · 19h00
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
              Navigation
            </p>
            <div className="space-y-3">
              {['#hero', '#programme', '#billetterie', '#awards', '#informations', '#comite'].map((href) => (
                <button
                  key={href}
                  onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    display: 'block',
                    fontFamily: 'Jost, sans-serif',
                    fontSize: '12px',
                    fontWeight: 300,
                    color: 'rgba(250,248,243,0.4)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.3s',
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={e => e.target.style.color = '#C9A84C'}
                  onMouseLeave={e => e.target.style.color = 'rgba(250,248,243,0.4)'}
                >
                  {href.replace('#', '').charAt(0).toUpperCase() + href.replace('#', '').slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp + Contact */}
          <div>
            <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
              Post-Événement
            </p>
            <p style={{ fontFamily: 'Jost', fontSize: '12px', fontWeight: 300, color: 'rgba(250,248,243,0.4)', lineHeight: 1.7, marginBottom: '16px' }}>
              Photos, souvenirs et récapitulatif de la soirée disponibles sur le groupe WhatsApp officiel.
            </p>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: '#C9A84C',
                  padding: '10px 20px',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={12} />
                Rejoindre le groupe
              </a>
            ) : (
              <p style={{ fontFamily: 'Jost', fontSize: '11px', color: 'rgba(250,248,243,0.2)', fontStyle: 'italic' }}>
                Lien bientôt disponible
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(250,248,243,0.06)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontFamily: 'Jost', fontSize: '10px', color: 'rgba(250,248,243,0.2)', letterSpacing: '0.05em' }}>
            © 2026 Gala Promo 2 — Sciences de l'Ingénieur. Tous droits réservés.
          </p>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.95rem', color: 'rgba(201,168,76,0.4)' }}>
            "Ce soir, on ne célèbre pas une fin. On célèbre un commencement."
          </p>
        </div>
      </div>
    </footer>
  )
}
