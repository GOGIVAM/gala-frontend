import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import ScannerPage from './pages/ScannerPage.jsx'
import AwardsPage from './pages/AwardsPage.jsx'
import Navbar from './components/Navbar/Navbar.jsx'
import Footer from './components/Footer.jsx'

function useRevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    revealEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  })
}

function Layout({ children }) {
  useRevealOnScroll()
  return (
    <div className="grain marble-bg min-h-screen">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/awards" element={<Layout><AwardsPage /></Layout>} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/scanner" element={<ScannerPage />} />
    </Routes>
  )
}
