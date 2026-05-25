import { useState } from 'react'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import ReportsPage from './components/ReportsPage'
import TwoFactorAuthPage from './components/TwoFactorAuthPage'
import './App.css'

function App() {
  const [page, setPage] = useState<'dashboard' | 'reports'>('dashboard')
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'authenticated'>(() =>
    localStorage.getItem('cinemax_token') ? 'authenticated' : 'login',
  )
  const [pendingEmail, setPendingEmail] = useState(() => localStorage.getItem('cinemax_email') ?? '')

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

  return page === 'reports' ? <ReportsPage onNavigate={setPage} /> : <Dashboard onNavigate={setPage} />
}

export default App
