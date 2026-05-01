# Gala Frontend - Intégration des mises à jour

## 📋 Changements Backend à Intégrer

### 1. Infos Plateforme
Les infos de la plateforme sont maintenant disponibles via:
- GET `/api/config/platform` - Infos seules
- GET `/api/config` - Config complète (inclut platform info)

### 2. Paiements par Tranche
Nouveaux endpoints admin pour gérer les paiements partiels et manuels.

---

## 🎨 Frontend - Points à Mettre à Jour

### Pages

#### 1. HomePage.jsx
- Afficher logo/banner de la plateforme depuis `platform.logo_url` et `platform.banner_url`
- Afficher le nom et l'édition: `${platform.name} ${platform.edition}`
- Date: `platform.event_date`
- Location: `platform.location`
- Organisation: `platform.organization_name`

**Exemple:**
```jsx
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [platform, setPlatform] = useState(null)

  useEffect(() => {
    fetch('/api/config/platform')
      .then(r => r.json())
      .then(data => setPlatform(data))
      .catch(err => console.error('Erreur chargement plateforme:', err))
  }, [])

  if (!platform) return <div>Chargement...</div>

  return (
    <div>
      <img src={platform.logo_url} alt={platform.name} />
      <h1>{platform.name} {platform.edition}</h1>
      <p>{platform.location}</p>
      <p>{new Date(platform.event_date).toLocaleDateString('fr-FR')}</p>
    </div>
  )
}
```

#### 2. AdminPage.jsx - Nouvelle Section "Paiements"

Ajouter des onglets/sections pour:
- **Participants payés**
- **Paiements en attente**
- **Paiements partiels** (NEW)
- **Gestion manuelle des paiements** (NEW)

### 3. Composant Admin: PaiementsPartials.jsx (NEW)

```jsx
import { useEffect, useState } from 'react'

export default function PaiementsPartials() {
  const [participants, setParticipants] = useState([])
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [partials, setPartials] = useState(null)
  const [form, setForm] = useState({ amount: '', transactionRef: '', notes: '' })
  const token = localStorage.getItem('admin_token')

  // Charger les participants avec statut 'partial'
  useEffect(() => {
    fetch('/api/admin/participants?status=partial', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setParticipants(data.participants))
  }, [token])

  // Charger détails paiements partiels
  const loadPartials = (participantId) => {
    fetch(`/api/admin/participants/${participantId}/partials`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setSelectedParticipant(participantId)
        setPartials(data)
      })
  }

  // Ajouter paiement partiel
  const handleAddPartial = async (e) => {
    e.preventDefault()
    const response = await fetch(
      `/api/admin/participants/${selectedParticipant}/partial`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseInt(form.amount),
          transactionRef: form.transactionRef,
          notes: form.notes
        })
      }
    )
    const result = await response.json()
    alert(result.message)
    loadPartials(selectedParticipant)
    setForm({ amount: '', transactionRef: '', notes: '' })
  }

  // Confirmer paiement complet
  const handleConfirmFull = async () => {
    const response = await fetch(
      `/api/admin/participants/${selectedParticipant}/confirm-full`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: 'Confirmé manuellement' })
      }
    )
    const result = await response.json()
    alert(result.message)
    loadPartials(selectedParticipant)
  }

  return (
    <div className="admin-partials">
      <h2>Gestion des Paiements Partiels</h2>

      <div className="two-columns">
        {/* Liste des participants */}
        <div className="participants-list">
          <h3>Participants ({participants.length})</h3>
          <ul>
            {participants.map(p => (
              <li
                key={p.id}
                onClick={() => loadPartials(p.id)}
                className={selectedParticipant === p.id ? 'active' : ''}
              >
                {p.prenom} {p.nom}
                <span className="badge">{p.filiere}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Détails et formulaire */}
        {partials && (
          <div className="partials-detail">
            <h3>Détails du Paiement</h3>
            <div className="stats">
              <div>Montant total: <strong>{partials.totalAmount.toLocaleString()} FCAF</strong></div>
              <div>Montant payé: <strong className="paid">{partials.paidAmount.toLocaleString()} FCAF</strong></div>
              <div>Restant: <strong className="warning">{partials.remaining.toLocaleString()} FCAF</strong></div>
              <div>Statut: <strong>{partials.status}</strong></div>
            </div>

            {/* Historique des paiements partiels */}
            <div className="transactions-history">
              <h4>Historique des transactions</h4>
              {partials.transactions?.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Montant</th>
                      <th>Référence</th>
                      <th>Méthode</th>
                      <th>Notes</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partials.transactions.map((tx, idx) => (
                      <tr key={idx}>
                        <td>{tx.amount.toLocaleString()} FCAF</td>
                        <td>{tx.transactionRef}</td>
                        <td>{tx.method}</td>
                        <td>{tx.notes}</td>
                        <td>{new Date(tx.addedAt).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucune transaction</p>
              )}
            </div>

            {/* Formulaire ajouter paiement */}
            <form onSubmit={handleAddPartial} className="add-partial-form">
              <h4>Ajouter un Paiement Partiel</h4>
              <input
                type="number"
                placeholder="Montant (FCAF)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Référence transaction (optionnel)"
                value={form.transactionRef}
                onChange={(e) => setForm({ ...form, transactionRef: e.target.value })}
              />
              <textarea
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <button type="submit">Ajouter Paiement</button>
            </form>

            {/* Confirmer paiement complet */}
            {partials.status === 'partial' && partials.remaining === 0 && (
              <button onClick={handleConfirmFull} className="btn-confirm">
                ✅ Confirmer le Paiement Complet
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

### 4. Composant Admin: ConfirmationManuelle.jsx (NEW)

```jsx
import { useState } from 'react'

export default function ConfirmationManuelle() {
  const [form, setForm] = useState({
    participantId: '',
    transactionRef: '',
    amount: '',
    notes: ''
  })
  const [result, setResult] = useState(null)
  const token = localStorage.getItem('admin_token')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const response = await fetch(
      `/api/admin/participants/${form.participantId}/confirm-by-transaction`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionRef: form.transactionRef,
          amount: form.amount ? parseInt(form.amount) : undefined,
          notes: form.notes
        })
      }
    )

    const data = await response.json()
    setResult(data)

    if (response.ok) {
      setForm({ participantId: '', transactionRef: '', amount: '', notes: '' })
      setTimeout(() => setResult(null), 5000)
    }
  }

  return (
    <div className="admin-manual-confirmation">
      <h2>Confirmation Manuelle de Paiement</h2>
      <p className="info">Entrez l'ID du participant et l'ID de transaction pour confirmer un paiement manuellement.</p>

      <form onSubmit={handleSubmit} className="manual-form">
        <input
          type="text"
          placeholder="ID Participant (UUID)"
          value={form.participantId}
          onChange={(e) => setForm({ ...form, participantId: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="ID Transaction (ex: OM_12345678)"
          value={form.transactionRef}
          onChange={(e) => setForm({ ...form, transactionRef: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Montant (optionnel - par défaut 10000)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button type="submit">Confirmer le Paiement</button>
      </form>

      {result && (
        <div className={`result ${result.message?.includes('confirmé') ? 'success' : 'error'}`}>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  )
}
```

### 5. Mettre à jour AdminPage.jsx

```jsx
import { useState } from 'react'
import ParticipantsView from './AdminComponents/ParticipantsView'
import StatsView from './AdminComponents/StatsView'
import PaiementsPartials from './AdminComponents/PaiementsPartials'  // NEW
import ConfirmationManuelle from './AdminComponents/ConfirmationManuelle'  // NEW
import CMS from './AdminComponents/CMS'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('stats')

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      <nav className="admin-tabs">
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistiques
        </button>
        <button
          className={activeTab === 'participants' ? 'active' : ''}
          onClick={() => setActiveTab('participants')}
        >
          👥 Participants
        </button>
        <button
          className={activeTab === 'partials' ? 'active' : ''}
          onClick={() => setActiveTab('partials')}
        >
          💳 Paiements Partiels (NEW)
        </button>
        <button
          className={activeTab === 'manual' ? 'active' : ''}
          onClick={() => setActiveTab('manual')}
        >
          ✅ Confirmation Manuelle (NEW)
        </button>
        <button
          className={activeTab === 'cms' ? 'active' : ''}
          onClick={() => setActiveTab('cms')}
        >
          ⚙️ CMS & Plateforme
        </button>
      </nav>

      <div className="admin-content">
        {activeTab === 'stats' && <StatsView />}
        {activeTab === 'participants' && <ParticipantsView />}
        {activeTab === 'partials' && <PaiementsPartials />}
        {activeTab === 'manual' && <ConfirmationManuelle />}
        {activeTab === 'cms' && <CMS />}
      </div>
    </div>
  )
}
```

### 6. Mettre à jour CMS.jsx

Ajouter onglet pour gérer les infos de la plateforme:

```jsx
// Dans CMS.jsx, ajouter:

const [platformTab, setPlatformTab] = useState(false)
const [platformInfo, setPlatformInfo] = useState({
  name: '',
  edition: '',
  location: '',
  event_date: '',
  logo_url: '',
  banner_url: '',
  ticket_price: 10000,
  description: '',
  organization_name: '',
  organization_email: ''
})

// Charger infos plateforme au démarrage
useEffect(() => {
  fetch('/api/config/platform')
    .then(r => r.json())
    .then(data => setPlatformInfo(data))
}, [])

// Sauvegarder infos plateforme
const savePlatformInfo = async () => {
  const response = await fetch('/api/admin/cms/platform-info', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(platformInfo)
  })
  const result = await response.json()
  alert(result.message)
}

// UI pour éditer les infos
return (
  <div>
    {/* Onglets existants... */}
    <button onClick={() => setPlatformTab(!platformTab)}>
      🏢 Infos Plateforme
    </button>

    {platformTab && (
      <div className="platform-edit">
        <h3>Informations de la Plateforme</h3>
        <input
          placeholder="Nom"
          value={platformInfo.name}
          onChange={(e) => setPlatformInfo({ ...platformInfo, name: e.target.value })}
        />
        <input
          placeholder="Édition (ex: 2026)"
          value={platformInfo.edition}
          onChange={(e) => setPlatformInfo({ ...platformInfo, edition: e.target.value })}
        />
        <input
          placeholder="Lieu"
          value={platformInfo.location}
          onChange={(e) => setPlatformInfo({ ...platformInfo, location: e.target.value })}
        />
        <input
          type="date"
          value={platformInfo.event_date}
          onChange={(e) => setPlatformInfo({ ...platformInfo, event_date: e.target.value })}
        />
        <input
          type="url"
          placeholder="URL Logo"
          value={platformInfo.logo_url}
          onChange={(e) => setPlatformInfo({ ...platformInfo, logo_url: e.target.value })}
        />
        <input
          type="url"
          placeholder="URL Banner"
          value={platformInfo.banner_url}
          onChange={(e) => setPlatformInfo({ ...platformInfo, banner_url: e.target.value })}
        />
        <input
          type="number"
          placeholder="Prix du ticket (FCAF)"
          value={platformInfo.ticket_price}
          onChange={(e) => setPlatformInfo({ ...platformInfo, ticket_price: parseInt(e.target.value) })}
        />
        <textarea
          placeholder="Description"
          value={platformInfo.description}
          onChange={(e) => setPlatformInfo({ ...platformInfo, description: e.target.value })}
        />
        <input
          placeholder="Nom organisation"
          value={platformInfo.organization_name}
          onChange={(e) => setPlatformInfo({ ...platformInfo, organization_name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email organisation"
          value={platformInfo.organization_email}
          onChange={(e) => setPlatformInfo({ ...platformInfo, organization_email: e.target.value })}
        />
        <button onClick={savePlatformInfo}>💾 Sauvegarder</button>
      </div>
    )}
  </div>
)
```

---

## 📦 Hooks/Utils à Créer

### usePlatformInfo.js
```jsx
import { useEffect, useState } from 'react'

export function usePlatformInfo() {
  const [platform, setPlatform] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/config/platform')
      .then(r => r.json())
      .then(data => {
        setPlatform(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { platform, loading, error }
}
```

### useAdminPayments.js
```jsx
import { useState, useCallback } from 'react'

export function useAdminPayments(token) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addPartialPayment = useCallback(async (participantId, { amount, transactionRef, notes }) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/participants/${participantId}/partial`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount, transactionRef, notes })
        }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [token])

  const confirmByTransaction = useCallback(async (participantId, { transactionRef, amount, notes }) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/participants/${participantId}/confirm-by-transaction`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ transactionRef, amount, notes })
        }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [token])

  return { addPartialPayment, confirmByTransaction, loading, error }
}
```

---

## 🎯 Checklist Intégration Frontend

- [ ] Créer useP latformInfo.js
- [ ] Créer useAdminPayments.js
- [ ] Mettre à jour HomePage.jsx pour afficher platform info
- [ ] Créer PaiementsPartials.jsx
- [ ] Créer ConfirmationManuelle.jsx
- [ ] Mettre à jour AdminPage.jsx avec nouveaux onglets
- [ ] Mettre à jour CMS.jsx avec gestion platform info
- [ ] Tester tous les endpoints
- [ ] Ajouter styles CSS pour les nouveaux composants

