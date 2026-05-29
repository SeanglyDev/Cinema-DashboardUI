import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import MoviesPage from './components/MoviesPage'
import ReportsPage from './components/ReportsPage'
import ShowtimesPage from './components/ShowtimesPage'
import TwoFactorAuthPage from './components/TwoFactorAuthPage'
import './App.css'

type PageName = 'dashboard' | 'reports' | 'movies' | 'showtimes'

function App() {
  const [page, setPage] = useState<PageName>(() => getPageFromHash())
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'authenticated'>(() =>
    localStorage.getItem('cinemax_token') ? 'authenticated' : 'login',
  )
  const [pendingEmail, setPendingEmail] = useState(() => localStorage.getItem('cinemax_email') ?? '')

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash())

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigatePage = (nextPage: PageName) => {
    setPage(nextPage)
    window.location.hash = nextPage
  }

  if (authStep === 'login') {
    return (
      <LoginPage
        defaultEmail={pendingEmail}
        onOtpRequired={(email) => {
          setPendingEmail(email)
          setAuthStep('otp')
        }}
      />
    )
  }

  if (authStep === 'otp') {
    return (
      <TwoFactorAuthPage
        email={pendingEmail}
        onBack={() => setAuthStep('login')}
        onVerified={() => {
          sessionStorage.removeItem('cinemax_last_password')
          setAuthStep('authenticated')
        }}
      />
    )
  }

  if (page === 'reports') return <ReportsPage onNavigate={navigatePage} />
  if (page === 'movies') return <MoviesPage onNavigate={navigatePage} />
  if (page === 'showtimes') return <ShowtimesPage onNavigate={navigatePage} />

  return <Dashboard onNavigate={navigatePage} />
}

function getPageFromHash(): PageName {
  const hashPage = window.location.hash.replace('#', '').toLowerCase()

  if (hashPage === 'reports') return 'reports'
  if (hashPage === 'movies') return 'movies'
  if (hashPage === 'showtimes') return 'showtimes'
  return 'dashboard'
}

export default App
