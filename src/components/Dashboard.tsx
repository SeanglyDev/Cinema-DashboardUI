import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import '../css/Dashboard.css'
import { apiUrl } from '../lib/api'
import Navbar from './Navbar'

type NavItem = {
  label: string
  icon: string
  active?: boolean
  badge?: string
}

type StatTone = 'gold' | 'teal' | 'blue' | 'pink'

type StatCard = {
  title: string
  value: number
  prefix?: string
  tone: StatTone
  icon: string
}

type MovieTone = 'gold' | 'amber' | 'teal' | 'sky'

type MovieItem = {
  title: string
  tickets: number
  progress: number
  tone: MovieTone
}

type BookingItem = {
  id: string
  customer: string
  movie: string
  amount: number
  status: 'Paid' | 'Pending' | 'Cancelled'
}

type PageName = 'dashboard' | 'reports' | 'movies' | 'showtimes' | 'cinemas' | 'seat-manager' | 'bookings' | 'payments' | 'users' | 'roles' | 'notifications'

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

const systemItems: NavItem[] = [
  { label: 'Users', icon: 'user' },
  { label: 'Roles & Perms', icon: 'shield' },
  { label: 'Settings', icon: 'settings' },
]

const statCards: StatCard[] = [
  { title: 'Total Collected', value: 48290, prefix: '$', tone: 'gold', icon: 'dollar' },
  { title: 'Tickets Sold', value: 48290, prefix: '$', tone: 'teal', icon: 'ticket' },
  { title: 'Total Bookings', value: 48290, prefix: '$', tone: 'blue', icon: 'receipt' },
  { title: 'Active Customers', value: 48290, prefix: '$', tone: 'pink', icon: 'group' },
]

const monthlyRevenue = [44, 34, 52, 38, 58, 49, 61, 46, 55, 63, 50, 67]

const months = ['Jan', 'Fb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const cardToneClasses: Record<StatTone, string> = {
  gold: 'border border-amber-400/20 bg-amber-400/10 text-amber-300',
  teal: 'border border-teal-400/20 bg-teal-400/10 text-teal-300',
  blue: 'border border-blue-400/20 bg-blue-400/10 text-blue-300',
  pink: 'border border-pink-400/20 bg-pink-400/10 text-pink-300',
}

const movieToneClasses: Record<MovieTone, string> = {
  gold: 'bg-amber-400',
  amber: 'bg-amber-300',
  teal: 'bg-teal-400',
  sky: 'bg-sky-300',
}

const statusClasses: Record<BookingItem['status'], string> = {
  Paid: 'bg-emerald-400/10 text-emerald-300 before:bg-emerald-300',
  Pending: 'bg-amber-400/10 text-amber-300 before:bg-amber-300',
  Cancelled: 'bg-pink-500/10 text-pink-400 before:bg-pink-400',
}

const panelClasses =
  'rounded-[14px] border border-white/6 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]'

function Dashboard({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <div className="min-h-screen bg-[#05070f] text-[#f4f0e6] lg:h-screen lg:overflow-hidden ">
      <div className="cinema-shell-grid grid min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,178,44,0.08),transparent_22%),linear-gradient(180deg,#050813_0%,#05070f_100%)] lg:h-screen lg:min-h-0">
        <aside className="cinema-sidebar">
          <div className="cinema-sidebar-brand">
            <div className="cinema-logo-mark">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon"><path d="M5 7h14v12H5z" /><path d="M5 11h14M8 7l2-3M13 7l2-3M18 7l2-3" /></svg>
            </div>
            <div>
              <h1 className="cinema-logo-title">CINE<span>MAX</span></h1>
              <span className="cinema-logo-subtitle">ADMIN PORTAL</span>
            </div>
          </div>
  const [statCards, setStatCards] = useState<StatCard[]>([
    { title: 'Total Collected', value: 0, prefix: '$', tone: 'gold', icon: 'dollar' },
    { title: 'Tickets Sold', value: 0, prefix: '$', tone: 'teal', icon: 'ticket' },
    { title: 'Total Bookings', value: 0, prefix: '$', tone: 'blue', icon: 'receipt' },
    { title: 'Active Customers', value: 0, prefix: '$', tone: 'pink', icon: 'group' },
  ])
  const [topMovies, setTopMovies] = useState<MovieItem[]>([])
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('cinemax_token')
        
        // Fetch bookings
        const bookingsRes = await fetch(apiUrl('/api/bookings'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        const bookingsData = await bookingsRes.json()
        
        // Fetch movies
        const moviesRes = await fetch(apiUrl('/api/movies'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        const moviesData = await moviesRes.json()
        
        // Fetch users
        const usersRes = await fetch(apiUrl('/api/users'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        const usersData = await usersRes.json()

        // Process bookings data
        if (bookingsData.success && bookingsData.data) {
          const recentBookings = bookingsData.data.slice(0, 4).map((b: any) => ({
            id: `#BK${String(b.booking_id).padStart(3, '0')}`,
            customer: b.user_name || 'Unknown',
            movie: b.movie_title || 'Unknown',
            amount: parseFloat(b.total_amount) || 0,
            status: (b.status || 'Pending').charAt(0).toUpperCase() + (b.status || 'Pending').slice(1) as 'Paid' | 'Pending' | 'Cancelled',
          }))
          setBookings(recentBookings)

          // Calculate total collected
          const totalCollected = bookingsData.data.reduce((sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0), 0)
          const totalBookingsCount = bookingsData.data.length

          setStatCards((prev) => [
            { ...prev[0], value: Math.round(totalCollected) },
            { ...prev[1], value: totalBookingsCount },
            { ...prev[2], value: totalBookingsCount },
            { ...prev[3], value: usersData.data?.length || 0 },
          ])
        }

        // Process movies data
        if (moviesData.success && moviesData.data) {
          const movieTones: MovieTone[] = ['gold', 'amber', 'teal', 'sky']
          const topMoviesList = moviesData.data.slice(0, 4).map((m: any, idx: number) => ({
            title: m.title,
            tickets: Math.floor(Math.random() * 500) + 100,
            progress: Math.floor(Math.random() * 100) + 1,
            tone: movieTones[idx % movieTones.length],
          }))
          setTopMovies(topMoviesList)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoadi{loading ? <div className="text-xl">-</div> : <AnimatedStat value={card.value} prefix={card.prefix} />}
      }
    }

    fetchDashboardData()
  }, [])

          <nav className="cinema-sidebar-nav dashboard-scrollbar">
            <NavSection title="OVERVIEW" items={overviewItems} activeNav={activeNav} setActiveNav={setActiveNav} onNavigate={onNavigate} />
            <NavSection title="CONTENT" items={contentItems} activeNav={activeNav} setActiveNav={setActiveNav} onNavigate={onNavigate} />
            <NavSection title="VENUE" items={venueItems} activeNav={activeNav} setActiveNav={setActiveNav} onNavigate={onNavigate} />
            <NavSection title="TRANSACTIONS" items={transactionItems} activeNav={activeNav} setActiveNav={setActiveNav} onNavigate={onNavigate} />
            <div className="cinema-section-title">Analytics</div>
            <NavSection
              title=""
              items={[{ label: 'Reports', icon: 'chart' }]}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              onNavigate={onNavigate}
            />
            <NavSection title="SYSTEM" items={systemItems} activeNav={activeNav} setActiveNav={setActiveNav} onNavigate={onNavigate} />
          </nav>

          <div className="cinema-admin-card">
            <div className="cinema-admin-avatar">
              SA
            </div>
            <div>
              <strong className="cinema-admin-name">Super Admin</strong>
              <span className="cinema-admin-role">Full Access</span>
            </div>
            <button type="button" aria-label="Open profile menu" className="border-0 bg-transparent text-[#98a0b7]">
              ...
            </button>
          </div>
        </aside>

        <main className="content-transition dashboard-scrollbar min-h-0 mt-0 px-3 pb-3 sm:px-4 sm:pb-4 lg:h-screen lg:overflow-y-auto lg:px-5 lg:pb-5">
          <Navbar title="Dashboard" subtitle="Welcome back, Super Admin" />

          <section className="mt-10 flex flex-col items-stretch justify-between gap-4 rounded-[14px] border border-amber-400/25 bg-[radial-gradient(circle_at_top_left,rgba(255,181,49,0.14),transparent_34%),linear-gradient(100deg,#1a1410_0%,#151018_58%,#100b12_100%)] px-5 py-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)] xl:flex-row xl:items-center">
            <div>
              <span className="text-[13px] tracking-[0.08em] text-[#d59628]">MARCH 25, 2026 • WEDNESDAY</span>
              <h3 className="mt-1 font-serif text-2xl font-medium text-[#faf7ee]">Good Morning, Supper Admin</h3>
              <p className="mt-2 text-sm text-[#c18b31]">8 shows scheduled today • 78% average occupancy</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-3.5 py-2.5 text-sm font-semibold text-[#231507]"
                onClick={() => onNavigate('reports')}
              >
                <DashboardIcon name="chart" />
                Reports
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3.5 py-2.5 text-sm text-[#9098b6]"
                onClick={() => onNavigate('bookings')}
              >
                <DashboardIcon name="ticket" />
                Booking
              </button>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {statCards.map((card, index) => (
              <article
                key={card.title}
                className={`${panelClasses} dashboard-enter stat-card px-5 py-4`}
                style={{ animationDelay: `${120 + index * 80}ms` }}
              >
                <div className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg ${cardToneClasses[card.tone]}`}>
                  <DashboardIcon name={card.icon} />
                </div>
                <AnimatedStat value={card.value} prefix={card.prefix} />
                <span className="mt-0.5 block text-sm text-[#d1d6e7]">{card.title}</span>
              </article>
            ))}
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.95fr)]">
            <article className={`${panelClasses} dashboard-enter revenue-panel`} style={{ animationDelay: '420ms' }}>
              <div className="flex flex-col justify-between gap-3 px-4 pt-4 md:flex-row md:items-start">
                <div>
                  <h3 className="m-0 font-serif text-lg font-medium text-[#faf7ee]">Revenue Overview</h3>
                  <p className="mt-1 text-sm text-[#707997]">Monthly • 2026</p>
                </div>
                <div className="inline-flex gap-1 self-start rounded-[10px] border border-white/6 bg-white/4 p-1">
                  <button type="button" className="rounded-lg bg-amber-400/16 px-2.5 py-2 text-xs text-amber-300">
                    Monthly
                  </button>
                  <button type="button" className="rounded-lg px-2.5 py-2 text-xs text-[#9098b6]">
                    Weekly
                  </button>
                  <button type="button" className="rounded-lg px-2.5 py-2 text-xs text-[#9098b6]">
                    Daily
                  </button>
                </div>
              </div>

              <div className="mt-3 grid min-h-[168px] grid-cols-6 items-end gap-3 border-t border-white/6 px-4 pb-4 pt-7 sm:grid-cols-8 lg:grid-cols-12 lg:gap-[22px]">
                {monthlyRevenue.map((value, index) => (
                  <div key={months[index]} className="grid justify-items-center gap-2.5">
                    <div className="flex h-28 w-5 items-end sm:w-[24px]">
                      <div
                        className="revenue-bar w-full rounded-t-md"
                        style={{ '--bar-height': `${value}%`, animationDelay: `${index * 55}ms` } as CSSProperties}
                      />
                    </div>
                    <span className="text-xs text-[#76809d]">{months[index]}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className={`${panelClasses} dashboard-enter flex flex-col px-4 py-4`} style={{ animationDelay: '520ms' }}>
              <div>
                <h3 className="m-0 font-serif text-lg font-medium text-[#faf7ee]">Occupancy</h3>
                <p className="mt-0.5 text-xs text-[#707997]">All halls today</p>
              </div>

              <div className="occupancy-ring mx-auto my-8 grid h-[128px] w-[128px] place-items-center rounded-full">
                <div className="grid h-[92px] w-[92px] place-items-center rounded-full bg-[#111727] text-[#fbf7ef]">
                  <AnimatedStat value={78} suffix=" %" className="text-2xl font-medium" />
                </div>
              </div>

              <div className="mt-auto grid gap-2">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-sm text-[#8890ad]">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Booked</span>
                  <strong className="font-medium text-[#f7f7f4]">78%</strong>
                </div>
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-sm text-[#8890ad]">
                  <span className="h-2 w-2 rounded-full bg-[#525b77]" />
                  <span>Available</span>
                  <strong className="font-medium text-[#f7f7f4]">22%</strong>
                </div>
              </div>
            </article>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <article className={`${panelClasses} dashboard-enter p-4`} style={{ animationDelay: '620ms' }}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h3 className="m-0 font-serif text-lg font-medium text-[#faf7ee]">Top Movies</h3>
                  <p className="mt-0.5 text-xs text-[#707997]">By ticket sales</p>
                </div>
                <button
                  type="button"
                  className="self-start rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-[#9098b6]"
                  onClick={() => onNavigate('movies')}
                >
                  View All
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                {topMovies.map((movie, index) => (
                  <div
                    key={`${movie.title}-${movie.tickets}`}
                    className="dashboard-list-item grid gap-2"
                    style={{ animationDelay: `${720 + index * 80}ms` }}
                  >
                    <div className="flex items-center justify-between gap-3 text-[#f7f6f2]">
                      <span className="truncate">🦁 {movie.title}</span>
                      <AnimatedStat
                        value={movie.tickets}
                        suffix=" tkts"
                        className="text-base font-bold text-[#f7f6f2]"
                      />
                    </div>
                    <div className="progress-track h-[7px] w-full overflow-hidden rounded-full bg-[#22283a]">
                      <div
                        className={`progress-fill h-full rounded-full ${movieToneClasses[movie.tone]}`}
                        style={
                          {
                            '--progress-width': `${movie.progress}%`,
                            animationDelay: `${880 + index * 90}ms`,
                          } as CSSProperties
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className={`${panelClasses} dashboard-enter p-4`} style={{ animationDelay: '700ms' }}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h3 className="m-0 font-serif text-lg font-medium text-[#faf7ee]">Recent Bookings</h3>
                  <p className="mt-0.5 text-xs text-[#707997]">Latest booking activity</p>
                </div>
                <button
                  type="button"
                  className="self-start rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-[#9098b6]"
                >
                  View All
                </button>
              </div>

              <div className="mt-[18px] overflow-x-auto">
                <table className="min-w-[560px] w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-[11px] font-medium text-[#727c98]">ID BOOKING</th>
                      <th className="px-3 py-3 text-left text-[11px] font-medium text-[#727c98]">CUSTOMER</th>
                      <th className="px-3 py-3 text-left text-[11px] font-medium text-[#727c98]">MOVIE</th>
                      <th className="px-3 py-3 text-left text-[11px] font-medium text-[#727c98]">AMOUNT</th>
                      <th className="px-3 py-3 text-left text-[11px] font-medium text-[#727c98]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => (
                      <tr
                        key={booking.id}
                        className="booking-row"
                        style={{ animationDelay: `${800 + index * 70}ms` }}
                      >
                        <td className="px-3 py-3 text-[15px] text-amber-300">{booking.id}</td>
                        <td className="px-3 py-3 text-[15px] text-[#e7ebf6]">{booking.customer}</td>
                        <td className="px-3 py-3 text-[15px] text-[#e7ebf6]">{booking.movie}</td>
                        <td className="px-3 py-3 text-[15px] text-amber-300">
                          <AnimatedStat
                            value={booking.amount}
                            prefix="$"
                            decimals={2}
                            className="text-[15px] font-medium text-amber-300"
                          />
                        </td>
                        <td className="px-3 py-3 text-[15px] text-[#e7ebf6]">
                          <span
                            className={`before:mr-1.5 inline-flex items-center rounded-full px-2.5 py-1 text-xs before:h-[5px] before:w-[5px] before:rounded-full before:content-[''] ${statusClasses[booking.status]}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  )
}

function AnimatedStat({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = 'block text-2xl font-medium tracking-[0.04em] text-[#f8f7f3]',
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let animationFrame = 0
    const duration = 2300
    const startTime = performance.now()

    const updateValue = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setDisplayValue(value * easedProgress)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateValue)
      }
    }

    animationFrame = requestAnimationFrame(updateValue)

    return () => cancelAnimationFrame(animationFrame)
  }, [value])

  return (
    <strong className={`stat-value ${className}`}>
      {prefix}
      {displayValue.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </strong>
  )
}

function NavSection({
  title,
  items,
  activeNav,
  setActiveNav,
  onNavigate,
}: {
  title: string
  items: NavItem[]
  activeNav: string
  setActiveNav: (label: string) => void
  onNavigate?: (page: PageName) => void
}) {
  return (
    <section className="cinema-nav-section">
      {title ? <p className="cinema-section-title">{title}</p> : null}
      <div className="cinema-nav-list">
        {items.map((item) => {
          const isActive = activeNav === item.label

          return (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setActiveNav(item.label)
              if (item.label === 'Dashboard') onNavigate?.('dashboard')
              if (item.label === 'Reports') onNavigate?.('reports')
                if (item.label === 'Movies') onNavigate?.('movies')
                if (item.label === 'Showtimes') onNavigate?.('showtimes')
                if (item.label === 'Cinemas & Halls') onNavigate?.('cinemas')
                if (item.label === 'Seat Manager' || item.label === 'Seat Managers') onNavigate?.('seat-manager')
                if (item.label === 'Bookings') onNavigate?.('bookings')
                if (item.label === 'Payments') onNavigate?.('payments')
                if (item.label === 'Users') onNavigate?.('users')
                if (item.label === 'Roles & Perms') onNavigate?.('roles')
                if (item.label === 'Notifications') onNavigate?.('notifications')
              }}
            className={[
              'cinema-nav-item',
              isActive
                ? 'is-active'
                : '',
            ].join(' ')}
          >
            <span
              className={[
                'cinema-nav-icon',
                isActive ? '' : '',
              ].join(' ')}
            >
              <DashboardIcon name={item.icon} />
            </span>
            <span className="cinema-nav-label">{item.label}</span>
            {item.badge ? (
              <span
                className={[
                  'cinema-nav-badge',
                  item.badge === '5' ? 'is-pink' : 'is-amber',
                ].join(' ')}
              >
                {item.badge}
              </span>
            ) : null}
          </button>
        )})}
      </div>
    </section>
  )
}

function DashboardIcon({ name }: { name: string }) {
  const icons: Record<string, ReactElement> = {
    gauge: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M6.5 15a5.5 5.5 0 1 1 11 0" />
        <path d="M12 12l3-3" />
        <path d="M5 19h14" />
      </svg>
    ),
    film: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 4v16M15 4v16M5 8h4M15 8h4M5 16h4M15 16h4" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M8 3v6M16 3v6M4 10h16" />
      </svg>
    ),
    building: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M4 20h16M6 20V8l6-4 6 4v12M9 12h.01M12 12h.01M15 12h.01" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M8 14a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
        <path d="M16 13a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM3.5 19a4.5 4.5 0 0 1 9 0M13 19a4 4 0 0 1 7.5-1.8" />
      </svg>
    ),
    ticket: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z" />
        <path d="M12 7v10" />
      </svg>
    ),
    wallet: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" />
        <path d="M15 12h5M15 12a1 1 0 1 0 0 .01" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M5 19V9M10 19V5M15 19v-7M20 19v-4M3 19h18" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M12 4 6 6.5v5.4c0 4 2.7 7.6 6 8.9 3.3-1.3 6-4.9 6-8.9V6.5L12 4Z" />
        <path d="M12 9v6M9 12h6" />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M6 17h12l-1.2-1.4a2 2 0 0 1-.5-1.3V11a4.3 4.3 0 1 0-8.6 0v3.3a2 2 0 0 1-.5 1.3L6 17Z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    ),
    dollar: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M12 4v16M15.5 7.5A3.5 3.5 0 0 0 12 6c-1.9 0-3.5 1.1-3.5 2.6 0 3.7 7 1.5 7 5 0 1.5-1.6 2.6-3.5 2.6A3.5 3.5 0 0 1 8.5 15" />
      </svg>
    ),
    receipt: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M7 4h10v16l-2-1.5L13 20l-2-1.5L9 20l-2-1.5L5 20V6a2 2 0 0 1 2-2Z" />
        <path d="M9 9h6M9 13h6" />
      </svg>
    ),
    group: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path d="M4 19a5 5 0 0 1 10 0M13 18a4 4 0 0 1 7 0" />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="m12 3 1.5 2.7 3.1.4.7 3 .7.5-.7.5-.7 3-3.1.4L12 21l-1.5-2.7-3.1-.4-.7-3-.7-.5.7-.5.7-3 3.1-.4L12 3Z" />
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    ),
  }

  return icons[name] ?? <span />
}

export default Dashboard
