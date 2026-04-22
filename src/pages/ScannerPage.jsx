import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ScannerPage() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'))
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null) // null | { valid, participant, message }
  const [manualInput, setManualInput] = useState('')
  const [stats, setStats] = useState({ scanned: 0, total: 0 })
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const lastScanRef = useRef(null)

  useEffect(() => {
    if (token) fetchStats()
    return () => stopCamera()
  }, [token])

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStats({
        scanned: res.data.summary.checkedIn,
        total: res.data.summary.paid,
      })
    } catch {}
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setScanning(true)
      scanLoop()
    } catch {
      toast.error('Accès caméra refusé')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  // QR scanning using canvas + BarcodeDetector API (modern browsers)
  const scanLoop = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const detect = async () => {
      if (!videoRef.current || !streamRef.current) return
      const v = videoRef.current
      if (v.readyState !== v.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(detect)
        return
      }

      canvas.width = v.videoWidth
      canvas.height = v.videoHeight
      ctx.drawImage(v, 0, 0)

      try {
        if ('BarcodeDetector' in window) {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
          const codes = await detector.detect(canvas)
          if (codes.length > 0) {
            const value = codes[0].rawValue
            if (value !== lastScanRef.current) {
              lastScanRef.current = value
              await processScan(value)
              setTimeout(() => { lastScanRef.current = null }, 3000)
            }
          }
        }
      } catch {}

      if (streamRef.current) requestAnimationFrame(detect)
    }

    requestAnimationFrame(detect)
  }

  const processScan = async (qrPayload) => {
    try {
      const res = await axios.post(
        `${API}/api/tickets/scan`,
        { qrPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult({ valid: true, ...res.data })
      fetchStats()
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
    } catch (err) {
      const data = err.response?.data
      setResult({ valid: false, message: data?.message || 'Erreur scan', participant: data?.participant })
      if (navigator.vibrate) navigator.vibrate(500)
    }
    // Auto-clear after 4s
    setTimeout(() => setResult(null), 4000)
  }

  const handleManualScan = async () => {
    if (!manualInput.trim()) return
    await processScan(manualInput.trim())
    setManualInput('')
  }

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#FAF8F3', fontStyle: 'italic', marginBottom: '24px' }}>
          Scanner · Gala Promo 2
        </h2>
        <p style={{ color: 'rgba(250,248,243,0.4)', fontFamily: 'Jost', fontSize: '13px', marginBottom: '24px' }}>
          Connectez-vous depuis la page Admin d'abord.
        </p>
        <button
          onClick={() => window.location.href = '/admin'}
          style={{ background: '#C9A84C', color: '#1A1A1A', border: 'none', padding: '12px 32px', fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Admin
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F0F', color: '#FAF8F3', fontFamily: 'Jost, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#1A1A1A', borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.2rem' }}>Scanner · Entrée</span>
          <span style={{ marginLeft: '12px', fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase' }}>Gala Promo 2</span>
        </div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#C9A84C' }}>
          {stats.scanned}<span style={{ color: 'rgba(201,168,76,0.3)', fontSize: '1rem' }}>/{stats.total}</span>
        </div>
      </div>

      {/* Scanner Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '24px' }}>
        {/* Video Feed */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '1', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }}
          />

          {/* Scan frame */}
          {scanning && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                {/* Corner brackets */}
                {[
                  { top: 0, left: 0, borderTop: '2px solid #C9A84C', borderLeft: '2px solid #C9A84C' },
                  { top: 0, right: 0, borderTop: '2px solid #C9A84C', borderRight: '2px solid #C9A84C' },
                  { bottom: 0, left: 0, borderBottom: '2px solid #C9A84C', borderLeft: '2px solid #C9A84C' },
                  { bottom: 0, right: 0, borderBottom: '2px solid #C9A84C', borderRight: '2px solid #C9A84C' },
                ].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
                ))}
                {/* Scan line */}
                <motion.div
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }}
                />
              </div>
            </div>
          )}

          {!scanning && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div style={{ fontSize: '3rem', color: 'rgba(201,168,76,0.3)' }}>⬡</div>
              <p style={{ fontFamily: 'Jost', fontSize: '11px', color: 'rgba(250,248,243,0.3)', letterSpacing: '0.1em' }}>Caméra inactive</p>
            </div>
          )}
        </div>

        {/* Result overlay */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'fixed', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.85)',
                zIndex: 100, padding: '24px',
              }}
              onClick={() => setResult(null)}
            >
              <div style={{
                background: result.valid ? '#1A3A1A' : '#3A1A1A',
                border: `1px solid ${result.valid ? 'rgba(76,175,80,0.5)' : 'rgba(244,67,54,0.5)'}`,
                padding: '40px', textAlign: 'center', maxWidth: '340px', width: '100%',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                  {result.valid ? '✅' : '⚠️'}
                </div>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 300,
                  color: result.valid ? '#4CAF50' : '#F44336', marginBottom: '8px',
                }}>
                  {result.valid ? 'Entrée Validée' : 'Accès Refusé'}
                </h3>
                {result.participant && (
                  <p style={{ fontFamily: 'Jost', fontSize: '16px', color: '#FAF8F3', marginBottom: '8px', fontWeight: 500 }}>
                    {result.participant}
                  </p>
                )}
                {result.filiere && (
                  <p style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(250,248,243,0.5)', marginBottom: '8px' }}>
                    {result.filiere}
                  </p>
                )}
                <p style={{ fontFamily: 'Jost', fontSize: '12px', color: result.valid ? 'rgba(76,175,80,0.8)' : 'rgba(244,67,54,0.8)' }}>
                  {result.message}
                </p>
                <p style={{ fontFamily: 'Jost', fontSize: '10px', color: 'rgba(250,248,243,0.2)', marginTop: '16px' }}>
                  Toucher pour fermer
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
          <button
            onClick={scanning ? stopCamera : startCamera}
            style={{
              flex: 1, padding: '14px',
              background: scanning ? 'rgba(244,67,54,0.15)' : '#C9A84C',
              border: scanning ? '1px solid rgba(244,67,54,0.4)' : 'none',
              color: scanning ? '#F44336' : '#1A1A1A',
              fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.3em',
              textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500,
            }}
          >
            {scanning ? '⏹ Arrêter' : '▶ Démarrer le scan'}
          </button>
          <button
            onClick={fetchStats}
            style={{ padding: '14px 16px', background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', fontFamily: 'Jost', fontSize: '12px', cursor: 'pointer' }}
          >
            ↻
          </button>
        </div>

        {/* Manual input fallback */}
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <p style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(250,248,243,0.3)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Saisie manuelle (secours)
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualScan()}
              placeholder="Coller le contenu du QR Code..."
              style={{ flex: 1, background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)', color: '#FAF8F3', padding: '10px 12px', fontFamily: 'Jost', fontSize: '12px', outline: 'none' }}
            />
            <button
              onClick={handleManualScan}
              style={{ background: '#C9A84C', border: 'none', color: '#1A1A1A', padding: '10px 16px', fontFamily: 'Jost', fontSize: '10px', cursor: 'pointer', fontWeight: 500 }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
