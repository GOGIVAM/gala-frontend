import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Trophy, Star, Users, Shirt, Flame, Dumbbell, Cpu } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const CATEGORIES = [
  { id: 'tenue_h', label: 'Meilleure Tenue', sub: 'Masculine', icon: Shirt, color: '#C9A84C' },
  { id: 'tenue_f', label: 'Meilleure Tenue', sub: 'Féminine', icon: Shirt, color: '#B8962E' },
  { id: 'glow_up', label: 'Meilleur Glow Up', sub: 'Transformation', icon: Flame, color: '#C9A84C' },
  { id: 'camarade', label: 'Meilleur Camarade', sub: 'Solidarité', icon: Users, color: '#E8D5A3' },
  { id: 'influenceur', label: 'Meilleur Influenceur', sub: 'Promo 2', icon: Star, color: '#C9A84C' },
  { id: 'foot', label: 'Meilleur Joueur', sub: 'de Football', icon: Dumbbell, color: '#B8962E' },
  { id: 'projet_tech', label: 'Meilleur Projet', sub: 'Technique', icon: Cpu, color: '#C9A84C' },
]

export default function Awards() {
  const [mode, setMode] = useState('browse') // 'browse' | 'nominate' | 'vote'
  const [selectedCat, setSelectedCat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [voted, setVoted] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onNominate = async (data) => {
    setLoading(true)
    try {
      await axios.post(`${API}/api/awards/nominate`, { ...data, categorie: selectedCat })
      toast.success('Nomination enregistrée !')
      reset()
      setMode('browse')
      setSelectedCat(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de nomination')
    } finally {
      setLoading(false)
    }
  }

  const onVote = async (data) => {
    setLoading(true)
    try {
      await axios.post(`${API}/api/awards/vote`, { ...data, categorie: selectedCat })
      toast.success('Vote enregistré !')
      setVoted(true)
      setMode('browse')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de vote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="awards" className="relative py-32" style={{ background: 'var(--warm-white)' }}>
      {/* Decorator */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%', left: '-5%',
          width: 350, height: 350,
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          border: '1px solid rgba(201,168,76,0.12)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
            La Consécration
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1 }}>
            Engineer Awards
          </h2>
          <p style={{ fontFamily: 'Jost', fontWeight: 300, fontSize: '13px', color: 'rgba(26,26,26,0.5)', marginTop: '16px', maxWidth: '500px', margin: '16px auto 0', lineHeight: 1.8 }}>
            Nominés et élus par la Promotion 2 elle-même. Résultats révélés le soir du 30 Mai.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center justify-center gap-8 mb-16">
          {[
            { id: 'browse', label: 'Catégories' },
            { id: 'nominate', label: 'Nominer' },
            { id: 'vote', label: 'Voter' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: '10px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: mode === tab.id ? '#C9A84C' : 'rgba(26,26,26,0.4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                paddingBottom: '8px',
                borderBottom: mode === tab.id ? '1px solid #C9A84C' : '1px solid transparent',
                transition: 'all 0.3s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* BROWSE */}
          {mode === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {CATEGORIES.map((cat, i) => {
                const Icon = cat.icon
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="award-card p-6 text-center"
                    onClick={() => { setSelectedCat(cat.id); setMode('nominate') }}
                  >
                    <div
                      style={{
                        width: 48, height: 48,
                        borderRadius: '50%',
                        border: `1px solid ${cat.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: cat.color,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '4px' }}>
                      {cat.label}
                    </p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.9rem', color: cat.color }}>
                      {cat.sub}
                    </p>
                    <div style={{ marginTop: '16px', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(26,26,26,0.3)', fontFamily: 'Jost', textTransform: 'uppercase' }}>
                      Cliquer pour nominer
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* NOMINATE */}
          {mode === 'nominate' && (
            <motion.div
              key="nominate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-lg mx-auto"
            >
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, marginBottom: '8px', textAlign: 'center' }}>
                Déposer une Nomination
              </h3>
              <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(26,26,26,0.4)', textAlign: 'center', marginBottom: '40px' }}>
                Un vote = une nomination par catégorie
              </p>

              <form onSubmit={handleSubmit(onNominate)} className="space-y-8">
                {/* Category selector */}
                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <select
                    {...register('categorie')}
                    value={selectedCat || ''}
                    onChange={(e) => setSelectedCat(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Choisir une catégorie</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label} — {c.sub}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Votre email (identifiant)</label>
                  <input {...register('votant_email', { required: true })} type="email" placeholder="votre@email.com" style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Nominé(e) — Nom & Prénom</label>
                  <input {...register('nomine_nom', { required: true })} placeholder="Nom Prénom du/de la nominé(e)" style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Filière du/de la nominé(e)</label>
                  <input {...register('nomine_filiere')} placeholder="Ex: Génie Informatique" style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Message (optionnel)</label>
                  <textarea
                    {...register('message')}
                    placeholder="Pourquoi ce choix ?"
                    rows={3}
                    style={{ ...inputStyle, resize: 'none', borderBottom: 'none', border: '1px solid rgba(26,26,26,0.1)', padding: '12px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
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
                  {loading ? 'Envoi...' : 'Confirmer la nomination'}
                </button>
              </form>
            </motion.div>
          )}

          {/* VOTE */}
          {mode === 'vote' && (
            <motion.div
              key="vote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-lg mx-auto text-center"
            >
              {voted ? (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>★</div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300 }}>
                    Vote enregistré
                  </h3>
                  <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(26,26,26,0.5)', marginTop: '12px' }}>
                    Résultats révélés le 30 Mai lors de la cérémonie.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, marginBottom: '12px' }}>
                    Voter
                  </h3>
                  <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(26,26,26,0.4)', marginBottom: '32px', lineHeight: 1.7 }}>
                    Un lien de vote unique sera envoyé à votre email après vérification de votre inscription.
                    <br/>Votes ouverts jusqu'au <strong>28 Mai 2026 à 23h59</strong>.
                  </p>
                  <form onSubmit={handleSubmit(onVote)} className="space-y-6">
                    <div>
                      <label style={labelStyle}>Votre email d'inscription</label>
                      <input {...register('email', { required: true })} type="email" placeholder="votre@email.com" style={inputStyle} />
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#C9A84C', color: '#1A1A1A', border: 'none', fontFamily: 'Jost, sans-serif', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer' }}>
                      Recevoir mon lien de vote
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: 'Jost, sans-serif',
  fontSize: '9px',
  letterSpacing: '0.3em',
  color: '#C9A84C',
  textTransform: 'uppercase',
  marginBottom: '8px',
}

const inputStyle = {
  display: 'block',
  width: '100%',
  background: 'transparent',
  borderBottom: '1px solid rgba(26,26,26,0.15)',
  color: '#1A1A1A',
  padding: '10px 0',
  fontFamily: 'Jost, sans-serif',
  fontSize: '14px',
  fontWeight: 300,
  outline: 'none',
  appearance: 'none',
}
