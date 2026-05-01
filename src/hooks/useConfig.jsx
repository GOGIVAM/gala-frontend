import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ConfigContext = createContext(null)

// Valeurs par défaut pendant le chargement
const DEFAULT_CONFIG = {
  settings: {
    event_name: 'Gala Promotion 2',
    event_date: '2026-05-30T19:00:00',
    event_location: 'Douala',
    event_price: 10000,
    event_capacity: 200,
    event_dresscode: 'Black Tie — Noir & Or',
    votes_open: true,
    tickets_open: true,
    support_phone: '',
    support_email: '',
    whatsapp_group_url: '',
    instagram_url: '',
    payment_om_number: '',
    payment_momo_number: '',
  },
  programme: [],
  menu: [],
  awardCategories: [],
  media: { hero: [], gallery: [], dress_code: [] },
}

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API}/api/config`)
        setConfig(res.data)
      } catch (err) {
        console.error('Config fetch error:', err)
        setError('Impossible de charger la configuration.')
        // Garder les valeurs par défaut
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  // Refresh manuel (utile après une mise à jour admin)
  const refresh = async () => {
    try {
      const res = await axios.get(`${API}/api/config`)
      setConfig(res.data)
    } catch {}
  }

  return (
    <ConfigContext.Provider value={{ config, loading, error, refresh }}>
      {children}
    </ConfigContext.Provider>
  )
}

// Hook principal
export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used inside ConfigProvider')
  return ctx
}

// Hooks spécialisés pour chaque section
export function useSettings() {
  const { config, loading } = useConfig()
  return { settings: config.settings, loading }
}

export function useProgramme() {
  const { config, loading } = useConfig()
  return { programme: config.programme, loading }
}

export function useMenu() {
  const { config, loading } = useConfig()
  return { menu: config.menu, loading }
}

export function useAwardCategories() {
  const { config, loading } = useConfig()
  return { categories: config.awardCategories, loading }
}

export function useHeroMedia() {
  const { config, loading } = useConfig()
  return { images: config.media?.hero || [], loading }
}

export function usePlatformInfo() {
  const { config, loading } = useConfig()
  return { platform: config.platform, loading }
}

export function useEventDate() {
  const { config } = useConfig()
  return new Date(config.settings.event_date || '2026-05-30T19:00:00')
}
