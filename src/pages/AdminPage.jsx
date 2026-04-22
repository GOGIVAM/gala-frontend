import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { LogOut, Download, Check, Search, Users, TrendingUp, DollarSign, UserCheck } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'))
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [stats, setStats] = useState(null)
  const [participants, setParticipants] = useState([])
  const [tab, setTab] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    if (token) {
      fetchStats()
      fetchParticipants()
    }
  }, [token])

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/stats`, authHeaders)
      setStats(res.data)
    } catch {
      if (!stats) logout()
    }
  }

  const fetchParticipants = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterStatus) params.append('status', filterStatus)
      const res = await axios.get(`${API}/api/admin/participants?${params}`, authHeaders)
      setParticipants(res.data.participants)
    } catch (err) {
      toast.error('Erreur chargement participants')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API}/api/admin/login`, loginData)
      localStorage.setItem('admin_token', res.data.token)
      setToken(res.data.token)
      toast.success('Connecté !')
    } catch {
      toast.error('Identifiants invalides')
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
  }

  const handleExport = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/export`, {
        ...authHeaders,
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `participants_gala_${Date.now()}.csv`
      a.click()
    } catch {
      toast.error('Erreur export')
    }
  }

  const validatePayment = async (id) => {
    try {
      await axios.patch(`${API}/api/admin/participants/${id}/validate`, {}, authHeaders)
      toast.success('Paiement validé, billet envoyé !')
      fetchParticipants()
      fetchStats()
    } catch {
      toast.error('Erreur validation')
    }
  }

  // ── Login Screen ─────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: 400, background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', padding: '48px' }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: '#FAF8F3', fontStyle: 'italic' }}>
              Éclat & Élégance
            </h1>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '9px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginTop: '4px' }}>
              Administration · Gala Promo 2
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {['username', 'password'].map((field) => (
              <div key={field} style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {field === 'username' ? 'Identifiant' : 'Mot de passe'}
                </label>
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  value={loginData[field]}
                  onChange={e => setLoginData(p => ({ ...p, [field]: e.target.value }))}
                  style={{ display: 'block', width: '100%', background: 'transparent', borderBottom: '1px solid rgba(250,248,243,0.15)', color: '#FAF8F3', padding: '10px 0', fontFamily: 'Jost', fontSize: '14px', fontWeight: 300, outline: 'none' }}
                />
              </div>
            ))}
            <button type="submit" style={{ width: '100%', padding: '14px', background: '#C9A84C', color: '#1A1A1A', border: 'none', fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', marginTop: '8px' }}>
              Se connecter
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────
  const S = stats?.summary
  const progress = S ? Math.round((S.paid / S.target) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F0F', color: '#FAF8F3', fontFamily: 'Jost, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1A1A1A', borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.4rem', color: '#FAF8F3' }}>
            Éclat & Élégance
          </span>
          <span style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase', marginLeft: '16px' }}>
            Admin
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', padding: '8px 16px', fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
            <Download size={12} /> Exporter CSV
          </button>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'rgba(250,248,243,0.4)', cursor: 'pointer', fontFamily: 'Jost', fontSize: '12px' }}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#1A1A1A', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '0 32px', display: 'flex', gap: '32px' }}>
        {['dashboard', 'participants', 'awards'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '14px 0', fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', background: 'none', border: 'none', borderBottom: tab === t ? '1px solid #C9A84C' : '1px solid transparent', color: tab === t ? '#C9A84C' : 'rgba(250,248,243,0.3)', cursor: 'pointer', transition: 'all 0.3s' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* DASHBOARD TAB */}
        {tab === 'dashboard' && stats && (
          <div>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Places vendues', value: S.paid, icon: Users, color: '#C9A84C', sub: `/ ${S.target} objectif` },
                { label: 'Revenus', value: `${(S.revenue / 1000).toFixed(0)}K FCFA`, icon: DollarSign, color: '#4CAF50', sub: `${S.paid} × 10 000` },
                { label: 'En attente', value: S.manualPending, icon: TrendingUp, color: '#FF9800', sub: 'paiements manuels' },
                { label: 'Présent(e)s', value: S.checkedIn, icon: UserCheck, color: '#2196F3', sub: 'soir J' },
              ].map((kpi) => {
                const Icon = kpi.icon
                return (
                  <div key={kpi.label} style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.1)', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(250,248,243,0.4)', textTransform: 'uppercase' }}>{kpi.label}</span>
                      <Icon size={16} color={kpi.color} />
                    </div>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: '#FAF8F3', lineHeight: 1 }}>
                      {kpi.value}
                    </div>
                    <div style={{ fontFamily: 'Jost', fontSize: '11px', color: 'rgba(250,248,243,0.3)', marginTop: '8px' }}>{kpi.sub}</div>
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.1)', padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase' }}>Progression billetterie</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#FAF8F3' }}>{progress}%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(250,248,243,0.08)', borderRadius: '2px' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(to right, #C9A84C, #E8D5A3)', borderRadius: '2px' }}
                />
              </div>
            </div>

            {/* By Filière */}
            <div style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.1)', padding: '24px' }}>
              <p style={{ fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '20px' }}>Par filière</p>
              {stats.byFiliere.map(f => (
                <div key={f.filiere} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'Jost', fontSize: '12px', color: 'rgba(250,248,243,0.6)', minWidth: '200px' }}>{f.filiere}</span>
                  <div style={{ flex: 1, height: '3px', background: 'rgba(250,248,243,0.06)', borderRadius: '2px' }}>
                    <div style={{ width: `${(f.paid / S.target) * 100}%`, height: '100%', background: '#C9A84C', borderRadius: '2px', transition: 'width 0.8s' }} />
                  </div>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#FAF8F3', minWidth: '60px', textAlign: 'right' }}>
                    {f.paid}<span style={{ color: '#C9A84C', fontSize: '0.85rem' }}>/{f.count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARTICIPANTS TAB */}
        {tab === 'participants' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)', padding: '10px 16px', flex: 1 }}>
                <Search size={14} color="rgba(250,248,243,0.3)" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchParticipants()}
                  placeholder="Rechercher nom, email..."
                  style={{ background: 'transparent', border: 'none', color: '#FAF8F3', fontFamily: 'Jost', fontSize: '13px', outline: 'none', flex: 1 }}
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); fetchParticipants() }}
                style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)', color: filterStatus ? '#C9A84C' : 'rgba(250,248,243,0.4)', padding: '10px 16px', fontFamily: 'Jost', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">Tous les statuts</option>
                <option value="paid">Payé</option>
                <option value="manual_pending">En attente manuelle</option>
                <option value="pending">En cours</option>
              </select>
              <button onClick={fetchParticipants} style={{ background: '#C9A84C', border: 'none', color: '#1A1A1A', padding: '10px 24px', fontFamily: 'Jost', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Filtrer
              </button>
            </div>

            {/* Table */}
            <div style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.1)', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                    {['Nom', 'Filière', 'Ticket', 'Statut', 'Méthode', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(250,248,243,0.04)', background: i % 2 ? 'rgba(250,248,243,0.01)' : 'transparent' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontFamily: 'Jost', fontSize: '13px', color: '#FAF8F3' }}>{p.prenom} {p.nom}</div>
                        <div style={{ fontFamily: 'Jost', fontSize: '10px', color: 'rgba(250,248,243,0.3)' }}>{p.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'Jost', fontSize: '11px', color: 'rgba(250,248,243,0.5)' }}>{p.filiere}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#C9A84C', fontSize: '0.95rem' }}>{p.ticket_id}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase',
                          padding: '4px 10px',
                          background: p.payment_status === 'paid' ? 'rgba(76,175,80,0.15)' : p.payment_status === 'manual_pending' ? 'rgba(255,152,0,0.15)' : 'rgba(250,248,243,0.06)',
                          color: p.payment_status === 'paid' ? '#4CAF50' : p.payment_status === 'manual_pending' ? '#FF9800' : 'rgba(250,248,243,0.4)',
                          borderRadius: '2px',
                        }}>
                          {p.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'Jost', fontSize: '11px', color: 'rgba(250,248,243,0.4)' }}>
                        {p.payment_method || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'Jost', fontSize: '10px', color: 'rgba(250,248,243,0.3)' }}>
                        {p.payment_date ? new Date(p.payment_date).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {p.payment_status === 'manual_pending' && (
                          <button
                            onClick={() => validatePayment(p.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid rgba(76,175,80,0.4)', color: '#4CAF50', padding: '6px 12px', fontFamily: 'Jost', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
                          >
                            <Check size={10} /> Valider
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {participants.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(250,248,243,0.2)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.2rem' }}>
                  Aucun participant trouvé
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
