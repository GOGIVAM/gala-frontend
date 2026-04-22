import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import { QrCode, CreditCard, Phone, Mail, User, BookOpen } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const FILIERES = [
  'Sciences des Données et Intellignece Artificielle ',
  'Mécanique et Matériaux',
  'Energie',
  'Electronique Electrotechnique Automatisme et Télécom',
  'Chimie Industrielle et Bioprocédé Industriel',
  'Géophysque Eau et Environnement',
  'Autre',
]

export default function Tickets() {
  const [step, setStep] = useState('form') // 'form' | 'payment' | 'success'
  const [ticketData, setTicketData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [payMethod, setPayMethod] = useState('om') // 'om' | 'momo'

  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const phone = watch('telephone')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/tickets/register`, data)
      setTicketData(res.data)
      setStep('payment')
      toast.success('Inscription enregistrée !')
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'inscription'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const onPayment = async () => {
    setLoading(true)
    try {
      await axios.post(`${API}/api/tickets/initiate-payment`, {
        ticketId: ticketData.ticketId,
        method: payMethod,
        phone: ticketData.telephone,
      })
      toast.success('Demande de paiement envoyée ! Validez sur votre mobile.')
      // Poll for confirmation
      const poll = setInterval(async () => {
        const check = await axios.get(`${API}/api/tickets/status/${ticketData.ticketId}`)
        if (check.data.status === 'paid') {
          clearInterval(poll)
          setStep('success')
          toast.success('Paiement confirmé ! Votre billet a été envoyé par email.')
          setLoading(false)
        }
      }, 3000)
      setTimeout(() => { clearInterval(poll); setLoading(false) }, 120000)
    } catch (err) {
      toast.error('Erreur de paiement. Réessayez.')
      setLoading(false)
    }
  }

  const onManualPayment = async () => {
    setLoading(true)
    try {
      await axios.post(`${API}/api/tickets/manual-payment`, { ticketId: ticketData.ticketId })
      toast.success('Déclaration enregistrée. Validation sous 24h.')
      setStep('success')
    } catch {
      toast.error('Erreur. Contactez le support.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="billetterie" className="relative py-32" style={{ background: '#1A1A1A' }}>
      {/* Decorative */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: 400, height: 400,
          borderRadius: '0 0 0 100%',
          border: '1px solid rgba(201,168,76,0.1)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: 300, height: 300,
          borderRadius: '0 100% 0 0',
          border: '1px solid rgba(201,168,76,0.08)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
            Billetterie
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#FAF8F3', lineHeight: 1.1 }}>
            Réservez votre place
          </h2>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="h-px bg-gold/40 w-16" />
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#C9A84C', fontSize: '1.1rem' }}>
              10 000 FCFA · Places Limitées
            </span>
            <div className="h-px bg-gold/40 w-16" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* LEFT — Form / Steps */}
          <div>
            <AnimatePresence mode="wait">
              {/* STEP 1: FORM */}
              {step === 'form' && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase' }}>
                        Nom
                      </label>
                      <input
                        {...register('nom', { required: 'Requis' })}
                        placeholder="Votre nom"
                        style={{
                          display: 'block', width: '100%',
                          background: 'transparent',
                          borderBottom: '1px solid rgba(250,248,243,0.15)',
                          color: '#FAF8F3',
                          padding: '10px 0',
                          fontFamily: 'Jost, sans-serif',
                          fontSize: '14px',
                          fontWeight: 300,
                          outline: 'none',
                          marginTop: '8px',
                        }}
                        className="placeholder:text-white/20 focus:border-b-gold transition-colors"
                      />
                      {errors.nom && <span style={{ color: '#E8D5A3', fontSize: '11px' }}>{errors.nom.message}</span>}
                    </div>
                    <div>
                      <label style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase' }}>
                        Prénom
                      </label>
                      <input
                        {...register('prenom', { required: 'Requis' })}
                        placeholder="Votre prénom"
                        style={{
                          display: 'block', width: '100%',
                          background: 'transparent',
                          borderBottom: '1px solid rgba(250,248,243,0.15)',
                          color: '#FAF8F3',
                          padding: '10px 0',
                          fontFamily: 'Jost, sans-serif',
                          fontSize: '14px',
                          fontWeight: 300,
                          outline: 'none',
                          marginTop: '8px',
                        }}
                        className="placeholder:text-white/20"
                      />
                      {errors.prenom && <span style={{ color: '#E8D5A3', fontSize: '11px' }}>{errors.prenom.message}</span>}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase' }}>
                      Email
                    </label>
                    <input
                      {...register('email', { required: 'Requis', pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' } })}
                      type="email"
                      placeholder="votre@email.com"
                      style={{
                        display: 'block', width: '100%',
                        background: 'transparent',
                        borderBottom: '1px solid rgba(250,248,243,0.15)',
                        color: '#FAF8F3',
                        padding: '10px 0',
                        fontFamily: 'Jost, sans-serif',
                        fontSize: '14px',
                        fontWeight: 300,
                        outline: 'none',
                        marginTop: '8px',
                      }}
                      className="placeholder:text-white/20"
                    />
                    {errors.email && <span style={{ color: '#E8D5A3', fontSize: '11px' }}>{errors.email.message}</span>}
                  </div>

                  <div>
                    <label style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase' }}>
                      Téléphone
                    </label>
                    <input
                      {...register('telephone', { required: 'Requis', pattern: { value: /^[0-9+\s-]{8,15}$/, message: 'Numéro invalide' } })}
                      placeholder="+237 6XX XXX XXX"
                      style={{
                        display: 'block', width: '100%',
                        background: 'transparent',
                        borderBottom: '1px solid rgba(250,248,243,0.15)',
                        color: '#FAF8F3',
                        padding: '10px 0',
                        fontFamily: 'Jost, sans-serif',
                        fontSize: '14px',
                        fontWeight: 300,
                        outline: 'none',
                        marginTop: '8px',
                      }}
                      className="placeholder:text-white/20"
                    />
                    {errors.telephone && <span style={{ color: '#E8D5A3', fontSize: '11px' }}>{errors.telephone.message}</span>}
                  </div>

                  <div>
                    <label style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase' }}>
                      Filière / Spécialité
                    </label>
                    <select
                      {...register('filiere', { required: 'Requis' })}
                      style={{
                        display: 'block', width: '100%',
                        background: 'transparent',
                        borderBottom: '1px solid rgba(250,248,243,0.15)',
                        color: '#FAF8F3',
                        padding: '10px 0',
                        fontFamily: 'Jost, sans-serif',
                        fontSize: '14px',
                        fontWeight: 300,
                        outline: 'none',
                        marginTop: '8px',
                        appearance: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="" style={{ background: '#1A1A1A' }}>Sélectionner votre filière</option>
                      {FILIERES.map(f => (
                        <option key={f} value={f} style={{ background: '#1A1A1A' }}>{f}</option>
                      ))}
                    </select>
                    {errors.filiere && <span style={{ color: '#E8D5A3', fontSize: '11px' }}>{errors.filiere.message}</span>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: '#C9A84C',
                      color: '#1A1A1A',
                      padding: '16px',
                      fontFamily: 'Jost, sans-serif',
                      fontSize: '11px',
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'all 0.3s',
                      marginTop: '8px',
                    }}
                  >
                    {loading ? 'Traitement...' : 'Continuer vers le paiement'}
                  </button>
                </motion.form>
              )}

              {/* STEP 2: PAYMENT */}
              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="mb-8">
                    <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Montant à payer
                    </p>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3.5rem', fontWeight: 300, color: '#FAF8F3' }}>
                      10 000 <span style={{ fontSize: '1.5rem', color: '#C9A84C' }}>FCFA</span>
                    </div>
                  </div>

                  {/* Payment Method Toggle */}
                  <div className="flex gap-4 mb-8">
                    {[
                      { id: 'om', label: 'Orange Money', color: '#FF6B00' },
                      { id: 'momo', label: 'MTN MoMo', color: '#FFCB00' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        style={{
                          flex: 1, padding: '12px',
                          border: payMethod === m.id ? `1px solid ${m.color}` : '1px solid rgba(250,248,243,0.1)',
                          background: payMethod === m.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                          color: payMethod === m.id ? m.color : 'rgba(250,248,243,0.4)',
                          fontFamily: 'Jost, sans-serif',
                          fontSize: '11px',
                          letterSpacing: '0.1em',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={onPayment}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '16px',
                      background: '#C9A84C',
                      color: '#1A1A1A',
                      border: 'none',
                      fontFamily: 'Jost, sans-serif',
                      fontSize: '11px',
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      cursor: 'pointer',
                      marginBottom: '16px',
                    }}
                  >
                    {loading ? 'En attente de confirmation...' : 'Payer via ' + (payMethod === 'om' ? 'Orange Money' : 'MTN MoMo')}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <p style={{ fontFamily: 'Jost', fontSize: '11px', color: 'rgba(250,248,243,0.3)', marginBottom: '12px' }}>
                      — ou paiement manuel —
                    </p>
                    <button
                      onClick={onManualPayment}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(201,168,76,0.3)',
                        color: '#C9A84C',
                        padding: '10px 24px',
                        fontFamily: 'Jost, sans-serif',
                        fontSize: '10px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      J'ai déjà payé manuellement
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SUCCESS */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    style={{
                      width: 80, height: 80,
                      borderRadius: '50%',
                      border: '1px solid #C9A84C',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 24px',
                      fontSize: '2rem',
                    }}
                  >
                    ✦
                  </motion.div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: '#FAF8F3', marginBottom: '12px' }}>
                    Réservation Confirmée
                  </h3>
                  <p style={{ fontFamily: 'Jost', fontSize: '13px', color: 'rgba(250,248,243,0.5)', lineHeight: 1.7, marginBottom: '24px' }}>
                    Votre billet PDF a été envoyé à votre email.<br />
                    Présentez le QR Code à l'entrée le 30 mai.
                  </p>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#C9A84C', fontSize: '1.1rem' }}>
                    À bientôt, Ingénieur(e).
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — Ticket Preview + Manual Payment */}
          <div className="space-y-8">
            {/* Ticket Visual */}
            <div
              style={{
                background: '#FAF8F3',
                border: '1px solid rgba(201,168,76,0.3)',
                padding: '40px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Gold corner accents */}
              <div style={{ position: 'absolute', top: 12, left: 12, width: 20, height: 20, borderTop: '1px solid #C9A84C', borderLeft: '1px solid #C9A84C' }} />
              <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderTop: '1px solid #C9A84C', borderRight: '1px solid #C9A84C' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, width: 20, height: 20, borderBottom: '1px solid #C9A84C', borderLeft: '1px solid #C9A84C' }} />
              <div style={{ position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderBottom: '1px solid #C9A84C', borderRight: '1px solid #C9A84C' }} />

              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Jost', fontSize: '8px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Billet · Gala Promo 2
                </p>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, lineHeight: 1.1, marginBottom: '4px' }}>
                  Éclat & Élégance
                </h3>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#C9A84C', fontSize: '1rem', marginBottom: '24px' }}>
                  30 Mai 2026 · 19h00
                </p>
                <div
                  style={{
                    width: 80, height: 80,
                    background: '#1A1A1A',
                    margin: '0 auto 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <QrCode size={50} color="#C9A84C" />
                </div>
                <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(26,26,26,0.3)', textTransform: 'uppercase' }}>
                  QR Code unique · Entrée valide une seule fois
                </p>
              </div>
            </div>

            {/* Manual Payment QR */}
            <div style={{ border: '1px solid rgba(201,168,76,0.2)', padding: '24px' }}>
              <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
                Paiement Manuel
              </p>
              <div className="flex gap-6 items-center">
                <div
                  style={{
                    width: 80, height: 80,
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <QrCode size={40} color="#C9A84C" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(250,248,243,0.6)', lineHeight: 1.7 }}>
                    Scannez le QR code ou contactez<br />
                    <span style={{ color: '#C9A84C' }}>+237 6XX XXX XXX</span> sur WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
