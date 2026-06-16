import { useEffect, useMemo, useState, type ReactNode } from 'react'
import '../css/Dashboard.css'
import { apiUrl } from '../lib/api'
import Navbar from './Navbar'

type PageName = 'dashboard' | 'reports' | 'movies' | 'showtimes' | 'cinemas' | 'seat-manager' | 'bookings' | 'payments' | 'users' | 'roles' | 'notifications'

type Booking = {
  booking_id: number
  status: string
  total_amount: number | string
  created_at: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

type NavItem = {
  label: string
  icon: string
  badge?: string
}

type Payment = {
  id: string
  bookingId: number
  method: 'Visa' | 'ABA Pay' | 'Cash'
  amount: number
  status: 'paid' | 'pending' | 'cancelled'
  date: string
  transactionId: string
}

const overviewItems: NavItem[] = [{ label: 'Dashboard', icon: 'gauge' }]
const contentItems: NavItem[] = [
  { label: 'Movies', icon: 'film', badge: '12' },
  { label: 'Showtimes', icon: 'calendar' },
]
const venueItems: NavItem[] = [
  { label: 'Cinemas & Halls', icon: 'building' },
  { label: 'Seat Manager', icon: 'seat' },
]
const transactionItems: NavItem[] = [
  { label: 'Bookings', icon: 'ticket', badge: '5' },
  { label: 'Payments', icon: 'wallet' },
]
const analyticsItems: NavItem[] = [{ label: 'Reports', icon: 'chart' }]
const systemItems: NavItem[] = [
  { label: 'Users', icon: 'users' },
  { label: 'Roles & Perms', icon: 'shield' },
  { label: 'Settings', icon: 'settings' },
  { label: 'Notifications', icon: 'bell', badge: '3' },
]

function PaymentsPage({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadPayments = async () => {
      setIsLoading(true)
      setMessage(null)
      try {
        setBookings(await apiRequest<Booking[]>('/api/bookings', { auth: true }))
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to load payments')
      } finally {
        setIsLoading(false)
      }
    }

    void loadPayments()
  }, [])

  const payments = useMemo(() => bookings.map(toPayment), [bookings])
  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) =>
        `${payment.id} ${bookingCode(payment.bookingId)} ${payment.method} ${payment.status} ${payment.transactionId}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [payments, searchQuery],
  )

  const paidPayments = payments.filter((payment) => payment.status === 'paid')
  const totalCollected = paidPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const cardTotal = paidPayments.filter((payment) => payment.method === 'Visa').reduce((sum, payment) => sum + payment.amount, 0)
  const mobileTotal = paidPayments.filter((payment) => payment.method === 'ABA Pay').reduce((sum, payment) => sum + payment.amount, 0)
  const cashTotal = paidPayments.filter((payment) => payment.method === 'Cash').reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <PageShell activeNav="Payments" onNavigate={onNavigate}>
      <Navbar title="Payments" subtitle="Transaction history" />

      {message ? (
        <div className="dashboard-enter mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {message}
        </div>
      ) : null}

      <section className="content-transition mt-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="m-0 font-serif text-[30px] font-semibold text-[#faf7ee]">Payments</h1>
          <p className="mt-1 text-sm text-[#7b849d]">Transaction history and financial records</p>
        </div>
        <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border border-white/10 bg-[#101420] px-3 lg:hidden">
          <AppIcon name="search" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search..." className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#eef1f8] outline-none placeholder:text-[#69728e]" />
        </label>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon="dollar" label="Total Collected" value={formatMoney(totalCollected)} tone="gold" />
        <SummaryCard icon="visa" label="Card Payments" value={formatMoney(cardTotal)} tone="teal" />
        <SummaryCard icon="phone" label="Mobile Pay" value={formatMoney(mobileTotal)} tone="blue" />
        <SummaryCard icon="cash" label="Cash" value={formatMoney(cashTotal)} tone="plain" />
      </section>

      <section className="dashboard-enter mt-5 overflow-hidden rounded-[16px] border border-white/10 bg-[#101526] shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
        <div className="grid grid-cols-[150px_150px_170px_140px_160px_190px_1fr] border-b border-white/7 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#717b99] max-xl:hidden">
          <span>ID</span>
          <span>Booking</span>
          <span>Method</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Date</span>
          <span>Transaction ID</span>
        </div>

        {isLoading ? <EmptyState text="Loading payments..." /> : null}
        {!isLoading && filteredPayments.length === 0 ? <EmptyState text="No payments found." /> : null}

        {!isLoading && filteredPayments.map((payment) => (
          <article key={payment.id} className="grid gap-3 border-b border-white/6 px-5 py-4 last:border-b-0 xl:grid-cols-[150px_150px_170px_140px_160px_190px_1fr] xl:items-center">
            <span className="font-mono text-sm font-bold text-amber-300">{payment.id}</span>
            <span className="font-mono text-sm font-bold text-[#dce1ed]">{bookingCode(payment.bookingId)}</span>
            <span className="inline-flex items-center gap-2 font-semibold text-[#dce1ed]">
              <PaymentMethodIcon method={payment.method} />
              {payment.method}
            </span>
            <span className="font-mono text-sm font-bold text-amber-300">{formatMoney(payment.amount)}</span>
            <StatusBadge status={payment.status} />
            <span className="text-sm text-[#99a3bd]">{formatDate(payment.date)}</span>
            <span className="font-mono text-xs text-[#77819e]">{payment.transactionId}</span>
          </article>
        ))}
      </section>
    </PageShell>
  )
}

function SummaryCard({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: 'gold' | 'teal' | 'blue' | 'plain' }) {
  const toneClasses = {
    gold: 'border-amber-400/20 text-amber-300 shadow-[inset_0_1px_0_rgba(255,183,45,0.08)]',
    teal: 'border-teal-400/15 text-teal-300 shadow-[inset_0_1px_0_rgba(20,214,185,0.08)]',
    blue: 'border-sky-400/15 text-sky-300 shadow-[inset_0_1px_0_rgba(71,164,255,0.08)]',
    plain: 'border-white/10 text-[#dce1ed]',
  }[tone]

  return (
    <article className="dashboard-enter rounded-[16px] border border-white/10 bg-[#101526] px-5 py-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/30">
      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border bg-white/[0.035] ${toneClasses}`}>
        <AppIcon name={icon} />
      </span>
      <strong className="mt-6 block font-serif text-[26px] leading-none text-[#faf7ee]">{value}</strong>
      <span className="mt-1.5 block text-sm text-[#9ba4bd]">{label}</span>
    </article>
  )
}

function PageShell({ children, activeNav, onNavigate }: { children: ReactNode; activeNav: string; onNavigate: (page: PageName) => void }) {
  return (
    <div className="min-h-screen bg-[#05070f] text-[#f4f0e6] lg:h-screen lg:overflow-hidden">
      <div className="cinema-shell-grid grid min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,178,44,0.08),transparent_22%),linear-gradient(180deg,#050813_0%,#05070f_100%)] lg:h-screen lg:min-h-0">
        <aside className="cinema-sidebar">
          <div className="cinema-sidebar-brand">
            <div className="cinema-logo-mark">
              <AppIcon name="clapper" />
            </div>
            <div>
              <h1 className="cinema-logo-title">CINE<span>MAX</span></h1>
              <span className="cinema-logo-subtitle">ADMIN PORTAL</span>
            </div>
          </div>
          <nav className="cinema-sidebar-nav dashboard-scrollbar">
            <NavSection title="OVERVIEW" items={overviewItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="CONTENT" items={contentItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="VENUE" items={venueItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="TRANSACTIONS" items={transactionItems} activeNav={activeNav} onNavigate={onNavigate} />
            <div className="cinema-section-title">Analytics</div>
            <NavSection title="" items={analyticsItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="SYSTEM" items={systemItems} activeNav={activeNav} onNavigate={onNavigate} />
          </nav>
          <div className="cinema-admin-card">
            <div className="cinema-admin-avatar">SA</div>
            <div>
              <strong className="cinema-admin-name">Super Admin</strong>
              <span className="cinema-admin-role">Full Access</span>
            </div>
            <button type="button" aria-label="Open profile menu" className="border-0 bg-transparent text-[#98a0b7]">...</button>
          </div>
        </aside>
        <main className="content-transition dashboard-scrollbar min-h-0 px-3.5 pb-6 sm:px-5 lg:h-screen lg:overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

function NavSection({ title, items, activeNav, onNavigate }: { title: string; items: NavItem[]; activeNav: string; onNavigate: (page: PageName) => void }) {
  return (
    <section className="cinema-nav-section">
      {title ? <p className="cinema-section-title">{title}</p> : null}
      <div className="cinema-nav-list">
        {items.map((item) => {
          const isActive = activeNav === item.label
          return (
            <button key={item.label} type="button" onClick={() => navigateFromLabel(item.label, onNavigate)} className={['cinema-nav-item', isActive ? 'is-active' : ''].join(' ')}>
              <span className={['cinema-nav-icon', isActive ? '' : ''].join(' ')}>
                <AppIcon name={item.icon} />
              </span>
              <span className="cinema-nav-label">{item.label}</span>
              {item.badge ? <span className={['cinema-nav-badge', item.badge === '5' || item.badge === '3' ? 'bg-[#ff4f7d] text-white' : 'bg-[#6b4512] text-[#ffc24a]'].join(' ')}>{item.badge}</span> : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function StatusBadge({ status }: { status: Payment['status'] }) {
  const classes = {
    paid: 'bg-teal-400/10 text-teal-300 before:bg-teal-300',
    pending: 'bg-amber-400/10 text-amber-300 before:bg-amber-300',
    cancelled: 'bg-rose-400/10 text-rose-300 before:bg-rose-300',
  }[status]

  return <span className={`before:mr-1.5 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold capitalize before:h-[5px] before:w-[5px] before:rounded-full before:content-[''] ${classes}`}>{status}</span>
}

function PaymentMethodIcon({ method }: { method: Payment['method'] }) {
  if (method === 'Visa') return <span className="rounded-sm bg-sky-400 px-1 text-[8px] font-black text-[#04111e]">VISA</span>
  if (method === 'ABA Pay') return <span className="inline-block h-4 w-2 rounded-sm border-2 border-teal-300" />
  return <span className="text-[#abb4cc]"><AppIcon name="cash" /></span>
}

function EmptyState({ text }: { text: string }) {
  return <div className="px-5 py-10 text-center text-sm text-[#7b849d]">{text}</div>
}

function AppIcon({ name }: { name: string }) {
  const icon = {
    gauge: <path d="M6.5 15a5.5 5.5 0 1 1 11 0M12 12l3-3M5 19h14" />,
    film: <><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9 4v16M15 4v16M5 8h4M15 8h4M5 16h4M15 16h4" /></>,
    calendar: <><rect x="4" y="6" width="16" height="14" rx="2" /><path d="M8 3v6M16 3v6M4 10h16" /></>,
    building: <path d="M4 20h16M6 20V8l6-4 6 4v12M9 12h.01M12 12h.01M15 12h.01" />,
    seat: <path d="M7 11V6a3 3 0 0 1 6 0v5M5 11h11a3 3 0 0 1 3 3v5H5v-8Z" />,
    ticket: <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z" />,
    wallet: <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9ZM15 12h5" />,
    chart: <path d="M5 19V9M10 19V5M15 19v-7M20 19v-4M3 19h18" />,
    users: <path d="M8 14a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM16 13a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM3.5 19a4.5 4.5 0 0 1 9 0M13 19a4 4 0 0 1 7.5-1.8" />,
    shield: <><path d="M12 4 6 6.5v5.4c0 4 2.7 7.6 6 8.9 3.3-1.3 6-4.9 6-8.9V6.5L12 4Z" /><path d="M12 9v6M9 12h6" /></>,
    settings: <><path d="m12 3 1.5 2.7 3.1.4.7 3 .7.5-.7.5-.7 3-3.1.4L12 21l-1.5-2.7-3.1-.4-.7-3-.7-.5.7-.5.7-3 3.1-.4L12 3Z" /><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></>,
    bell: <><path d="M6 17h12l-1.2-1.4a2 2 0 0 1-.5-1.3V11a4.3 4.3 0 1 0-8.6 0v3.3a2 2 0 0 1-.5 1.3L6 17Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
    search: <path d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm9 2-3.5-3.5" />,
    dollar: <path d="M12 3v18M16 7.5c-.7-1-2-1.5-3.6-1.5-2 0-3.4 1-3.4 2.5 0 4 7 1.8 7 6 0 1.5-1.4 2.5-3.6 2.5-1.8 0-3.2-.6-4.1-1.8" />,
    visa: <><rect x="4" y="7" width="16" height="10" rx="2" /><path d="M8 12h8" /></>,
    phone: <><rect x="8" y="3" width="8" height="18" rx="2" /><path d="M11 18h2" /></>,
    cash: <><rect x="4" y="7" width="16" height="10" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M7 10h.01M17 14h.01" /></>,
    clapper: <><path d="M4 8h16v11H4z" /><path d="m4 8 3-4h4L8 8m3 0 3-4h4l-3 4" /></>,
  }[name]

  return <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">{icon}</svg>
}

function navigateFromLabel(label: string, onNavigate: (page: PageName) => void) {
  if (label === 'Dashboard') onNavigate('dashboard')
  if (label === 'Reports') onNavigate('reports')
  if (label === 'Movies') onNavigate('movies')
  if (label === 'Showtimes') onNavigate('showtimes')
  if (label === 'Cinemas & Halls') onNavigate('cinemas')
  if (label === 'Seat Manager' || label === 'Seat Managers') onNavigate('seat-manager')
  if (label === 'Bookings') onNavigate('bookings')
  if (label === 'Payments') onNavigate('payments')
  if (label === 'Users') onNavigate('users')
  if (label === 'Roles & Perms') onNavigate('roles')
  if (label === 'Notifications') onNavigate('notifications')
}

function toPayment(booking: Booking, index: number): Payment {
  const amount = Number(booking.total_amount || 0)
  const status = booking.status.toLowerCase() === 'cancelled' ? 'cancelled' : booking.status.toLowerCase() === 'pending' ? 'pending' : 'paid'
  const method = (['Visa', 'ABA Pay', 'Cash'] as const)[index % 3]
  return {
    id: `#P${String(index + 1).padStart(3, '0')}`,
    bookingId: booking.booking_id,
    method,
    amount,
    status,
    date: booking.created_at,
    transactionId: status === 'paid' ? `TXN_${String(booking.booking_id * 48291).padStart(7, '0')}` : '-',
  }
}

async function apiRequest<T>(endpoint: string, options: { method?: string; body?: string; auth?: boolean } = {}) {
  const token = localStorage.getItem('cinemax_token')
  const response = await fetch(apiUrl(endpoint), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body,
  })
  const result = (await response.json()) as ApiResponse<T>
  if (!response.ok || !result.success) throw new Error(result.message ?? 'Request failed')
  return result.data as T
}

function bookingCode(id: number) {
  return `#BK${String(id).padStart(3, '0')}`
}

function formatMoney(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export default PaymentsPage
