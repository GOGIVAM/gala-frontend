import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAwardCategories } from '../hooks/useConfig.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const FALLBACK_CATEGORIES = [
  { id: 'tenue_h',     label: 'Meilleure Tenue Masculine' },
  { id: 'tenue_f',     label: 'Meilleure Tenue Féminine' },
  { id: 'glow_up',     label: 'Meilleur Glow Up' },
  { id: 'camarade',    label: 'Meilleur Camarade' },
  { id: 'influenceur', label: 'Meilleur Influenceur' },
  { id: 'foot',        label: 'Meilleur Joueur de Foot' },
  { id: 'projet_tech', label: 'Meilleur Projet Technique' },
]

// Affiche les initiales si pas de photo
function Avatar({ nom, photoUrl, size = 56, selected = false }) {
  const initials = nom
    ? nom.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  if (photoUrl) {
    return (
      <img
        src={`${API}${photoUrl}`}
        alt={nom}
        style={{
          width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
          border: selected ? '2px solid #C9A84C' : '2px solid rgba(26,26,26,0.08)',
          transition: 'border 0.3s',
        }}
      />
    )
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: selected ? 'rgba(201,168,76,0.15)' : 'rgba(26,26,26,0.05)',
      border: selected ? '2px solid #C9A84C' : '2px solid rgba(26,26,26,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.3s',
    }}>
      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: `${size * 0.35}px`, color: selected ? '#C9A84C' : 'rgba(26,26,26,0.4)' }}>
        {initials}
      </span>
    </div>
  )
}

export default function AwardsPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { categories: rawCategories } = useAwardCategories()

  const CATEGORIES = rawCategories.filter(c => c.active && c.votes_open).length > 0
    ? rawCategories.filter(c => c.active && c.votes_open).map(c => ({
        id: c.name,
        label: c.sub_label ? `${c.label} ${c.sub_label}` : c.label,
      }))
    : FALLBACK_CATEGORIES

  const [nominations, setNominations] = useState({})
  const [loadingCats, setLoadingCats] = useState(new Set())
  const [myVotes, setMyVotes] = useState({})
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Initialiser la première catégorie
  useEffect(() => {
    if (CATEGORIES.length > 0 && !activeCategory) {
      setActiveCategory(CATEGORIES[0].id)
    }
  }, [CATEGORIES.length])

  // Lazy load : charger les nominations à la demande, par catégorie active
  useEffect(() => {
    if (!token || !activeCategory) return
    if (nominations[activeCategory] !== undefined) return // déjà chargé
    loadNominations(activeCategory)
  }, [token, activeCategory])

  const loadNominations = async (categorie) => {
    setLoadingCats(prev => new Set([...prev, categorie]))
    try {
      const res = await axios.get(`${API}/api/awards/nominations/${categorie}`)
      setNominations(prev => ({ ...prev, [categorie]: res.data }))
    } catch {
      setNominations(prev => ({ ...prev, [categorie]: [] }))
    }
    setLoadingCats(prev => {
      const next = new Set(prev)
      next.delete(categorie)
      return next
    })
  }

  const handleVote = (categorie, nominationId) => {
    setMyVotes(prev => ({ ...prev, [categorie]: nominationId }))
  }

  const submitVotes = async () => {
    if (Object.keys(myVotes).length === 0) {
      toast.error('Votez pour au moins une catégorie')
      return
    }
    setLoading(true)
    try {
      const votes = Object.entries(myVotes).map(([categorie, nomination_id]) => ({ categorie, nomination_id }))
      await axios.post(`${API}/api/awards/vote/submit`, { token, votes })
      setSubmitted(true)
      toast.success('Votes enregistrés !')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur — lien invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300 }}>Accès invalide</h2>
          <p style={{ fontFamily: 'Jost', fontSize: '13px', color: 'rgba(26,26,26,0.5)', marginTop: '12px' }}>
            Utilisez le lien reçu par email pour voter.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '4rem', color: '#C9A84C', marginBottom: '20px' }}>★</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, marginBottom: '12px' }}>
            Votes enregistrés !
          </h2>
          <p style={{ fontFamily: 'Jost', fontSize: '13px', color: 'rgba(26,26,26,0.55)', lineHeight: 1.8 }}>
            Merci d'avoir voté. Les résultats seront révélés lors de la cérémonie des Awards,<br />
            le <strong>30 Mai 2026</strong>.
          </p>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#C9A84C', fontSize: '1.1rem', marginTop: '24px' }}>
            À bientôt, Ingénieur(e).
          </p>
        </motion.div>
      </div>
    )
  }

  const currentNoms = activeCategory ? (nominations[activeCategory] || []) : []
  const isCatLoading = activeCategory ? loadingCats.has(activeCategory) : false
  const votedCount = Object.keys(myVotes).length
  const currentIdx = CATEGORIES.findIndex(c => c.id === activeCategory)

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', background: 'var(--cream)' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '12px' }}>
            Awards · Vote
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300 }}>
            Votez pour vos Camarades
          </h1>
          <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(26,26,26,0.4)', marginTop: '12px' }}>
            {votedCount} / {CATEGORIES.length} catégories votées · Clôture le 28 Mai à 23h59
          </p>
        </div>

        {/* Layout : sidebar + panel — colonne sur mobile, ligne sur desktop */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar catégories */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:w-56 lg:flex-shrink-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexShrink: 0,
                  padding: '12px 16px',
                  background: activeCategory === cat.id ? '#1A1A1A' : 'transparent',
                  border: '1px solid',
                  borderColor: activeCategory === cat.id ? '#1A1A1A' : 'rgba(26,26,26,0.08)',
                  color: activeCategory === cat.id ? '#FAF8F3' : 'rgba(26,26,26,0.5)',
                  fontFamily: 'Jost', fontSize: '11px', textAlign: 'left',
                  cursor: 'pointer', transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{cat.label}</span>
                {myVotes[cat.id] && (
                  <span style={{ color: '#C9A84C', fontSize: '12px', marginLeft: '8px' }}>★</span>
                )}
              </button>
            ))}
          </div>

          {/* Panel nominations */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              {activeCategory && (
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: '24px' }}>
                    {CATEGORIES.find(c => c.id === activeCategory)?.label}
                  </h3>

                  {isCatLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[1, 2, 3].map(n => (
                        <div key={n} style={{ height: 80, background: 'rgba(26,26,26,0.04)', border: '1px solid rgba(26,26,26,0.06)', animation: 'pulse 1.5s infinite' }} />
                      ))}
                    </div>
                  ) : currentNoms.length === 0 ? (
                    <p style={{ fontFamily: 'Jost', fontSize: '13px', color: 'rgba(26,26,26,0.35)', fontStyle: 'italic' }}>
                      Aucune nomination pour cette catégorie.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {currentNoms.map(nom => {
                        const isSelected = myVotes[activeCategory] === nom.id
                        return (
                          <motion.button
                            key={nom.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => handleVote(activeCategory, nom.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '16px',
                              padding: '16px 20px',
                              background: isSelected ? '#1A1A1A' : 'var(--warm-white)',
                              border: `1px solid ${isSelected ? '#C9A84C' : 'rgba(26,26,26,0.08)'}`,
                              cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s',
                              width: '100%',
                            }}
                          >
                            {/* Photo / Avatar */}
                            <Avatar
                              nom={nom.nom}
                              photoUrl={nom.photo_url}
                              size={52}
                              selected={isSelected}
                            />

                            {/* Infos */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 400, color: isSelected ? '#FAF8F3' : '#1A1A1A', marginBottom: '2px' }}>
                                {nom.nom}
                              </div>
                              {nom.filiere && (
                                <div style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.05em', color: isSelected ? 'rgba(250,248,243,0.45)' : 'rgba(26,26,26,0.4)' }}>
                                  {nom.filiere}
                                </div>
                              )}
                            </div>

                            {/* Indicateur sélection */}
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                              border: `1px solid ${isSelected ? '#C9A84C' : 'rgba(26,26,26,0.2)'}`,
                              background: isSelected ? '#C9A84C' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.3s',
                            }}>
                              {isSelected && <span style={{ color: '#1A1A1A', fontSize: '11px', fontWeight: 700 }}>✓</span>}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  )}

                  {/* Navigation catégorie suivante */}
                  {!isCatLoading && currentNoms.length > 0 && currentIdx < CATEGORIES.length - 1 && (
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setActiveCategory(CATEGORIES[currentIdx + 1].id)}
                        style={{
                          background: 'transparent', border: '1px solid rgba(26,26,26,0.15)',
                          color: 'rgba(26,26,26,0.5)', padding: '10px 20px',
                          fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}
                      >
                        {CATEGORIES[currentIdx + 1].label} →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Barre de progression */}
        <div style={{ marginTop: '32px', height: 2, background: 'rgba(201,168,76,0.1)', borderRadius: 1 }}>
          <div style={{
            height: '100%', background: '#C9A84C', borderRadius: 1,
            width: `${(votedCount / Math.max(CATEGORIES.length, 1)) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Submit */}
        <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid rgba(201,168,76,0.2)', paddingTop: '32px' }}>
          <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(26,26,26,0.4)', marginBottom: '20px' }}>
            {votedCount} vote{votedCount !== 1 ? 's' : ''} sélectionné{votedCount !== 1 ? 's' : ''} sur {CATEGORIES.length}
            {' '}· Non modifiable après confirmation
          </p>
          <button
            onClick={submitVotes}
            disabled={loading || votedCount === 0}
            style={{
              padding: '16px 48px',
              background: votedCount > 0 ? '#1A1A1A' : 'transparent',
              border: `1px solid ${votedCount > 0 ? '#1A1A1A' : 'rgba(26,26,26,0.15)'}`,
              color: votedCount > 0 ? '#FAF8F3' : 'rgba(26,26,26,0.3)',
              fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
              cursor: votedCount > 0 ? 'pointer' : 'default', transition: 'all 0.3s',
            }}
          >
            {loading ? 'Envoi...' : `Confirmer mes votes (${votedCount})`}
          </button>
        </div>
      </div>
    </main>
  )
}
