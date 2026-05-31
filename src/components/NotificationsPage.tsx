import { useEffect, useMemo, useState, type ReactNode } from 'react'
import '../css/Dashboard.css'
import Navbar from './Navbar'

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

type Booking = {
  booking_id: number
  user_name: string
  movie_title: string
  show_date: string
  show_time: string
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

type NotificationItem = {
  id: string
  icon: string
  title: ReactNode
  description: string
  time: string
  tone: 'gold' | 'teal' | 'rose' | 'muted'
  isNew: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
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

function NotificationsPage({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadNotifications = async () => {
      setMessage(null)
      try {
        setBookings(await apiRequest<Booking[]>('/api/bookings', { auth: true }))
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to load notifications')
      }
    }
    void loadNotifications()
  }, [])

  const notifications = useMemo(() => buildNotifications(bookings), [bookings])
  const unreadCount = notifications.filter((item) => item.isNew && !readIds.has(item.id)).length

  return (
    <PageShell activeNav="Notifications" onNavigate={onNavigate} notificationCount={unreadCount}>
      <Navbar title="Notifications" subtitle="Alerts and messages" />

      {message ? (
        <div className="dashboard-enter mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {message}
        </div>
      ) : null}

      <section className="content-transition mt-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="m-0 font-serif text-[30px] font-semibold text-[#faf7ee]">Notifications</h1>
          <p className="mt-1 text-sm text-[#7b849d]">System alerts and messages</p>
        </div>
        <button type="button" onClick={() => setReadIds(new Set(notifications.map((item) => item.id)))} className="h-9 rounded-lg border border-white/10 bg-white/[0.035] px-4 text-sm font-bold text-[#b7bfd4] transition duration-200 hover:border-amber-300/30 hover:text-[#f5b031]">
          Mark All Read
        </button>
      </section>

      <section className="dashboard-enter mt-6 overflow-hidden rounded-[16px] border border-white/10 bg-[#101526] shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
        {notifications.map((item) => (
          <article key={item.id} className={['grid grid-cols-[auto_1fr_auto] gap-4 border-b border-white/7 px-6 py-5 last:border-b-0', readIds.has(item.id) || !item.isNew ? 'opacity-45' : ''].join(' ')}>
            <span className={['grid h-10 w-10 place-items-center rounded-lg border', toneClasses(item.tone).icon].join(' ')}>
              <AppIcon name={item.icon} />
            </span>
            <div>
              <h2 className="m-0 text-sm font-extrabold text-[#eef1f8]">{item.title}</h2>
              <p className="mt-1 text-sm text-[#77819e]">{item.description}</p>
              <span className="mt-2 block text-xs text-[#77819e]">{item.time}</span>
            </div>
            {item.isNew && !readIds.has(item.id) ? <span className={['mt-0.5 h-fit rounded-full px-3 py-1 text-xs font-bold before:mr-1.5 before:inline-block before:h-[5px] before:w-[5px] before:rounded-full before:content-[""]', toneClasses(item.tone).badge].join(' ')}>New</span> : null}
          </article>
        ))}
      </section>
    </PageShell>
  )
}

function PageShell({ children, activeNav, onNavigate, notificationCount }: { children: ReactNode; activeNav: string; onNavigate: (page: PageName) => void; notificationCount: number }) {
  const systemItemsWithCount = systemItems.map((item) => item.label === 'Notifications' ? { ...item, badge: String(Math.max(0, notificationCount)) } : item)

  return (
    <div className="min-h-screen bg-[#05070f] text-[#f4f0e6] lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top,rgba(255,178,44,0.08),transparent_22%),linear-gradient(180deg,#050813_0%,#05070f_100%)] lg:h-screen lg:min-h-0 lg:grid-cols-[274px_minmax(0,1fr)]">
        <aside className="relative z-40 flex flex-col justify-between gap-6 border-b border-white/6 bg-[#080c18] px-3.5 py-6 lg:h-screen lg:min-h-0 lg:border-r lg:border-b-0">
          <div className="relative z-10 flex items-center gap-3.5 border-b border-white/8 bg-[#080c18] px-3 py-2 pb-6">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-b from-[#ffcb4c] to-[#f6a517] shadow-[0_12px_30px_rgba(246,165,23,0.25)]"><AppIcon name="clapper" /></div>
            <div><h1 className="m-0 text-base tracking-[0.08em] text-[#ffce62]">CINEMAX</h1><p className="mt-1 text-[11px] tracking-[0.08em] text-[#a3acc2]">ADMIN PORTAL</p></div>
          </div>
          <nav className="dashboard-scrollbar relative z-0 min-h-0 flex-1 overflow-y-auto pt-6">
            <NavSection title="OVERVIEW" items={overviewItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="CONTENT" items={contentItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="VENUE" items={venueItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="TRANSACTIONS" items={transactionItems} activeNav={activeNav} onNavigate={onNavigate} />
            <div className="mb-3 mt-[18px] px-3.5 text-xs tracking-[0.08em] text-[#727b97]">Analytics</div>
            <NavSection title="" items={analyticsItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="SYSTEM" items={systemItemsWithCount} activeNav={activeNav} onNavigate={onNavigate} />
          </nav>
          <div className="relative z-10 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl bg-[#111725] px-3.5 py-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff944d] to-[#ff7a2f] text-sm text-[#fff5ec]">SA</div>
            <div><strong className="block text-[15px] text-[#f7f8fb]">Super Admin</strong><span className="mt-0.5 block text-xs text-[#f0ad31]">Full Access</span></div>
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
    <section className="mt-[18px] first:mt-0">
      {title ? <p className="mb-3 px-3.5 text-xs tracking-[0.08em] text-[#727b97]">{title}</p> : null}
      <div className="grid gap-1.5">
        {items.map((item) => {
          const isActive = activeNav === item.label
          return (
            <button key={item.label} type="button" onClick={() => navigateFromLabel(item.label, onNavigate)} className={['relative flex w-full items-center gap-3 rounded-[10px] px-3.5 py-3 text-left text-sm transition duration-200', isActive ? 'border border-white/85 bg-[linear-gradient(90deg,rgba(245,166,35,0.26),rgba(245,166,35,0.17))] text-[#f5b031] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] before:absolute before:bottom-3 before:left-0 before:top-3 before:w-[3px] before:rounded-r-full before:bg-[#f5a623] before:content-[""]' : 'border border-transparent bg-transparent text-[#78809b] hover:bg-white/4 hover:text-[#e7ebf6]'].join(' ')}>
              <span className={['inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200', isActive ? 'bg-[#4a3517] text-[#f5b031]' : 'bg-[#111725] text-[#77809c]'].join(' ')}><AppIcon name={item.icon} /></span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? <span className={['ml-auto inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none', item.badge === '5' || item.badge === '3' ? 'bg-[#ff4f7d] text-white' : 'bg-[#6b4512] text-[#ffc24a]'].join(' ')}>{item.badge}</span> : null}
            </button>
          )
        })}
      </div>
    </section>
  )
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
    money: <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M15 10c-.5-.8-1.5-1.2-2.6-1.2-1.4 0-2.4.7-2.4 1.8 0 2.8 5 1.2 5 4 0 1.1-1 1.8-2.6 1.8-1.3 0-2.3-.4-3-1.2" /></>,
    x: <path d="m6 6 12 12M18 6 6 18" />,
    report: <><path d="M5 19V9M10 19V5M15 19v-7M20 19v-4" /><path d="M3 19h18" /></>,
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

function buildNotifications(bookings: Booking[]): NotificationItem[] {
  const sorted = [...bookings].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const paid = sorted.find((booking) => booking.status.toLowerCase() !== 'cancelled')
  const cancelled = sorted.find((booking) => booking.status.toLowerCase() === 'cancelled')
  const show = sorted[0]

  return [
    {
      id: 'sold-out',
      icon: 'bell',
      title: <>{show?.movie_title ?? 'Forever & Always'} — <span className="text-amber-300">Sold Out!</span></>,
      description: `Showtime ${formatShowtime(show)} reached 100% occupancy`,
      time: '2 minutes ago',
      tone: 'gold',
      isNew: true,
    },
    {
      id: `payment-${paid?.booking_id ?? 2}`,
      icon: 'money',
      title: <>Payment received — <span className="text-teal-300">{formatMoney(paid?.total_amount ?? 36)}</span></>,
      description: `Booking ${bookingCode(paid?.booking_id ?? 2)} paid via ABA Pay`,
      time: '15 minutes ago',
      tone: 'teal',
      isNew: true,
    },
    {
      id: `cancelled-${cancelled?.booking_id ?? 5}`,
      icon: 'x',
      title: <>Booking Cancelled — <span className="text-rose-300">{bookingCode(cancelled?.booking_id ?? 5)}</span></>,
      description: `${cancelled?.user_name ?? 'Ratha Mao'} cancelled ${cancelled?.movie_title ?? "The Lion's Kingdom"}`,
      time: '1 hour ago',
      tone: 'rose',
      isNew: true,
    },
    {
      id: 'weekly-report',
      icon: 'report',
      title: 'Weekly Report Ready',
      description: 'Analytics report generated successfully',
      time: 'Yesterday',
      tone: 'muted',
      isNew: false,
    },
  ]
}

function toneClasses(tone: NotificationItem['tone']) {
  return {
    gold: { icon: 'border-amber-400/25 bg-amber-400/10 text-amber-300', badge: 'bg-amber-400/12 text-amber-300 before:bg-amber-300' },
    teal: { icon: 'border-teal-400/25 bg-teal-400/10 text-teal-300', badge: 'bg-teal-400/12 text-teal-300 before:bg-teal-300' },
    rose: { icon: 'border-rose-400/25 bg-rose-400/10 text-rose-300', badge: 'bg-rose-400/12 text-rose-300 before:bg-rose-300' },
    muted: { icon: 'border-white/10 bg-white/[0.035] text-[#7b849d]', badge: 'bg-white/8 text-[#c5cbe0] before:bg-[#9aa4c0]' },
  }[tone]
}

async function apiRequest<T>(endpoint: string, options: { method?: string; body?: string; auth?: boolean } = {}) {
  const token = localStorage.getItem('cinemax_token')
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

function formatMoney(value: number | string) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatShowtime(booking?: Booking) {
  if (!booking) return 'Dec 23 20:30'
  return `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(booking.show_date))} ${String(booking.show_time).slice(0, 5)}`
}

export default NotificationsPage
