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
import { canAccessPage, firstAllowedPage, getCurrentRoleId, type PageName } from './lib/rbac'
import './App.css'

function App() {
  const [page, setPage] = useState<PageName>(() => getPageFromHash())
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'authenticated'>(() =>
    hasUsableToken() ? 'authenticated' : 'login',
  )
  const [pendingEmail, setPendingEmail] = useState(() => localStorage.getItem('cinemax_email') ?? '')

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash())
    const handleAuthExpired = () => {
      clearAuthSession()
      setAuthStep('login')
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('cinemax:auth-expired', handleAuthExpired)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('cinemax:auth-expired', handleAuthExpired)
    }
  }, [])

  useEffect(() => {
    if (authStep !== 'authenticated') return

    const roleId = getCurrentRoleId()
    if (canAccessPage(roleId, page)) return

    const allowedPage = firstAllowedPage(roleId)
    setPage(allowedPage)
    window.location.hash = allowedPage
  }, [authStep, page])

  const navigatePage = (nextPage: PageName) => {
    const roleId = getCurrentRoleId()
    const allowedPage = canAccessPage(roleId, nextPage) ? nextPage : firstAllowedPage(roleId)
    setPage(allowedPage)
    window.location.hash = allowedPage
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

  const roleId = getCurrentRoleId()
  const allowedPage = canAccessPage(roleId, page) ? page : firstAllowedPage(roleId)
  if (allowedPage !== page) return null

  if (allowedPage === 'reports') return <ReportsPage onNavigate={navigatePage} />
  if (allowedPage === 'movies') return <MoviesPage onNavigate={navigatePage} />
  if (allowedPage === 'showtimes') return <ShowtimesPage onNavigate={navigatePage} />
  if (allowedPage === 'cinemas') return <CinemasPage onNavigate={navigatePage} />
  if (allowedPage === 'seat-manager') return <SeatManagerPage onNavigate={navigatePage} />
  if (allowedPage === 'bookings') return <BookingsPage onNavigate={navigatePage} />
  if (allowedPage === 'payments') return <PaymentsPage onNavigate={navigatePage} />
  if (allowedPage === 'users') return <UsersPage onNavigate={navigatePage} />
  if (allowedPage === 'roles') return <RolesPermissionsPage onNavigate={navigatePage} />
  if (allowedPage === 'notifications') return <NotificationsPage onNavigate={navigatePage} />

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

function hasUsableToken() {
  const token = localStorage.getItem('cinemax_token')
  if (!token) return false

  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number }
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      clearAuthSession()
      return false
    }
    return true
  } catch {
    clearAuthSession()
    return false
  }
}

function clearAuthSession() {
  localStorage.removeItem('cinemax_token')
  sessionStorage.removeItem('cinemax_last_password')
}
