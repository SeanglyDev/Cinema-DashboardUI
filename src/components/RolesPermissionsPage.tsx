import { useEffect, useMemo, useState, type ReactNode } from 'react'
import '../css/Dashboard.css'
import { apiUrl } from '../lib/api'
import Navbar from './Navbar'

type PageName = 'dashboard' | 'reports' | 'movies' | 'showtimes' | 'cinemas' | 'seat-manager' | 'bookings' | 'payments' | 'users' | 'roles' | 'notifications'

type User = {
  user_id: number
  role_id: number | null
}

type Booking = {
  user_id: number
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

type RoleCard = {
  id: number
  title: string
  icon: string
  summary: string
  permissions: string[]
  tone: 'gold' | 'teal' | 'blue' | 'plain'
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

const roleCards: RoleCard[] = [
  {
    id: 1,
    title: 'Super Admin',
    icon: 'crown',
    summary: 'Full system access',
    permissions: ['All Access'],
    tone: 'gold',
  },
  {
    id: 3,
    title: 'Manager',
    icon: 'manager',
    summary: 'Movies, bookings, reports',
    permissions: ['Movies', 'Bookings', 'Reports'],
    tone: 'teal',
  },
  {
    id: 4,
    title: 'Staff',
    icon: 'staff',
    summary: 'Bookings and tickets',
    permissions: ['Bookings', 'Tickets'],
    tone: 'blue',
  },
  {
    id: 2,
    title: 'Customer',
    icon: 'customer',
    summary: 'Own bookings only',
    permissions: ['View Only'],
    tone: 'plain',
  },
]

function RolesPermissionsPage({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadRoles = async () => {
      setMessage(null)
      try {
        const [userData, bookingData] = await Promise.all([
          apiRequest<User[]>('/api/users', { auth: true }),
          apiRequest<Booking[]>('/api/bookings', { auth: true }).catch(() => []),
        ])
        setUsers(userData)
        setBookings(bookingData)
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to load role data')
      }
    }

    void loadRoles()
  }, [])

  const counts = useMemo(() => {
    const userCounts = users.reduce<Record<number, number>>((acc, user) => {
      const roleId = user.role_id ?? 0
      acc[roleId] = (acc[roleId] ?? 0) + 1
      return acc
    }, {})

    if (!userCounts[2] && bookings.length > 0) {
      userCounts[2] = new Set(bookings.map((booking) => booking.user_id)).size
    }

    return userCounts
  }, [bookings, users])

  return (
    <PageShell activeNav="Roles & Perms" onNavigate={onNavigate}>
      <Navbar title="Roles & Perms" subtitle="Access control" />

      {message ? (
        <div className="dashboard-enter mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {message}
        </div>
      ) : null}

      <section className="content-transition mt-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="m-0 font-serif text-[30px] font-semibold text-[#faf7ee]">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-[#7b849d]">Role-based access control</p>
        </div>
        <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05] transition duration-200 hover:-translate-y-0.5">
          <AppIcon name="plus" />
          Add Role
        </button>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {roleCards.map((role) => (
          <RoleAccessCard key={role.title} role={role} userCount={counts[role.id] ?? 0} />
        ))}
      </section>
    </PageShell>
  )
}

function RoleAccessCard({ role, userCount }: { role: RoleCard; userCount: number }) {
  const tone = {
    gold: {
      card: 'border-amber-300/25',
      text: 'text-amber-300',
      badge: 'bg-amber-400/12 text-amber-300 before:bg-amber-300',
    },
    teal: {
      card: 'border-white/10',
      text: 'text-teal-300',
      badge: 'bg-teal-400/12 text-teal-300 before:bg-teal-300',
    },
    blue: {
      card: 'border-white/10',
      text: 'text-sky-300',
      badge: 'bg-sky-400/12 text-sky-300 before:bg-sky-300',
    },
    plain: {
      card: 'border-white/10',
      text: 'text-[#9aa4c0]',
      badge: 'bg-white/8 text-[#c5cbe0] before:bg-[#9aa4c0]',
    },
  }[role.tone]

  return (
    <article className={`dashboard-enter rounded-[16px] border bg-[#101526] px-6 py-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/30 ${tone.card}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className={tone.text}>
            <AppIcon name={role.icon} />
          </span>
          <h2 className="m-0 truncate text-base font-extrabold text-[#eef1f8]">{role.title}</h2>
        </div>
        <span className={`before:mr-1.5 inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold before:h-[5px] before:w-[5px] before:rounded-full before:content-[''] ${tone.badge}`}>
          {userCount} {userCount === 1 ? 'user' : 'users'}
        </span>
      </div>
      <p className="mt-4 text-sm text-[#838ca8]">{role.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {role.permissions.map((permission) => (
          <span key={permission} className={`before:mr-1.5 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold before:h-[5px] before:w-[5px] before:rounded-full before:content-[''] ${tone.badge}`}>
            {permission}
          </span>
        ))}
      </div>
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
    plus: <path d="M12 5v14M5 12h14" />,
    crown: <path d="m4 8 4 4 4-7 4 7 4-4-2 10H6L4 8Z" />,
    manager: <><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M5 20a7 7 0 0 1 14 0M8 20v-3M16 20v-3" /></>,
    staff: <><path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M6 20a6 6 0 0 1 12 0" /></>,
    customer: <><path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
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

export default RolesPermissionsPage
