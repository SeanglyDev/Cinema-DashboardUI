import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent } from 'react'
import { AuthIcon, AuthShell } from './LoginPage'
import './Auth.css'

type TwoFactorAuthPageProps = {
  email: string
  onBack: () => void
  onVerified: (token: string) => void
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const OTP_LENGTH = 6

function TwoFactorAuthPage({ email, onBack, onVerified }: TwoFactorAuthPageProps) {
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ''))
  const [secondsLeft, setSecondsLeft] = useState(27)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(value - 1, 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [secondsLeft])

  const otpCode = otp.join('')

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const nextOtp = [...otp]
    nextOtp[index] = digit
    setOtp(nextOtp)

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pastedCode = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pastedCode) return

    const nextOtp = Array.from({ length: OTP_LENGTH }, (_, index) => pastedCode[index] ?? '')
    setOtp(nextOtp)
    inputRefs.current[Math.min(pastedCode.length, OTP_LENGTH) - 1]?.focus()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (otpCode.length !== OTP_LENGTH) {
      setMessage({ type: 'error', text: 'Please enter the 6 digit verification code.' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? 'OTP verification failed')
      }

      localStorage.setItem('cinemax_token', data.token)
      setMessage({ type: 'success', text: 'Verified. Opening dashboard...' })
      onVerified(data.token)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to verify OTP' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: sessionStorage.getItem('cinemax_last_password') ?? '',
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error('Please go back and sign in again to request a new code.')
      }

      setSecondsLeft(27)
      setOtp(Array.from({ length: OTP_LENGTH }, () => ''))
      inputRefs.current[0]?.focus()
      setMessage({ type: 'success', text: data.message ?? 'New OTP sent.' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to resend OTP' })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthShell>
      <section className="auth-card otp-card" aria-label="Two factor authentication">
        <div className="auth-brand">
          <div className="auth-logo otp-logo" aria-hidden="true">
            <AuthIcon name="lock" />
          </div>
          <h1 className="auth-title otp-title">Two-Factor Auth</h1>
          <p className="otp-subtitle">
            Verification code sent to
            <br />
            <span className="masked-email">{maskEmail(email)}</span>
          </p>
        </div>

        <form className="otp-form" onSubmit={handleSubmit}>
          <div className="otp-inputs" aria-label="Verification code">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${index + 1}`}
                value={digit}
                onChange={(event) => updateDigit(index, event.target.value)}
                onPaste={handlePaste}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace' && !otp[index] && index > 0) {
                    inputRefs.current[index - 1]?.focus()
                  }
                }}
              />
            ))}
          </div>

          <div className="otp-resend">
            {secondsLeft > 0 ? (
              <span>
                Resend in <span className="masked-email">{secondsLeft}s</span>
              </span>
            ) : (
              <button type="button" onClick={handleResend} disabled={isResending}>
                {isResending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          {message ? <div className={`auth-message ${message.type}`}>{message.text}</div> : null}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            <AuthIcon name="shield" />
            {isSubmitting ? 'Verifying...' : 'Verify & Enter'}
          </button>

          <button className="back-link" type="button" onClick={onBack}>
            Back to Login
          </button>
        </form>
      </section>
    </AuthShell>
  )
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@')
  if (!name || !domain) return email

  return `${name.slice(0, 2)}**@${domain}`
}

export default TwoFactorAuthPage
