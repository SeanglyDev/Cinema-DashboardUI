import { useState, type FormEvent, type ReactElement } from 'react'
import '../css/Auth.css'

type LoginPageProps = {
  defaultEmail?: string
  onOtpRequired: (email: string) => void
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

function LoginPage({ defaultEmail = '', onOtpRequired }: LoginPageProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? 'Login failed')
      }

      if (rememberMe) {
        localStorage.setItem('cinemax_email', email)
      } else {
        localStorage.removeItem('cinemax_email')
      }

      sessionStorage.setItem('cinemax_last_password', password)
      setMessage({ type: 'success', text: data.message ?? 'OTP sent to your email' })
      onOtpRequired(email)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to login' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <section className="auth-card login-card" aria-label="Sign in">
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            <AuthIcon name="clapper" />
          </div>
          <h1 className="auth-title">
            CINE<span>MAX</span>
          </h1>
          <p className="auth-kicker">Cinema Management System</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-label">Email Address</span>
            <span className="auth-input-wrap">
              <AuthIcon name="mail" />
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@cinemax.com"
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <span className="auth-input-wrap">
              <AuthIcon name="lock" />
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
              <button
                className="icon-button"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((value) => !value)}
              >
                <AuthIcon name="eye" />
              </button>
            </span>
          </label>

          <div className="auth-options">
            <label className="auth-check">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button className="auth-link" type="button">
              Forgot password?
            </button>
          </div>

          {message ? <div className={`auth-message ${message.type}`}>{message.text}</div> : null}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            <AuthIcon name="signIn" />
            {isSubmitting ? 'Sending OTP...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="auth-footnote">Secured Role-Based Access Control v4.0</p>
      </section>
    </AuthShell>
  )
}

function AuthShell({ children }: { children: ReactElement }) {
  const perforations = Array.from({ length: 34 }, (_, index) => <span key={index} />)

  return (
    <main className="auth-shell">
      <div className="film-strip left" aria-hidden="true">
        {perforations}
      </div>
      <div className="film-strip right" aria-hidden="true">
        {perforations}
      </div>
      {children}
    </main>
  )
}

function AuthIcon({ name }: { name: string }) {
  const icons: Record<string, ReactElement> = {
    clapper: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm.2-4.3 2.6-.7 2.5 3.5-3.8 1-1.3-3.8Zm6-.4 2.6-.7 2.5 3.5-3.8 1-1.3-3.8Zm6-.3 2.3-.6 1.3 3.7-3.1.8-2.5-3.4Z" />
      </svg>
    ),
    mail: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="m5 8 7 5 7-5" />
      </svg>
    ),
    lock: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
    signIn: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M14 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
        <path d="m10 8 4 4-4 4M14 12H4" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4 6 6.5v5.4c0 4 2.7 7.6 6 8.9 3.3-1.3 6-4.9 6-8.9V6.5L12 4Z" />
        <path d="m9.5 12 1.7 1.7 3.6-4" />
      </svg>
    ),
  }

  return icons[name] ?? <span />
}

export { AuthShell, AuthIcon }
export default LoginPage
