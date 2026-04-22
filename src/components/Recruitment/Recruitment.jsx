import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const POLES = ['Communication', 'Logistique', 'Billetterie', 'Technique', 'Décoration & Scénographie']

export default function Recruitment() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await axios.post(`${API}/api/recruitment/apply`, data)
      setSuccess(true)
      toast.success('Candidature envoyée !')
    } catch {
      toast.error('Erreur. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="comite" className="relative py-32" style={{ background: '#1A1A1A' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left */}
          <div className="reveal-left">
            <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
              Rejoindre l'équipe
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#FAF8F3', lineHeight: 1.2, marginBottom: '20px' }}>
              Comité<br />d'Organisation
            </h2>
            <p style={{ fontFamily: 'Jost', fontWeight: 300, fontSize: '13px', color: 'rgba(250,248,243,0.5)', lineHeight: 1.9, marginBottom: '32px' }}>
              Tu veux être au cœur de la création de cet événement ? Rejoins le CO et participe activement à faire de cette soirée un moment inoubliable.
            </p>
            <div className="space-y-4">
              {POLES.map((pole, i) => (
                <motion.div
                  key={pole}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Jost', fontSize: '12px', letterSpacing: '0.1em', color: 'rgba(250,248,243,0.6)' }}>
                    Pôle {pole}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div className="reveal-right">
            {success ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div style={{ fontSize: '3rem', color: '#C9A84C', marginBottom: '16px' }}>✦</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: '#FAF8F3', marginBottom: '12px' }}>
                  Candidature reçue
                </h3>
                <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(250,248,243,0.4)', lineHeight: 1.7 }}>
                  Le CO te contactera très prochainement.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'nom', label: 'Nom', placeholder: 'Votre nom' },
                    { name: 'prenom', label: 'Prénom', placeholder: 'Votre prénom' },
                  ].map((field) => (
                    <div key={field.name}>
                      <label style={darkLabel}>{field.label}</label>
                      <input {...register(field.name, { required: true })} placeholder={field.placeholder} style={darkInput} />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={darkLabel}>Filière</label>
                  <input {...register('filiere', { required: true })} placeholder="Votre filière" style={darkInput} />
                </div>

                <div>
                  <label style={darkLabel}>Pôle souhaité</label>
                  <select {...register('pole', { required: true })} style={{ ...darkInput, appearance: 'none', cursor: 'pointer' }}>
                    <option value="" style={{ background: '#1A1A1A' }}>Sélectionner un pôle</option>
                    {POLES.map(p => <option key={p} value={p} style={{ background: '#1A1A1A' }}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label style={darkLabel}>Disponibilités</label>
                  <input {...register('disponibilites')} placeholder="Ex: Week-ends, après 17h..." style={darkInput} />
                </div>

                <div>
                  <label style={darkLabel}>Motivation (court)</label>
                  <textarea
                    {...register('motivation', { required: true })}
                    rows={3}
                    placeholder="Pourquoi rejoindre le CO ?"
                    style={{ ...darkInput, resize: 'none', borderBottom: 'none', border: '1px solid rgba(250,248,243,0.1)', padding: '10px 12px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    background: '#C9A84C',
                    color: '#1A1A1A',
                    border: 'none',
                    fontFamily: 'Jost, sans-serif',
                    fontSize: '10px',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Envoi...' : 'Postuler au Comité'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const darkLabel = {
  display: 'block',
  fontFamily: 'Jost, sans-serif',
  fontSize: '9px',
  letterSpacing: '0.3em',
  color: 'rgba(201,168,76,0.6)',
  textTransform: 'uppercase',
  marginBottom: '8px',
}

const darkInput = {
  display: 'block',
  width: '100%',
  background: 'transparent',
  borderBottom: '1px solid rgba(250,248,243,0.12)',
  color: '#FAF8F3',
  padding: '10px 0',
  fontFamily: 'Jost, sans-serif',
  fontSize: '13px',
  fontWeight: 300,
  outline: 'none',
}
