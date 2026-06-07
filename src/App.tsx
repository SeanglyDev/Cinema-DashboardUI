import { useEffect, useState } from 'react'
import BookingsPage from './components/BookingsPage'
import CinemasPage from './components/CinemasPage'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import MoviesPage from './components/MoviesPage'
import NotificationsPage from './components/NotificationsPage'
import PaymentsPage from './components/PaymentsPage'
import ReportsPage from './components/ReportsPage'
import RolesPermissionsPage from './components/RolesPermissionsPage'
import SeatManagerPage from './components/SeatManagerPage'
import ShowtimesPage from './components/ShowtimesPage'
import TwoFactorAuthPage from './components/TwoFactorAuthPage'
import UsersPage from './components/UsersPage'
import './App.css'

type PageName =
  | 'dashboard'
  | 'reports'
  | 'movies'
  | 'showtimes'
  | 'cinemas'
  | 'seat-manager'
  | 'bookings'
  | 'payments'
  | 'users'
  | 'roles'
  | 'notifications'

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
  if (page === 'cinemas') return <CinemasPage onNavigate={navigatePage} />
  if (page === 'seat-manager') return <SeatManagerPage onNavigate={navigatePage} />
  if (page === 'bookings') return <BookingsPage onNavigate={navigatePage} />
  if (page === 'payments') return <PaymentsPage onNavigate={navigatePage} />
  if (page === 'users') return <UsersPage onNavigate={navigatePage} />
  if (page === 'roles') return <RolesPermissionsPage onNavigate={navigatePage} />
  if (page === 'notifications') return <NotificationsPage onNavigate={navigatePage} />

  return <Dashboard onNavigate={navigatePage} />
}

function getPageFromHash(): PageName {
  const hashPage = window.location.hash.replace('#', '').toLowerCase()

  if (hashPage === 'reports') return 'reports'
  if (hashPage === 'movies') return 'movies'
  if (hashPage === 'showtimes') return 'showtimes'
  if (hashPage === 'cinemas') return 'cinemas'
  if (hashPage === 'seat-manager') return 'seat-manager'
  if (hashPage === 'bookings') return 'bookings'
  if (hashPage === 'payments') return 'payments'
  if (hashPage === 'users') return 'users'
  if (hashPage === 'roles') return 'roles'
  if (hashPage === 'notifications') return 'notifications'
  return 'dashboard'
}

export default App
