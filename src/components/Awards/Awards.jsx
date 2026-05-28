import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Trophy, Star, Users, Shirt, Flame, Dumbbell, Cpu, Camera } from 'lucide-react'
import { useAwardCategories } from '../../hooks/useConfig.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const ICON_MAP = {
  tenue_h:     { icon: Shirt,    color: '#C9A84C' },
  tenue_f:     { icon: Shirt,    color: '#B8962E' },
  glow_up:     { icon: Flame,    color: '#C9A84C' },
  camarade:    { icon: Users,    color: '#E8D5A3' },
  influenceur: { icon: Star,     color: '#C9A84C' },
  foot:        { icon: Dumbbell, color: '#B8962E' },
  projet_tech: { icon: Cpu,      color: '#C9A84C' },
}

const FALLBACK_CATEGORIES = [
  { id: 'tenue_h',     label: 'Meilleure Tenue',      sub: 'Masculine',      icon: Shirt,    color: '#C9A84C' },
  { id: 'tenue_f',     label: 'Meilleure Tenue',      sub: 'Féminine',       icon: Shirt,    color: '#B8962E' },
  { id: 'glow_up',     label: 'Meilleur Glow Up',     sub: 'Transformation', icon: Flame,    color: '#C9A84C' },
  { id: 'camarade',    label: 'Meilleur Camarade',    sub: 'Solidarité',     icon: Users,    color: '#E8D5A3' },
  { id: 'influenceur', label: 'Meilleur Influenceur', sub: 'Promo 2',        icon: Star,     color: '#C9A84C' },
  { id: 'foot',        label: 'Meilleur Joueur',      sub: 'de Football',    icon: Dumbbell, color: '#B8962E' },
  { id: 'projet_tech', label: 'Meilleur Projet',      sub: 'Technique',      icon: Cpu,      color: '#C9A84C' },
]

const VOTE_STEPS = [
  { n: '01', text: 'Entrez votre email d\'inscription' },
  { n: '02', text: 'Recevez votre lien unique par email' },
  { n: '03', text: 'Votez pour chaque catégorie' },
  { n: '04', text: 'Résultats révélés le 30 Mai' },
]

export default function Awards() {
  const { categories: rawCategories } = useAwardCategories()
  const [mode, setMode] = useState('browse')
  const [selectedCat, setSelectedCat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [voted, setVoted] = useState(false)
  const [filieres, setFilieres] = useState([])
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const { register, handleSubmit, reset } = useForm()

  const CATEGORIES = rawCategories.filter(c => c.active).length > 0
    ? rawCategories.filter(c => c.active).map(c => ({
        id: c.name,
        label: c.label,
        sub: c.sub_label || '',
        icon: ICON_MAP[c.name]?.icon || Trophy,
        color: ICON_MAP[c.name]?.color || '#C9A84C',
      }))
    : FALLBACK_CATEGORIES

  const loadFilieres = async () => {
    if (filieres.length > 0) return
    try {
      const res = await axios.get(`${API}/api/filieres`)
      setFilieres(res.data)
    } catch {
      setFilieres([
        'Sciences des Données et Intelligence Artificielle',
        'Mécanique et Matériaux',
        'Energie',
        'Electronique Electrotechnique Automatisme et Télécom',
        'Chimie Industrielle et Bioprocédé Industriel',
        'Géophysique Eau et Environnement',
        'Autre',
      ])
    }
  }

  const goToNominate = (catId) => {
    setSelectedCat(catId)
    setMode('nominate')
    loadFilieres()
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const onNominate = async (data) => {
    if (!selectedCat) {
      toast.error('Sélectionnez une catégorie')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('votant_email', data.votant_email)
      formData.append('nomine_nom', data.nomine_nom)
      formData.append('nomine_filiere', data.nomine_filiere || '')
      formData.append('message', data.message || '')
      formData.append('categorie', selectedCat)
      if (photo) formData.append('photo', photo)

      await axios.post(`${API}/api/awards/nominate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Nomination enregistrée !')
      reset()
      setSelectedCat(null)
      setPhoto(null)
      setPhotoPreview(null)
      setMode('browse')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de nomination')
    } finally {
      setLoading(false)
    }
  }

  const onRequestVoteLink = async (data) => {
    setLoading(true)
    try {
      await axios.post(`${API}/api/awards/vote`, data)
      toast.success('Lien de vote envoyé par email !')
      setVoted(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur — vérifiez votre email d\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="awards" className="relative py-32" style={{ background: 'var(--warm-white)' }}>
      <div
        className="absolute pointer-events-none"
        style={{ top: '20%', left: '-5%', width: 350, height: 350, borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', border: '1px solid rgba(201,168,76,0.12)' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
            La Consécration
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1 }}>
            Awards
          </h2>
          <p style={{ fontFamily: 'Jost', fontWeight: 300, fontSize: '13px', color: 'rgba(26,26,26,0.5)', marginTop: '16px', maxWidth: '500px', margin: '16px auto 0', lineHeight: 1.8 }}>
            Nominés et élus par la Promotion 2 elle-même. Résultats révélés le soir du 30 Mai.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-8 mb-16">
          {[
            { id: 'browse',   label: 'Catégories' },
            { id: 'nominate', label: 'Nominer' },
            { id: 'vote',     label: 'Voter' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setMode(tab.id); if (tab.id === 'nominate') loadFilieres() }}
              style={{
                fontFamily: 'Jost, sans-serif', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
                color: mode === tab.id ? '#C9A84C' : 'rgba(26,26,26,0.4)',
                background: 'none', border: 'none', cursor: 'pointer',
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
            <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                    onClick={() => goToNominate(cat.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: '50%', border: `1px solid ${cat.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: cat.color }}>
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
            <motion.div key="nominate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto">
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, marginBottom: '8px', textAlign: 'center' }}>
                Déposer une Nomination
              </h3>
              <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(26,26,26,0.4)', textAlign: 'center', marginBottom: '40px' }}>
                Une nomination par catégorie
              </p>

              <form onSubmit={handleSubmit(onNominate)} className="space-y-8">
                {/* Catégorie */}
                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <select
                    value={selectedCat || ''}
                    onChange={e => setSelectedCat(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Choisir une catégorie</option>
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}{c.sub ? ` — ${c.sub}` : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Photo du nominé */}
                <div>
                  <label style={labelStyle}>Photo du/de la nominé(e) <span style={{ color: 'rgba(26,26,26,0.3)' }}>(optionnel)</span></label>
                  <label
                    htmlFor="nominee-photo"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      border: '1px dashed rgba(201,168,76,0.3)', padding: '16px',
                      cursor: 'pointer', background: 'rgba(201,168,76,0.02)',
                    }}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview"
                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(201,168,76,0.4)' }}
                      />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Camera size={20} color="rgba(201,168,76,0.5)" />
                      </div>
                    )}
                    <div>
                      <p style={{ fontFamily: 'Jost', fontSize: '11px', color: 'rgba(26,26,26,0.5)' }}>
                        {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                      </p>
                      <p style={{ fontFamily: 'Jost', fontSize: '10px', color: 'rgba(26,26,26,0.3)', marginTop: '4px' }}>
                        JPG, PNG · Max 5 Mo
                      </p>
                    </div>
                    <input
                      id="nominee-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhoto}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Email du votant */}
                <div>
                  <label style={labelStyle}>Votre email (identifiant)</label>
                  <input {...register('votant_email', { required: true })} type="email" placeholder="votre@email.com" style={inputStyle} />
                </div>

                {/* Nom du nominé */}
                <div>
                  <label style={labelStyle}>Nominé(e) — Nom & Prénom</label>
                  <input {...register('nomine_nom', { required: true })} placeholder="Nom Prénom du/de la nominé(e)" style={inputStyle} />
                </div>

                {/* Filière */}
                <div>
                  <label style={labelStyle}>Filière du/de la nominé(e)</label>
                  <select {...register('nomine_filiere')} style={inputStyle}>
                    <option value="" style={{ background: '#FAF8F3' }}>Sélectionner une filière</option>
                    {filieres.map(f => (
                      <option key={typeof f === 'object' ? f.id : f} value={typeof f === 'object' ? f.name : f} style={{ background: '#FAF8F3' }}>
                        {typeof f === 'object' ? f.name : f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message optionnel */}
                <div>
                  <label style={labelStyle}>Message <span style={{ color: 'rgba(26,26,26,0.3)' }}>(optionnel)</span></label>
                  <textarea
                    {...register('message')}
                    placeholder="Pourquoi ce choix ?"
                    rows={3}
                    style={{ ...inputStyle, resize: 'none', borderBottom: 'none', border: '1px solid rgba(26,26,26,0.1)', padding: '12px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedCat}
                  style={{
                    width: '100%', padding: '14px',
                    background: selectedCat ? '#1A1A1A' : 'rgba(26,26,26,0.3)',
                    color: '#FAF8F3', border: 'none',
                    fontFamily: 'Jost, sans-serif', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
                    cursor: selectedCat ? 'pointer' : 'not-allowed',
                  }}
                >
                  {loading ? 'Envoi...' : 'Confirmer la nomination'}
                </button>
              </form>
            </motion.div>
          )}

          {/* VOTE */}
          {mode === 'vote' && (
            <motion.div key="vote" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto">
              {voted ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>★</div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300 }}>Lien envoyé !</h3>
                  <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(26,26,26,0.5)', marginTop: '12px', lineHeight: 1.7 }}>
                    Vérifiez votre email pour accéder à la page de vote.<br />
                    Résultats révélés le 30 Mai lors de la cérémonie.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Explication du processus */}
                  <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, marginBottom: '8px', textAlign: 'center' }}>
                      Comment voter ?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                      {VOTE_STEPS.map(step => (
                        <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.4rem', color: '#C9A84C', minWidth: '28px' }}>
                            {step.n}
                          </span>
                          <p style={{ fontFamily: 'Jost', fontSize: '12px', fontWeight: 300, color: 'rgba(26,26,26,0.6)', lineHeight: 1.5 }}>
                            {step.text}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontFamily: 'Jost', fontSize: '11px', color: 'rgba(26,26,26,0.35)', marginTop: '20px', textAlign: 'center' }}>
                      Votes ouverts jusqu'au <strong style={{ color: 'rgba(26,26,26,0.5)' }}>28 Mai 2026 à 23h59</strong>
                    </p>
                  </div>

                  {/* Formulaire email */}
                  <form onSubmit={handleSubmit(onRequestVoteLink)} className="space-y-6">
                    <div>
                      <label style={labelStyle}>Votre email d'inscription</label>
                      <input
                        {...register('email', { required: true })}
                        type="email"
                        placeholder="votre@email.com"
                        style={inputStyle}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%', padding: '14px',
                        background: '#C9A84C', color: '#1A1A1A', border: 'none',
                        fontFamily: 'Jost, sans-serif', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      {loading ? 'Envoi...' : 'Recevoir mon lien de vote'}
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
  display: 'block', fontFamily: 'Jost, sans-serif', fontSize: '9px',
  letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '8px',
}

const inputStyle = {
  display: 'block', width: '100%',
  background: 'transparent',
  borderBottom: '1px solid rgba(26,26,26,0.15)',
  color: '#1A1A1A',
  padding: '10px 0',
  fontFamily: 'Jost, sans-serif', fontSize: '14px', fontWeight: 300,
  outline: 'none', appearance: 'none',
}
