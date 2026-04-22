import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const CATEGORIES = [
  { id: 'tenue_h', label: 'Meilleure Tenue Masculine' },
  { id: 'tenue_f', label: 'Meilleure Tenue Féminine' },
  { id: 'glow_up', label: 'Meilleur Glow Up' },
  { id: 'camarade', label: 'Meilleur Camarade' },
  { id: 'influenceur', label: 'Meilleur Influenceur' },
  { id: 'foot', label: 'Meilleur Joueur de Foot' },
  { id: 'projet_tech', label: 'Meilleur Projet Technique' },
]

export default function AwardsPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [nominations, setNominations] = useState({})
  const [myVotes, setMyVotes] = useState({}) // { categorie: nominationId }
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [catLoading, setCatLoading] = useState(false)

  useEffect(() => {
    if (token) {
      CATEGORIES.forEach(cat => loadNominations(cat.id))
    }
  }, [token])

  const loadNominations = async (categorie) => {
    setCatLoading(true)
    try {
      const res = await axios.get(`${API}/api/awards/nominations/${categorie}`)
      setNominations(prev => ({ ...prev, [categorie]: res.data }))
    } catch {}
    setCatLoading(false)
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
      const votes = Object.entries(myVotes).map(([categorie, nomination_id]) => ({
        categorie, nomination_id,
      }))
      await axios.post(`${API}/api/awards/vote/submit`, { token, votes })
      setSubmitted(true)
      toast.success('Votes enregistrés !')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300 }}>
            Accès invalide
          </h2>
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: '400px' }}
        >
          <div style={{ fontSize: '4rem', color: '#C9A84C', marginBottom: '20px' }}>★</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, marginBottom: '12px' }}>
            Votes enregistrés !
          </h2>
          <p style={{ fontFamily: 'Jost', fontSize: '13px', color: 'rgba(26,26,26,0.55)', lineHeight: 1.8 }}>
            Merci d'avoir voté. Les résultats seront révélés lors de la cérémonie des Engineer Awards,<br/>
            le <strong>30 Mai 2026</strong>.
          </p>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#C9A84C', fontSize: '1.1rem', marginTop: '24px' }}>
            À bientôt, Ingénieur(e).
          </p>
        </motion.div>
      </div>
    )
  }

  const currentNoms = nominations[activeCategory] || []
  const votedCount = Object.keys(myVotes).length

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', background: 'var(--cream)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '12px' }}>
            Engineer Awards · Vote
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300 }}>
            Votez pour vos Camarades
          </h1>
          <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(26,26,26,0.4)', marginTop: '12px' }}>
            {votedCount} / {CATEGORIES.length} catégories — Votes clôturés le 28 Mai à 23h59
          </p>
        </div>

        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Category sidebar */}
          <div style={{ flexShrink: 0, width: '220px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '12px 16px', marginBottom: '4px',
                  background: activeCategory === cat.id ? '#1A1A1A' : 'transparent',
                  border: '1px solid',
                  borderColor: activeCategory === cat.id ? '#1A1A1A' : 'rgba(26,26,26,0.08)',
                  color: activeCategory === cat.id ? '#FAF8F3' : 'rgba(26,26,26,0.5)',
                  fontFamily: 'Jost', fontSize: '11px', textAlign: 'left',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <span>{cat.label}</span>
                {myVotes[cat.id] && <span style={{ color: '#C9A84C', fontSize: '12px' }}>★</span>}
              </button>
            ))}
          </div>

          {/* Nominations */}
          <div style={{ flex: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: '24px' }}>
                  {CATEGORIES.find(c => c.id === activeCategory)?.label}
                </h3>

                {currentNoms.length === 0 ? (
                  <p style={{ fontFamily: 'Jost', fontSize: '13px', color: 'rgba(26,26,26,0.35)', fontStyle: 'italic' }}>
                    Aucune nomination pour cette catégorie pour l'instant.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentNoms.map(nom => {
                      const isSelected = myVotes[activeCategory] === nom.id
                      return (
                        <button
                          key={nom.id}
                          onClick={() => handleVote(activeCategory, nom.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 20px',
                            background: isSelected ? '#1A1A1A' : 'var(--warm-white)',
                            border: `1px solid ${isSelected ? '#C9A84C' : 'rgba(26,26,26,0.1)'}`,
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s',
                          }}
                        >
                          <div>
                            <div style={{ fontFamily: 'Jost', fontSize: '14px', fontWeight: 500, color: isSelected ? '#FAF8F3' : '#1A1A1A' }}>
                              {nom.nom}
                            </div>
                            {nom.filiere && (
                              <div style={{ fontFamily: 'Jost', fontSize: '11px', color: isSelected ? 'rgba(250,248,243,0.5)' : 'rgba(26,26,26,0.4)', marginTop: '2px' }}>
                                {nom.filiere}
                              </div>
                            )}
                          </div>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1px solid ${isSelected ? '#C9A84C' : 'rgba(26,26,26,0.2)'}`, background: isSelected ? '#C9A84C' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {isSelected && <span style={{ color: '#1A1A1A', fontSize: '10px' }}>✓</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Navigate to next */}
                {currentNoms.length > 0 && (
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        const idx = CATEGORIES.findIndex(c => c.id === activeCategory)
                        if (idx < CATEGORIES.length - 1) setActiveCategory(CATEGORIES[idx + 1].id)
                      }}
                      style={{
                        background: 'transparent', border: '1px solid rgba(26,26,26,0.15)',
                        color: 'rgba(26,26,26,0.5)', padding: '10px 20px',
                        fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
                      }}
                    >
                      Catégorie suivante →
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: '48px', textAlign: 'center', borderTop: '1px solid rgba(201,168,76,0.2)', paddingTop: '32px' }}>
          <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(26,26,26,0.4)', marginBottom: '20px' }}>
            {votedCount} vote{votedCount !== 1 ? 's' : ''} sélectionné{votedCount !== 1 ? 's' : ''} · Non modifiable après confirmation
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
              cursor: votedCount > 0 ? 'pointer' : 'default',
              transition: 'all 0.3s',
            }}
          >
            {loading ? 'Envoi...' : `Confirmer mes votes (${votedCount})`}
          </button>
        </div>
      </div>
    </main>
  )
}
