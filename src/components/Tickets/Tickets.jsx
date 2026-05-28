import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import { QrCode, AlertCircle } from 'lucide-react'
import { useSettings } from '../../hooks/useConfig.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export default function Tickets() {
  const { settings } = useSettings()
  const [step, setStep] = useState('form') // 'form' | 'payment' | 'success' | 'partial-payment'
  const [ticketData, setTicketData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filieres, setFilieres] = useState([])
  const [payMethod, setPayMethod] = useState('notchpay') // 'om' | 'momo' | 'notchpay' | 'manual'
  const [paymentType, setPaymentType] = useState('full') // 'full' | 'partial'
  const [partialAmount, setPartialAmount] = useState('')
  const [screenshots, setScreenshots] = useState([])
  const [transactionRef, setTransactionRef] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  // OM and MoMo are manual transfers — only NotchPay is an online gateway
  const isManualMethod = ['manual', 'om', 'momo'].includes(payMethod)

  useEffect(() => {
    const loadFilieres = async () => {
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
    loadFilieres()
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/tickets/register`, data)
      setTicketData(res.data)
      setStep('payment')
      toast.success('Inscription enregistrée !')
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  const onPayment = async () => {
    if (paymentType === 'partial') {
      if (!partialAmount) {
        toast.error('Veuillez entrer le montant')
        return
      }
      if (parseInt(partialAmount) < 2500) {
        toast.error('Montant minimum: 2 500 FCFA')
        return
      }
    }

    setLoading(true)
    try {
      if (isManualMethod) {
        const formData = new FormData()
        formData.append('ticketId', ticketData.ticketId)
        formData.append('transactionRef', transactionRef)
        if (paymentType === 'partial') {
          formData.append('partialAmount', partialAmount)
          formData.append('isPartial', 'true')
        }
        screenshots.forEach(file => formData.append('screenshots', file))

        await axios.post(`${API}/api/tickets/manual-payment`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Déclaration enregistrée. Validation sous 24h.')
        setStep('success')
        return
      }

      // NotchPay online payment
      const payload = {
        ticketId: ticketData.ticketId,
        method: payMethod,
        phone: ticketData.telephone,
        email: ticketData.email,
        isPartial: paymentType === 'partial',
        partialAmount: paymentType === 'partial' ? parseInt(partialAmount) : null,
      }

      const response = await axios.post(`${API}/api/tickets/initiate-payment`, payload)

      if (!response.data.success) {
        toast.error(response.data.error || 'Paiement non disponible. Utilisez la déclaration manuelle.')
        setLoading(false)
        return
      }

      if (response.data.redirectUrl) {
        toast.success('Redirection vers NotchPay...')
        setTimeout(() => { window.location.href = response.data.redirectUrl }, 1500)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de paiement. Réessayez.')
      setLoading(false)
    }
  }

  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files || [])
    setScreenshots(prev => [...prev, ...files])
  }

  const removeScreenshot = (index) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index))
  }

  const omNumber = settings?.payment_om_number || '658 144 589'
  const momoNumber = settings?.payment_momo_number || '676 137 255'
  const supportPhone = settings?.support_phone || '691 697 924'

  return (
    <section id="billetterie" className="relative py-32" style={{ background: '#1A1A1A' }}>
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: 400, height: 400, borderRadius: '0 0 0 100%', border: '1px solid rgba(201,168,76,0.1)' }}
      />
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{ width: 300, height: 300, borderRadius: '0 100% 0 0', border: '1px solid rgba(201,168,76,0.08)' }}
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
              {settings?.event_price?.toLocaleString('fr-FR')} FCFA · Places Limitées
            </span>
            <div className="h-px bg-gold/40 w-16" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* LEFT — Steps */}
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
                      <label style={fieldLabel}>Nom</label>
                      <input {...register('nom', { required: 'Requis' })} placeholder="Votre nom" style={fieldInput} className="placeholder:text-white/20" />
                      {errors.nom && <span style={fieldError}>{errors.nom.message}</span>}
                    </div>
                    <div>
                      <label style={fieldLabel}>Prénom</label>
                      <input {...register('prenom', { required: 'Requis' })} placeholder="Votre prénom" style={fieldInput} className="placeholder:text-white/20" />
                      {errors.prenom && <span style={fieldError}>{errors.prenom.message}</span>}
                    </div>
                  </div>

                  <div>
                    <label style={fieldLabel}>Email</label>
                    <input
                      {...register('email', { required: 'Requis', pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' } })}
                      type="email" placeholder="votre@email.com" style={fieldInput} className="placeholder:text-white/20"
                    />
                    {errors.email && <span style={fieldError}>{errors.email.message}</span>}
                  </div>

                  <div>
                    <label style={fieldLabel}>Téléphone</label>
                    <input
                      {...register('telephone', { required: 'Requis', pattern: { value: /^[0-9+\s-]{8,15}$/, message: 'Numéro invalide' } })}
                      placeholder="+237 6XX XXX XXX" style={fieldInput} className="placeholder:text-white/20"
                    />
                    {errors.telephone && <span style={fieldError}>{errors.telephone.message}</span>}
                  </div>

                  <div>
                    <label style={fieldLabel}>Filière / Spécialité</label>
                    <select {...register('filiere', { required: 'Requis' })} style={{ ...fieldInput, appearance: 'none', cursor: 'pointer' }}>
                      <option value="" style={{ background: '#1A1A1A' }}>Sélectionner votre filière</option>
                      {filieres.map(f => (
                        <option key={typeof f === 'object' ? f.id : f} value={typeof f === 'object' ? f.name : f} style={{ background: '#1A1A1A' }}>
                          {typeof f === 'object' ? f.name : f}
                        </option>
                      ))}
                    </select>
                    {errors.filiere && <span style={fieldError}>{errors.filiere.message}</span>}
                  </div>

                  <button type="submit" disabled={loading} style={primaryBtn}>
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
                  {/* Amount display */}
                  <div className="mb-6">
                    <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Montant à payer
                    </p>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3.5rem', fontWeight: 300, color: '#FAF8F3' }}>
                      {paymentType === 'partial' ? (partialAmount || '0') : (settings?.event_price || 10500).toLocaleString('fr-FR')}
                      <span style={{ fontSize: '1.5rem', color: '#C9A84C' }}> FCFA</span>
                    </div>
                  </div>

                  {/* Payment Type */}
                  <div style={{ marginBottom: '24px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', padding: '16px' }}>
                    <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '12px' }}>
                      Type de paiement
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {[
                        { val: 'full', label: 'Paiement complet' },
                        { val: 'partial', label: 'Paiement par tranche' },
                      ].map(({ val, label }) => (
                        <button
                          key={val}
                          onClick={() => { setPaymentType(val); setPartialAmount('') }}
                          style={{
                            padding: '12px',
                            background: paymentType === val ? '#C9A84C' : 'transparent',
                            color: paymentType === val ? '#1A1A1A' : '#FAF8F3',
                            border: `1px solid ${paymentType === val ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
                            fontFamily: 'Jost, sans-serif', fontSize: '11px', fontWeight: 500,
                            cursor: 'pointer', transition: 'all 0.3s', letterSpacing: '0.1em', textTransform: 'uppercase',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Partial Amount Input */}
                  {paymentType === 'partial' && (
                    <div style={{ marginBottom: '24px', background: 'rgba(201,168,76,0.08)', padding: '16px', border: '1px solid rgba(201,168,76,0.2)' }}>
                      <label style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        Montant (minimum 2 500 FCFA)
                      </label>
                      <input
                        type="number"
                        value={partialAmount}
                        onChange={e => setPartialAmount(e.target.value)}
                        min="2500"
                        max={settings?.event_price || 10500}
                        placeholder="Entrez le montant"
                        style={{ width: '100%', background: 'transparent', borderBottom: '1px solid rgba(250,248,243,0.15)', color: '#FAF8F3', padding: '12px 0', fontFamily: 'Jost, sans-serif', fontSize: '14px', outline: 'none' }}
                      />
                      <p style={{ fontFamily: 'Jost', fontSize: '10px', color: 'rgba(201,168,76,0.7)', marginTop: '8px' }}>
                        Restant:{' '}
                        {partialAmount && parseInt(partialAmount) > 0
                          ? Math.max(0, (settings?.event_price || 10500) - parseInt(partialAmount)).toLocaleString('fr-FR')
                          : (settings?.event_price || 10500).toLocaleString('fr-FR')
                        } FCFA
                      </p>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '12px' }}>
                      Méthode de paiement
                    </p>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <button
                        onClick={() => setPayMethod('notchpay')}
                        style={payMethodBtn(payMethod === 'notchpay', '#C9A84C')}
                      >
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>NotchPay</div>
                        <div style={{ fontSize: '11px', color: 'rgba(250,248,243,0.6)' }}>Paiement en ligne sécurisé (Carte, Mobile Money)</div>
                      </button>

                      <button
                        onClick={() => setPayMethod('om')}
                        style={payMethodBtn(payMethod === 'om', '#FF6B00')}
                      >
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>Orange Money</div>
                        <div style={{ fontSize: '11px', color: 'rgba(250,248,243,0.6)' }}>
                          {omNumber} · Payez puis déclarez ci-dessous
                        </div>
                      </button>

                      <button
                        onClick={() => setPayMethod('momo')}
                        style={payMethodBtn(payMethod === 'momo', '#FFCB00')}
                      >
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>MTN MoMo</div>
                        <div style={{ fontSize: '11px', color: 'rgba(250,248,243,0.6)' }}>
                          {momoNumber} · Payez puis déclarez ci-dessous
                        </div>
                      </button>

                      <button
                        onClick={() => setPayMethod('manual')}
                        style={payMethodBtn(payMethod === 'manual', '#C9A84C')}
                      >
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>Déclaration manuelle</div>
                        <div style={{ fontSize: '11px', color: 'rgba(250,248,243,0.6)' }}>
                          Envoyez la preuve au {supportPhone}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Manual / OM / MoMo — reference + screenshot upload */}
                  {isManualMethod && (
                    <>
                      {(payMethod === 'om' || payMethod === 'momo') && (
                        <div style={{ marginBottom: '16px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', padding: '14px' }}>
                          <p style={{ fontFamily: 'Jost', fontSize: '11px', color: 'rgba(250,248,243,0.7)', lineHeight: 1.7 }}>
                            Envoyez <strong style={{ color: '#C9A84C' }}>{(settings?.event_price || 10500).toLocaleString('fr-FR')} FCFA</strong>{' '}
                            au numéro <strong style={{ color: '#C9A84C' }}>{payMethod === 'om' ? omNumber : momoNumber}</strong>,
                            puis téléchargez la capture de confirmation ci-dessous.
                          </p>
                        </div>
                      )}

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                          Référence de transaction (optionnel)
                        </label>
                        <input
                          type="text"
                          value={transactionRef}
                          onChange={e => setTransactionRef(e.target.value)}
                          placeholder="Ex: OM-123456789 ou référence SMS"
                          style={{ display: 'block', width: '100%', background: 'transparent', borderBottom: '1px solid rgba(250,248,243,0.15)', color: '#FAF8F3', padding: '12px 0', fontFamily: 'Jost, sans-serif', fontSize: '14px', fontWeight: 300, outline: 'none' }}
                        />
                      </div>

                      <div style={{ marginBottom: '20px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', padding: '16px' }}>
                        <label style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                          Captures d'écran de paiement
                        </label>
                        <p style={{ fontFamily: 'Jost', fontSize: '11px', color: 'rgba(250,248,243,0.6)', marginBottom: '12px' }}>
                          Téléchargez la confirmation de votre paiement
                        </p>
                        <label
                          style={{ display: 'block', padding: '16px', background: 'rgba(250,248,243,0.05)', border: '2px dashed rgba(201,168,76,0.3)', borderRadius: '4px', cursor: 'pointer', textAlign: 'center', marginBottom: '12px' }}
                        >
                          <input type="file" multiple accept="image/*" onChange={handleScreenshotUpload} style={{ display: 'none' }} />
                          <div style={{ fontFamily: 'Jost', fontSize: '12px', color: '#C9A84C', fontWeight: 500 }}>+ Ajouter des captures</div>
                          <div style={{ fontFamily: 'Jost', fontSize: '10px', color: 'rgba(250,248,243,0.4)', marginTop: '4px' }}>JPG, PNG (max 5MB)</div>
                        </label>
                        {screenshots.length > 0 && (
                          <div>
                            <p style={{ fontFamily: 'Jost', fontSize: '9px', color: 'rgba(201,168,76,0.7)', marginBottom: '8px', textTransform: 'uppercase' }}>
                              {screenshots.length} fichier{screenshots.length > 1 ? 's' : ''} sélectionné{screenshots.length > 1 ? 's' : ''}
                            </p>
                            {screenshots.map((file, index) => (
                              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', marginBottom: '8px' }}>
                                <span style={{ fontFamily: 'Jost', fontSize: '11px', color: '#FAF8F3' }}>📷 {file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeScreenshot(index)}
                                  style={{ background: 'rgba(255,107,107,0.3)', border: '1px solid rgba(255,107,107,0.5)', color: '#FF6B6B', padding: '4px 12px', fontFamily: 'Jost', fontSize: '9px', cursor: 'pointer', borderRadius: '2px' }}
                                >
                                  Supprimer
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Pay button */}
                  <button onClick={onPayment} disabled={loading} style={primaryBtn}>
                    {loading ? 'Traitement...' : isManualMethod ? 'Envoyer la déclaration' : 'Procéder au paiement'}
                  </button>

                  <p style={{ fontFamily: 'Jost', fontSize: '11px', color: 'rgba(250,248,243,0.4)', textAlign: 'center', marginTop: '16px' }}>
                    Date limite : 20 Mai 2026
                  </p>
                </motion.div>
              )}

              {/* STEP 2B: PARTIAL SUCCESS */}
              {step === 'partial-payment' && (
                <motion.div key="partial-payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <AlertCircle size={20} color="#C9A84C" style={{ marginTop: '4px', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Paiement partiel enregistré
                        </p>
                        <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(250,248,243,0.8)' }}>
                          Vous avez payé une partie du montant. Vous pouvez régler le solde ultérieurement.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setStep('payment')} style={{ ...primaryBtn, background: 'transparent', border: '1px solid rgba(201,168,76,0.5)', color: '#C9A84C', marginBottom: '12px' }}>
                    Payer le solde maintenant
                  </button>
                  <button onClick={() => setStep('success')} style={primaryBtn}>Continuer</button>
                </motion.div>
              )}

              {/* STEP 3: SUCCESS */}
              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    style={{ width: 80, height: 80, borderRadius: '50%', border: '1px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }}
                  >
                    ✦
                  </motion.div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: '#FAF8F3', marginBottom: '12px' }}>
                    Paiement Déclaré
                  </h3>
                  <p style={{ fontFamily: 'Jost', fontSize: '13px', color: 'rgba(250,248,243,0.5)', lineHeight: 1.7, marginBottom: '24px' }}>
                    Votre déclaration a été enregistrée.<br />
                    <strong style={{ color: '#C9A84C' }}>Envoyez la capture au {supportPhone}</strong> pour valider votre billet.<br />
                    Le QR Code vous sera envoyé par email après validation.
                  </p>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#C9A84C', fontSize: '1.1rem' }}>
                    À bientôt, Ingénieur(e).
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — Ticket Preview + Info */}
          <div className="space-y-8">
            <div style={{ background: '#FAF8F3', border: '1px solid rgba(201,168,76,0.3)', padding: '40px', position: 'relative', overflow: 'hidden' }}>
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
                <div style={{ width: 80, height: 80, background: '#1A1A1A', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={50} color="#C9A84C" />
                </div>
                <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(26,26,26,0.3)', textTransform: 'uppercase' }}>
                  QR Code unique · Entrée valide une seule fois
                </p>
              </div>
            </div>

            <div style={{ border: '1px solid rgba(201,168,76,0.2)', padding: '24px' }}>
              <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px' }}>
                Comment payer
              </p>
              <div style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(250,248,243,0.6)', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#C9A84C' }}>NotchPay</strong> — paiement en ligne direct
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#FF6B00' }}>Orange Money</strong> — {omNumber}
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#FFCB00' }}>MTN MoMo</strong> — {momoNumber}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(250,248,243,0.4)' }}>
                  Pour OM/MoMo : payez puis déclarez avec une capture d'écran.<br />
                  Validation sous 24h · Date limite : 20 Mai 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const fieldLabel = {
  fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em',
  color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase',
}

const fieldInput = {
  display: 'block', width: '100%',
  background: 'transparent',
  borderBottom: '1px solid rgba(250,248,243,0.15)',
  color: '#FAF8F3',
  padding: '10px 0',
  fontFamily: 'Jost, sans-serif', fontSize: '14px', fontWeight: 300,
  outline: 'none', marginTop: '8px',
}

const fieldError = { color: '#E8D5A3', fontSize: '11px' }

const primaryBtn = {
  width: '100%', padding: '16px',
  background: '#C9A84C', color: '#1A1A1A', border: 'none',
  fontFamily: 'Jost, sans-serif', fontSize: '11px',
  letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 500,
  cursor: 'pointer', transition: 'all 0.3s', display: 'block',
}

const payMethodBtn = (active, accentColor) => ({
  padding: '16px',
  background: active ? `${accentColor}22` : 'transparent',
  border: `2px solid ${active ? accentColor : `${accentColor}33`}`,
  color: '#FAF8F3',
  fontFamily: 'Jost, sans-serif',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.3s',
  width: '100%',
})
