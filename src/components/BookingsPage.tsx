import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import '../css/Dashboard.css'
import Navbar from './Navbar'

type PageName = 'dashboard' | 'reports' | 'movies' | 'showtimes' | 'cinemas' | 'bookings' | 'payments' | 'users' | 'roles'
type BookingView = 'list' | 'form' | 'details'

type Booking = {
  booking_id: number
  user_id: number
  show_time_id: number
  status: string
  total_amount: number | string
  created_at: string
  user_name: string
  user_email: string
  movie_title: string
  hall_name: string
  cinema_name: string
  show_date: string
  show_time: string
  seats?: BookingSeat[]
}

type BookingSeat = {
  seat_number: string
  seat_type: string
  price: number | string
}

type Showtime = {
  show_time_id: number
  show_date: string
  show_time: string
  status: string
  movie_title: string
  hall_name: string
  cinema_name: string
}

type ShowtimeRaw = {
  show_time_id: number
  hall_id: number
}

type Seat = {
  seat_id: number
  seat_number: string
  seat_type: string
}

type User = {
  user_id: number
  name: string
  email: string
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const overviewItems: NavItem[] = [{ label: 'Dashboard', icon: 'gauge' }]
const contentItems: NavItem[] = [
  { label: 'Movies', icon: 'film', badge: '12' },
  { label: 'Showtimes', icon: 'calendar' },
]
const venueItems: NavItem[] = [
  { label: 'Cinemas & Halls', icon: 'building' },
  { label: 'Seat Managers', icon: 'users' },
]
const transactionItems: NavItem[] = [
  { label: 'Bookings', icon: 'ticket', badge: '5' },
  { label: 'Payments', icon: 'wallet' },
]
const analyticsItems: NavItem[] = [{ label: 'Reports', icon: 'chart' }]
const systemItems: NavItem[] = [
  { label: 'Users', icon: 'user' },
  { label: 'Roles & Perms', icon: 'shield' },
  { label: 'Settings', icon: 'settings' },
]

const inputClasses =
  'h-12 w-full rounded-lg border border-white/10 bg-white/[0.035] px-4 text-sm font-semibold text-[#eef1f8] outline-none transition duration-200 placeholder:text-[#69728e] focus:border-amber-400/55 focus:bg-white/[0.055] focus:ring-4 focus:ring-amber-400/10'

function BookingsPage({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const [view, setView] = useState<BookingView>('list')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const loadBookings = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      setBookings(await apiRequest<Booking[]>('/api/bookings', { auth: true }))
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load bookings' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBookings()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        `${booking.booking_id} ${booking.user_name} ${booking.movie_title} ${booking.status}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [bookings, searchQuery],
  )

  const openDetails = async (booking: Booking) => {
    setMessage(null)
    try {
      setSelectedBooking(await apiRequest<Booking>(`/api/bookings/${booking.booking_id}`, { auth: true }))
      setView('details')
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to open booking' })
    }
  }

  const createBooking = async (payload: { user_id: number; show_time_id: number; seat_ids: number[] }) => {
    const booking = await apiRequest<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: true,
    })
    await loadBookings()
    setSelectedBooking(booking)
    setView('details')
    setMessage({ type: 'success', text: 'Booking created successfully.' })
  }

  const cancelBooking = async (booking: Booking) => {
    await apiRequest<Booking>(`/api/bookings/${booking.booking_id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' }),
      auth: true,
    })
    await loadBookings()
    const updated = await apiRequest<Booking>(`/api/bookings/${booking.booking_id}`, { auth: true })
    setSelectedBooking(updated)
    setMessage({ type: 'success', text: 'Booking cancelled.' })
  }

  return (
    <BookingShell activeNav="Bookings" onNavigate={onNavigate}>
      <Navbar title="Bookings" subtitle="All ticket bookings" />

      {message ? (
        <div
          className={[
            'dashboard-enter mt-5 rounded-xl border px-4 py-3 text-sm',
            message.type === 'error'
              ? 'border-rose-400/25 bg-rose-500/10 text-rose-200'
              : 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200',
          ].join(' ')}
        >
          {message.text}
        </div>
      ) : null}

      {view === 'list' ? (
        <BookingsList
          bookings={filteredBookings}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
          onAdd={() => setView('form')}
          onView={(booking) => void openDetails(booking)}
        />
      ) : null}

      {view === 'form' ? <BookingForm onCancel={() => setView('list')} onSave={createBooking} /> : null}

      {view === 'details' && selectedBooking ? (
        <BookingDetails
          booking={selectedBooking}
          onBack={() => setView('list')}
          onCancel={(booking) => void cancelBooking(booking)}
        />
      ) : null}
    </BookingShell>
  )
}

function BookingsList({
  bookings,
  searchQuery,
  isLoading,
  onSearchChange,
  onAdd,
  onView,
}: {
  bookings: Booking[]
  searchQuery: string
  isLoading: boolean
  onSearchChange: (value: string) => void
  onAdd: () => void
  onView: (booking: Booking) => void
}) {
  return (
    <div className="content-transition">
      <section className="mt-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="m-0 font-serif text-[30px] font-semibold text-[#faf7ee]">Bookings</h1>
          <p className="mt-1 text-sm text-[#7b849d]">All ticket bookings and reservations</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border border-white/10 bg-[#101420] px-3 sm:w-[270px] lg:hidden">
            <BookingIcon name="search" />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search..."
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#eef1f8] outline-none placeholder:text-[#69728e]"
            />
          </label>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05] transition duration-200 hover:-translate-y-0.5"
          >
            <BookingIcon name="plus" />
            New Booking
          </button>
        </div>
      </section>

      <section className="dashboard-enter mt-6 overflow-hidden rounded-[18px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
        <div className="dashboard-scrollbar overflow-x-auto">
          <table className="min-w-[1060px] w-full border-collapse">
            <thead>
              <tr className="border-b border-white/8 text-left text-xs font-bold uppercase tracking-[0.16em] text-[#737d9b]">
                <th className="px-5 py-4">Booking ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Movie</th>
                <th className="px-5 py-4">Showtime</th>
                <th className="px-5 py-4">Seats</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-sm text-[#8f99b5]">Loading bookings...</td>
                </tr>
              ) : bookings.length ? (
                bookings.map((booking, index) => (
                  <tr
                    key={booking.booking_id}
                    className="booking-row border-b border-white/6 last:border-b-0"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <td className="px-5 py-4 font-mono text-[15px] font-bold text-amber-300">{bookingCode(booking.booking_id)}</td>
                    <td className="px-5 py-4 font-bold text-[#e7ebf6]">{booking.user_name}</td>
                    <td className="px-5 py-4 text-[#a8b0ca]">{booking.movie_title}</td>
                    <td className="px-5 py-4 text-[#7f89a8]">{formatShortDate(booking.show_date)}, {formatTime(booking.show_time)}</td>
                    <td className="px-5 py-4 font-bold text-[#e7ebf6]">{booking.seats?.length ?? estimatedSeatCount(booking)}</td>
                    <td className="px-5 py-4 font-mono font-bold text-amber-300">{formatMoney(booking.total_amount)}</td>
                    <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => onView(booking)}
                        className="inline-flex h-8 items-center gap-2 rounded-lg bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-3 text-xs font-extrabold text-[#140d04]"
                      >
                        <BookingIcon name="eye" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-[#8f99b5]">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function BookingForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: (payload: { user_id: number; show_time_id: number; seat_ids: number[] }) => Promise<void>
}) {
  const [users, setUsers] = useState<User[]>([])
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [form, setForm] = useState({ user_id: '', show_time_id: '', seats: '2' })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [userData, showtimeData] = await Promise.all([
          apiRequest<User[]>('/api/users', { auth: true }),
          apiRequest<Showtime[]>('/api/showtimes'),
        ])
        setUsers(userData)
        setShowtimes(showtimeData)
        setForm((current) => ({
          ...current,
          user_id: current.user_id || String(userData[0]?.user_id ?? ''),
          show_time_id: current.show_time_id || String(showtimeData[0]?.show_time_id ?? ''),
        }))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load booking options')
      }
    }

    void loadOptions()
  }, [])

  useEffect(() => {
    const loadSeats = async () => {
      if (!form.show_time_id) return
      try {
        const raw = await apiRequest<ShowtimeRaw>(`/api/showtimes/${form.show_time_id}`)
        setSeats(await apiRequest<Seat[]>(`/api/seats/hall/${raw.hall_id}`))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load seats')
      }
    }

    void loadSeats()
  }, [form.show_time_id])

  const selectedShowtime = showtimes.find((showtime) => String(showtime.show_time_id) === form.show_time_id)
  const selectedUser = users.find((user) => String(user.user_id) === form.user_id)
  const selectedSeatIds = seats.slice(0, Math.max(1, Number(form.seats) || 1)).map((seat) => seat.seat_id)
  const total = selectedSeatIds.length * 12

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await onSave({
        user_id: Number(form.user_id),
        show_time_id: Number(form.show_time_id),
        seat_ids: selectedSeatIds,
      })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create booking')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="content-transition">
      <Breadcrumb current="New Booking" />
      <form onSubmit={submitForm} className="dashboard-enter mt-6">
        <section className="rounded-[18px] border border-white/8 bg-[#101526] p-7 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h1 className="m-0 flex items-center gap-3 border-b border-white/8 pb-5 font-serif text-xl font-semibold text-[#faf7ee]">
            <span className="text-amber-400"><BookingIcon name="ticket" /></span>
            Booking Details
          </h1>
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-5 xl:grid-cols-2">
            <FormField label="Customer">
              <select value={form.user_id} onChange={(event) => setForm({ ...form, user_id: event.target.value })} className={inputClasses} required>
                {users.map((user) => <option key={user.user_id} value={user.user_id}>{user.name}</option>)}
              </select>
            </FormField>
            <FormField label="Showtime">
              <select value={form.show_time_id} onChange={(event) => setForm({ ...form, show_time_id: event.target.value })} className={inputClasses} required>
                {showtimes.map((showtime) => (
                  <option key={showtime.show_time_id} value={showtime.show_time_id}>
                    {showtime.movie_title} - {formatShortDate(showtime.show_date)} {formatTime(showtime.show_time)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Seats">
              <input
                type="number"
                min="1"
                max={Math.min(10, seats.length || 10)}
                value={form.seats}
                onChange={(event) => setForm({ ...form, seats: event.target.value })}
                className={inputClasses}
                required
              />
            </FormField>
            <FormField label="Total">
              <input value={formatMoney(total)} className={`${inputClasses} font-mono text-amber-300`} readOnly />
            </FormField>
          </div>
          <div className="mt-5 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3 text-sm text-[#aab3cc]">
            {selectedUser?.name ?? 'Customer'} will receive the first {selectedSeatIds.length || 0} available seats for {selectedShowtime?.movie_title ?? 'the selected showtime'}.
          </div>
          {error ? <div className="mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
        </section>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-bold text-[#a1abc8]">Cancel</button>
          <button type="submit" disabled={isSaving || !selectedSeatIds.length} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-6 text-sm font-extrabold text-[#170f05] disabled:opacity-60">
            <BookingIcon name="check" />
            {isSaving ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}

function BookingDetails({
  booking,
  onBack,
  onCancel,
}: {
  booking: Booking
  onBack: () => void
  onCancel: (booking: Booking) => void
}) {
  const seats = booking.seats ?? []
  const seatNumbers = seats.map((seat) => seat.seat_number).join(', ') || `${estimatedSeatCount(booking)} seats`
  const basePrice = seats.reduce((sum, seat) => sum + Number(seat.price || 0), 0) || Number(booking.total_amount || 0) - 2.7
  const total = Number(booking.total_amount || 0)

  return (
    <div className="content-transition">
      <Breadcrumb current={`Booking ${bookingCode(booking.booking_id)}`} />

      <section className="dashboard-enter mt-6 rounded-[18px] border border-amber-400/25 bg-[linear-gradient(100deg,#2a2114_0%,#24151c_68%,#230f1b_100%)] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
        <div className="grid gap-6 md:grid-cols-[96px_minmax(0,1fr)_auto] md:items-center">
          <div className="grid h-[90px] w-[90px] place-items-center rounded-[18px] border border-amber-400/35 bg-amber-400/10 text-pink-400">
            <BookingIcon name="ticket" large />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">Booking Reference</div>
            <h1 className="mt-2 font-mono text-[34px] font-extrabold text-amber-300">{bookingCode(booking.booking_id)}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={booking.status} />
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#a9b2ca]">{formatFullDate(booking.show_date)}</span>
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-xs uppercase tracking-[0.16em] text-[#7d87a5]">Total Paid</div>
            <strong className="mt-2 block font-mono text-[30px] text-amber-300">{formatMoney(booking.total_amount)}</strong>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Customer" value={booking.user_name} tone="plain" />
        <MetricCard label="Seats Booked" value={String(seats.length || estimatedSeatCount(booking))} tone="teal" />
        <MetricCard label="Hall" value={booking.hall_name} tone="plain" />
        <MetricCard label="Payment" value="Visa Card" tone="plain" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="dashboard-enter rounded-[18px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h2 className="border-b border-white/8 px-6 py-5 font-serif text-xl font-semibold text-[#faf7ee]">Booking Information</h2>
          <div className="grid p-6">
            <DetailRow label="Movie" value={booking.movie_title} />
            <DetailRow label="Showtime" value={`${formatFullDate(booking.show_date)} - ${formatTime(booking.show_time)}`} />
            <DetailRow label="Seat Numbers" value={seatNumbers} />
            <DetailRow label="Seat Type" value={seats[0]?.seat_type ?? 'Standard'} />
            <DetailRow label="Payment Method" value="Visa --4242" />
            <DetailRow label="Transaction ID" value={`TXN_${String(booking.booking_id).padStart(6, '0')}A1B`} />
            <DetailRow label="Booked At" value={formatDateTime(booking.created_at)} />
          </div>
        </article>
        <article className="dashboard-enter rounded-[18px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h2 className="border-b border-white/8 px-6 py-5 font-serif text-xl font-semibold text-[#faf7ee]">Ticket Summary</h2>
          <div className="grid p-6">
            <DetailRow label={`Base Price (x${seats.length || estimatedSeatCount(booking)})`} value={formatMoney(Math.max(basePrice, 0))} accent />
            <DetailRow label="Service Fee" value={formatMoney(1)} />
            <DetailRow label="VAT (10%)" value={formatMoney(Math.max(total - basePrice - 1, 0))} />
            <DetailRow label="Grand Total" value={formatMoney(total)} accent strong />
          </div>
          <div className="grid gap-3 px-6 pb-6">
            <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-teal-400/35 bg-teal-400/15 text-sm font-extrabold text-teal-300">
              <BookingIcon name="print" />
              Print Ticket
            </button>
            <button type="button" onClick={onBack} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-bold text-[#9da6c2]">
              <BookingIcon name="back" />
              Back to List
            </button>
            <button type="button" onClick={() => onCancel(booking)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/12 text-sm font-bold text-rose-300">
              <BookingIcon name="ban" />
              Cancel Booking
            </button>
          </div>
        </article>
      </section>
    </div>
  )
}

function BookingShell({
  children,
  activeNav,
  onNavigate,
}: {
  children: ReactNode
  activeNav: string
  onNavigate: (page: PageName) => void
}) {
  return (
    <div className="min-h-screen bg-[#05070f] text-[#f4f0e6] lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top,rgba(255,178,44,0.08),transparent_22%),linear-gradient(180deg,#050813_0%,#05070f_100%)] lg:h-screen lg:min-h-0 lg:grid-cols-[274px_minmax(0,1fr)]">
        <aside className="relative z-40 flex flex-col justify-between gap-6 border-b border-white/6 bg-[#080c18] px-3.5 py-6 lg:h-screen lg:min-h-0 lg:border-r lg:border-b-0">
          <div className="relative z-10 flex items-center gap-3.5 border-b border-white/8 bg-[#080c18] px-3 py-2 pb-6">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-b from-[#ffcb4c] to-[#f6a517] shadow-[0_12px_30px_rgba(246,165,23,0.25)]">
              <BookingIcon name="clapper" />
            </div>
            <div>
              <h1 className="m-0 text-base tracking-[0.08em] text-[#ffce62]">CINEMAX</h1>
              <p className="mt-1 text-[11px] tracking-[0.08em] text-[#a3acc2]">ADMIN PORTAL</p>
            </div>
          </div>
          <nav className="dashboard-scrollbar relative z-0 min-h-0 flex-1 overflow-y-auto pt-6">
            <NavSection title="OVERVIEW" items={overviewItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="CONTENT" items={contentItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="VENUE" items={venueItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="TRANSACTIONS" items={transactionItems} activeNav={activeNav} onNavigate={onNavigate} />
            <div className="mb-3 mt-[18px] px-3.5 text-xs tracking-[0.08em] text-[#727b97]">Analytics</div>
            <NavSection title="" items={analyticsItems} activeNav={activeNav} onNavigate={onNavigate} />
            <NavSection title="SYSTEM" items={systemItems} activeNav={activeNav} onNavigate={onNavigate} />
          </nav>
          <div className="relative z-10 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl bg-[#111725] px-3.5 py-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff944d] to-[#ff7a2f] text-sm text-[#fff5ec]">SA</div>
            <div>
              <strong className="block text-[15px] text-[#f7f8fb]">Super Admin</strong>
              <span className="mt-0.5 block text-xs text-[#f0ad31]">Full Access</span>
            </div>
            <button type="button" aria-label="Open profile menu" className="border-0 bg-transparent text-[#98a0b7]">...</button>
          </div>
        </aside>
        <main className="content-transition dashboard-scrollbar min-h-0 px-3.5 pb-6 sm:px-5 lg:h-screen lg:overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavSection({
  title,
  items,
  activeNav,
  onNavigate,
}: {
  title: string
  items: NavItem[]
  activeNav: string
  onNavigate: (page: PageName) => void
}) {
  return (
    <section className="mt-[18px] first:mt-0">
      {title ? <p className="mb-3 px-3.5 text-xs tracking-[0.08em] text-[#727b97]">{title}</p> : null}
      <div className="grid gap-1.5">
        {items.map((item) => {
          const isActive = activeNav === item.label
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.label === 'Dashboard') onNavigate('dashboard')
                if (item.label === 'Reports') onNavigate('reports')
                if (item.label === 'Movies') onNavigate('movies')
                if (item.label === 'Showtimes') onNavigate('showtimes')
                if (item.label === 'Cinemas & Halls') onNavigate('cinemas')
                if (item.label === 'Bookings') onNavigate('bookings')
                if (item.label === 'Payments') onNavigate?.('payments')
                if (item.label === 'Users') onNavigate?.('users')
                if (item.label === 'Roles & Perms') onNavigate?.('roles')
              }}
              className={[
                'relative flex w-full items-center gap-3 rounded-[10px] px-3.5 py-3 text-left text-sm transition duration-200',
                isActive
                  ? 'border border-white/85 bg-[linear-gradient(90deg,rgba(245,166,35,0.26),rgba(245,166,35,0.17))] text-[#f5b031] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] before:absolute before:bottom-3 before:left-0 before:top-3 before:w-[3px] before:rounded-r-full before:bg-[#f5a623] before:content-[""]'
                  : 'border border-transparent bg-transparent text-[#78809b] hover:bg-white/4 hover:text-[#e7ebf6]',
              ].join(' ')}
            >
              <span className={['inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200', isActive ? 'bg-[#4a3517] text-[#f5b031]' : 'bg-[#111725] text-[#77809c]'].join(' ')}>
                <BookingIcon name={item.icon} />
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? <span className={['ml-auto inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none', item.badge === '5' ? 'bg-[#ff4f7d] text-white' : 'bg-[#6b4512] text-[#ffc24a]'].join(' ')}>{item.badge}</span> : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="mt-6 flex items-center gap-3 text-sm font-bold">
      <span className="text-amber-300">Bookings</span>
      <span className="text-[#68728e]">&gt;</span>
      <span className="text-[#9aa4c0]">{current}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase()
  const classes = {
    confirmed: 'bg-teal-400/10 text-teal-300 before:bg-teal-300',
    paid: 'bg-teal-400/10 text-teal-300 before:bg-teal-300',
    pending: 'bg-amber-400/10 text-amber-300 before:bg-amber-300',
    cancelled: 'bg-rose-400/10 text-rose-300 before:bg-rose-300',
  }[key] ?? 'bg-blue-400/10 text-blue-300 before:bg-blue-300'

  return <span className={`before:mr-1.5 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize before:h-[5px] before:w-[5px] before:rounded-full before:content-[''] ${classes}`}>{key}</span>
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: 'plain' | 'teal' }) {
  return (
    <article className="dashboard-enter rounded-[16px] border border-white/8 bg-[#101526] px-6 py-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#717b99]">{label}</div>
      <strong className={`mt-3 block text-base font-extrabold ${tone === 'teal' ? 'text-teal-300' : 'text-[#f2f4fb]'}`}>{value}</strong>
    </article>
  )
}

function DetailRow({ label, value, accent = false, strong = false }: { label: string; value: string; accent?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/6 py-3 last:border-b-0">
      <span className={strong ? 'font-bold text-[#eef1f8]' : 'text-[#77819e]'}>{label}</span>
      <strong className={`text-right ${accent ? 'font-mono text-amber-300' : 'text-[#eef1f8]'}`}>{value}</strong>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-amber-300">{label}</span>
      {children}
    </label>
  )
}

function BookingIcon({ name, large = false }: { name: string; large?: boolean }) {
  const icon = {
    gauge: <path d="M6.5 15a5.5 5.5 0 1 1 11 0M12 12l3-3M5 19h14" />,
    film: <><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9 4v16M15 4v16M5 8h4M15 8h4M5 16h4M15 16h4" /></>,
    calendar: <><rect x="4" y="6" width="16" height="14" rx="2" /><path d="M8 3v6M16 3v6M4 10h16" /></>,
    building: <path d="M4 20h16M6 20V8l6-4 6 4v12M9 12h.01M12 12h.01M15 12h.01" />,
    users: <path d="M8 14a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM16 13a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM3.5 19a4.5 4.5 0 0 1 9 0M13 19a4 4 0 0 1 7.5-1.8" />,
    ticket: <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z" />,
    wallet: <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9ZM15 12h5" />,
    chart: <path d="M5 19V9M10 19V5M15 19v-7M20 19v-4M3 19h18" />,
    user: <><path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    shield: <><path d="M12 4 6 6.5v5.4c0 4 2.7 7.6 6 8.9 3.3-1.3 6-4.9 6-8.9V6.5L12 4Z" /><path d="M12 9v6M9 12h6" /></>,
    settings: <><path d="m12 3 1.5 2.7 3.1.4.7 3 .7.5-.7.5-.7 3-3.1.4L12 21l-1.5-2.7-3.1-.4-.7-3-.7-.5.7-.5.7-3 3.1-.4L12 3Z" /><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></>,
    search: <path d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm9 2-3.5-3.5" />,
    plus: <path d="M12 5v14M5 12h14" />,
    eye: <><path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" /><circle cx="12" cy="12" r="2.5" /></>,
    back: <path d="M19 12H5M11 6l-6 6 6 6" />,
    ban: <><circle cx="12" cy="12" r="8" /><path d="m8 8 8 8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    print: <><path d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-4h18v4a2 2 0 0 1-2 2h-2" /><path d="M7 14h10v6H7z" /></>,
    clapper: <><path d="M4 8h16v11H4z" /><path d="m4 8 3-4h4L8 8m3 0 3-4h4l-3 4" /></>,
  }[name]

  return <svg viewBox="0 0 24 24" aria-hidden="true" className={large ? 'h-11 w-11 fill-none stroke-current stroke-[1.8]' : 'dashboard-icon'}>{icon}</svg>
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

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value))
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

function estimatedSeatCount(booking: Booking) {
  return Math.max(1, Math.round(Number(booking.total_amount || 0) / 12))
}

export default BookingsPage
