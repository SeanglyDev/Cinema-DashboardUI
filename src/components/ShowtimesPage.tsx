import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactElement, type ReactNode } from 'react'
import '../css/Dashboard.css'
import Navbar from './Navbar'

type PageName = 'dashboard' | 'reports' | 'movies' | 'showtimes' | 'cinemas'
type ShowtimeView = 'list' | 'details' | 'form'
type ShowtimeStatus = 'active' | 'cancelled' | 'completed'

type Showtime = {
  show_time_id: number
  show_date: string
  show_time: string
  status: string
  movie_title: string
  movie_genre: string
  movie_duration: number
  hall_name: string
  cinema_name: string
}

type ShowtimeRaw = {
  show_time_id: number
  movie_id: number
  hall_id: number
  show_date: string
  show_time: string
  status: string
}

type MovieOption = {
  movie_id: number
  title: string
}

type HallOption = {
  hall_id: number
  name: string
  capacity?: number
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

function ShowtimesPage({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const [view, setView] = useState<ShowtimeView>('list')
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [editingShowtime, setEditingShowtime] = useState<ShowtimeRaw | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const loadShowtimes = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      setShowtimes(await apiRequest<Showtime[]>('/api/showtimes'))
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load showtimes' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadShowtimes()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter((showtime) =>
      `${showtime.movie_title} ${showtime.hall_name} ${showtime.show_date} ${showtime.show_time}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, showtimes])

  const openDetails = (showtime: Showtime) => {
    setSelectedShowtime(showtime)
    setView('details')
    setMessage(null)
  }

  const openForm = async (showtime?: Showtime) => {
    setMessage(null)

    if (!showtime) {
      setEditingShowtime(null)
      setView('form')
      return
    }

    try {
      setEditingShowtime(await apiRequest<ShowtimeRaw>(`/api/showtimes/${showtime.show_time_id}`))
      setSelectedShowtime(showtime)
      setView('form')
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to open showtime' })
    }
  }

  const saveShowtime = async (payload: Omit<ShowtimeRaw, 'show_time_id'>) => {
    const isEdit = Boolean(editingShowtime)
    const endpoint = isEdit ? `/api/showtimes/${editingShowtime?.show_time_id}` : '/api/showtimes'
    await apiRequest<ShowtimeRaw>(endpoint, {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
      auth: true,
    })
    await loadShowtimes()
    setEditingShowtime(null)
    setView('list')
    setMessage({ type: 'success', text: isEdit ? 'Showtime updated successfully.' : 'Showtime added successfully.' })
  }

  const cancelShowtime = async (showtime: Showtime) => {
    await apiRequest<{ message: string }>(`/api/showtimes/${showtime.show_time_id}`, { method: 'DELETE', auth: true })
    await loadShowtimes()
    setSelectedShowtime(null)
    setView('list')
    setMessage({ type: 'success', text: 'Showtime cancelled.' })
  }

  return (
    <ShowtimeShell activeNav="Showtimes" onNavigate={onNavigate}>
      <Navbar title="Showtimes" subtitle="Schedule and manage screenings" />

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
        <ShowtimesList
          showtimes={filteredShowtimes}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
          onAdd={() => void openForm()}
          onView={openDetails}
          onEdit={(showtime) => void openForm(showtime)}
        />
      ) : null}

      {view === 'details' && selectedShowtime ? (
        <ShowtimeDetails
          showtime={selectedShowtime}
          onBack={() => setView('list')}
          onEdit={() => void openForm(selectedShowtime)}
          onCancel={(showtime) => void cancelShowtime(showtime)}
        />
      ) : null}

      {view === 'form' ? (
        <ShowtimeForm
          showtime={editingShowtime}
          onCancel={() => setView(editingShowtime ? 'details' : 'list')}
          onSave={saveShowtime}
        />
      ) : null}
    </ShowtimeShell>
  )
}

function ShowtimesList({
  showtimes,
  searchQuery,
  isLoading,
  onSearchChange,
  onAdd,
  onView,
  onEdit,
}: {
  showtimes: Showtime[]
  searchQuery: string
  isLoading: boolean
  onSearchChange: (value: string) => void
  onAdd: () => void
  onView: (showtime: Showtime) => void
  onEdit: (showtime: Showtime) => void
}) {
  return (
    <div className="content-transition">
      <section className="mt-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="m-0 font-serif text-[30px] font-semibold text-[#faf7ee]">Showtimes</h1>
          <p className="mt-1 text-sm text-[#7b849d]">Schedule and manage all screenings</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border border-white/10 bg-[#101420] px-3 sm:w-[270px]">
            <ShowtimeIcon name="search" />
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
            <ShowtimeIcon name="plus" />
            Add Showtime
          </button>
        </div>
      </section>

      <section className="dashboard-enter mt-6 overflow-hidden rounded-[18px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
        <div className="grid min-w-[900px] grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr_1fr_1.5fr] border-b border-white/8 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#737d9b]">
          <span>Movie</span>
          <span>Hall</span>
          <span>Date</span>
          <span>Time</span>
          <span>Available</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        <div className="dashboard-scrollbar overflow-x-auto">
          {isLoading ? (
            <div className="min-w-[900px] p-5 text-sm text-[#8f99b5]">Loading showtimes...</div>
          ) : showtimes.length ? (
            showtimes.map((showtime, index) => (
              <div
                key={showtime.show_time_id}
                className="booking-row grid min-w-[900px] grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr_1fr_1.5fr] items-center border-b border-white/6 px-5 py-4 last:border-b-0"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-xl">{movieMark(showtime.movie_title)}</span>
                  <strong className="truncate text-[#f2f4fb]">{showtime.movie_title}</strong>
                </div>
                <span className="text-[#a8b0ca]">{showtime.hall_name}</span>
                <span className="text-[#a8b0ca]">{formatShortDate(showtime.show_date)}</span>
                <span className="font-mono text-lg text-amber-300">{formatTime(showtime.show_time)}</span>
                <span className="font-semibold text-[#f2f4fb]">{availability(showtime)}</span>
                <StatusBadge status={displayStatus(showtime)} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => onView(showtime)} className="inline-flex h-8 items-center gap-2 rounded-lg bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-3 text-xs font-extrabold text-[#140d04]">
                    <ShowtimeIcon name="eye" />
                    View
                  </button>
                  <button type="button" onClick={() => onEdit(showtime)} className="h-8 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-[#a5aec8]">
                    Edit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="min-w-[900px] p-6 text-center text-sm text-[#8f99b5]">No showtimes found.</div>
          )}
        </div>
      </section>
    </div>
  )
}

function ShowtimeDetails({
  showtime,
  onBack,
  onEdit,
  onCancel,
}: {
  showtime: Showtime
  onBack: () => void
  onEdit: () => void
  onCancel: (showtime: Showtime) => void
}) {
  const booked = bookedSeats(showtime)
  const capacity = capacityFor(showtime)
  const available = Math.max(capacity - booked, 0)
  const occupancy = Math.round((booked / capacity) * 100)

  return (
    <div className="content-transition">
      <Breadcrumb current={`${showtime.movie_title} · ${formatTime(showtime.show_time)}`} />

      <section className="dashboard-enter mt-6 rounded-[18px] border border-white/8 bg-[#101526] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
        <div className="grid gap-6 xl:grid-cols-[100px_minmax(0,1fr)_auto] xl:items-center">
          <div className="grid h-[100px] w-[100px] place-items-center rounded-[14px] bg-gradient-to-br from-lime-900/45 via-slate-950 to-slate-950 text-4xl">
            {movieMark(showtime.movie_title)}
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-300">Showtime</div>
            <h1 className="mt-3 font-serif text-[32px] font-semibold text-[#faf7ee]">
              {showtime.movie_title} - {formatTime(showtime.show_time)}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={displayStatus(showtime)} />
              <span className="rounded-full bg-white/7 px-3 py-1 text-xs font-bold text-[#9ba5c0]">{showtime.hall_name}</span>
              <span className="rounded-full bg-white/7 px-3 py-1 text-xs font-bold text-[#9ba5c0]">{formatFullDate(showtime.show_date)}</span>
            </div>
            <p className="mt-5 text-sm text-[#aeb6cf]">All booking and seat information for this screening. Use the seat map area to manage individual seats.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={onEdit} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05]">
                <ShowtimeIcon name="edit" />
                Edit Showtime
              </button>
              <button type="button" onClick={onBack} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-bold text-[#9da6c2]">
                <ShowtimeIcon name="back" />
                Back to List
              </button>
            </div>
          </div>
          <button type="button" onClick={() => onCancel(showtime)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/12 px-5 text-sm font-bold text-rose-300">
            <ShowtimeIcon name="ban" />
            Cancel Show
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Total Capacity" value={String(capacity)} tone="gold" />
        <MetricCard label="Seats Booked" value={String(booked)} tone="rose" />
        <MetricCard label="Available" value={String(available)} tone="teal" />
        <MetricCard label="Occupancy" value={`${occupancy}%`} tone="gold" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="dashboard-enter rounded-[18px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h2 className="border-b border-white/8 px-6 py-5 font-serif text-xl font-semibold text-[#faf7ee]">Booking Details</h2>
          <div className="grid p-6">
            <DetailRow label="Movie" value={showtime.movie_title} />
            <DetailRow label="Hall" value={`${showtime.hall_name} - ${showtime.cinema_name}`} />
            <DetailRow label="Date & Time" value={`${formatFullDate(showtime.show_date)} · ${formatTime(showtime.show_time)}`} />
            <DetailRow label="Version" value="Original" />
            <DetailRow label="Duration" value={formatDuration(showtime.movie_duration)} />
            <DetailRow label="Tickets Sold" value={`${booked} tickets`} />
          </div>
        </article>
        <article className="dashboard-enter rounded-[18px] border border-white/8 bg-[#101526] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h2 className="m-0 font-serif text-xl font-semibold text-[#faf7ee]">Occupancy Rate</h2>
          <div className="mt-7">
            <ProgressMetric label="Booked seats" value={occupancy} max={100} suffix="%" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-center text-sm text-[#8790ad]">
              Standard
              <strong className="mt-2 block font-serif text-lg text-amber-300">{Math.round(booked * 0.72)}</strong>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-center text-sm text-[#8790ad]">
              VIP
              <strong className="mt-2 block font-serif text-lg text-blue-300">{Math.round(booked * 0.28)}</strong>
            </div>
          </div>
          <button type="button" className="mt-4 h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] text-sm font-bold text-[#9da6c2]">
            Open Seat Map
          </button>
        </article>
      </section>
    </div>
  )
}

function ShowtimeForm({
  showtime,
  onCancel,
  onSave,
}: {
  showtime: ShowtimeRaw | null
  onCancel: () => void
  onSave: (payload: Omit<ShowtimeRaw, 'show_time_id'>) => Promise<void>
}) {
  const [movies, setMovies] = useState<MovieOption[]>([])
  const [halls, setHalls] = useState<HallOption[]>([])
  const [form, setForm] = useState({
    movie_id: showtime?.movie_id ? String(showtime.movie_id) : '',
    hall_id: showtime?.hall_id ? String(showtime.hall_id) : '',
    show_date: normalizeDateInput(showtime?.show_date),
    show_time: normalizeTimeInput(showtime?.show_time) || '14:30',
    status: (showtime?.status as ShowtimeStatus) ?? 'active',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const [movieData, hallData] = await Promise.all([
          apiRequest<MovieOption[]>('/api/movies'),
          apiRequest<HallOption[]>('/api/halls'),
        ])
        setMovies(movieData)
        setHalls(hallData)
        setForm((current) => ({
          ...current,
          movie_id: current.movie_id || String(movieData[0]?.movie_id ?? ''),
          hall_id: current.hall_id || String(hallData[0]?.hall_id ?? ''),
        }))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load form options')
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      await onSave({
        movie_id: Number(form.movie_id),
        hall_id: Number(form.hall_id),
        show_date: form.show_date,
        show_time: form.show_time,
        status: form.status,
      })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save showtime')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="content-transition">
      <Breadcrumb current={showtime ? 'Edit Showtime' : 'Add Showtime'} />
      <form onSubmit={submitForm} className="dashboard-enter mt-6">
        <section className="rounded-[18px] border border-white/8 bg-[#101526] p-7 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h1 className="m-0 flex items-center gap-3 border-b border-white/8 pb-5 font-serif text-xl font-semibold text-[#faf7ee]">
            <span className="text-amber-400"><ShowtimeIcon name="calendar" /></span>
            Showtime Details
          </h1>
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-5 xl:grid-cols-2">
            <FormField label="Movie">
              <select value={form.movie_id} onChange={(event) => setForm({ ...form, movie_id: event.target.value })} className={inputClasses} required>
                {movies.map((movie) => <option key={movie.movie_id} value={movie.movie_id}>{movie.title}</option>)}
              </select>
            </FormField>
            <FormField label="Hall">
              <select value={form.hall_id} onChange={(event) => setForm({ ...form, hall_id: event.target.value })} className={inputClasses} required>
                {halls.map((hall) => <option key={hall.hall_id} value={hall.hall_id}>{hall.name}{hall.capacity ? ` (${hall.capacity})` : ''}</option>)}
              </select>
            </FormField>
            <FormField label="Date">
              <input type="date" value={form.show_date} onChange={(event) => setForm({ ...form, show_date: event.target.value })} className={inputClasses} required />
            </FormField>
            <FormField label="Time">
              <input type="time" value={form.show_time} onChange={(event) => setForm({ ...form, show_time: event.target.value })} className={inputClasses} required />
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ShowtimeStatus })} className={inputClasses}>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </FormField>
          </div>
          {error ? <div className="mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
        </section>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-bold text-[#a1abc8]">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-6 text-sm font-extrabold text-[#170f05]">
            <ShowtimeIcon name="check" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ShowtimeShell({
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
              <span className="text-lg">🎬</span>
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
              }}
              className={[
                'relative flex w-full items-center gap-3 rounded-[10px] px-3.5 py-3 text-left text-sm transition duration-200',
                isActive
                  ? 'border border-white/85 bg-[linear-gradient(90deg,rgba(245,166,35,0.26),rgba(245,166,35,0.17))] text-[#f5b031] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] before:absolute before:bottom-3 before:left-0 before:top-3 before:w-[3px] before:rounded-r-full before:bg-[#f5a623] before:content-[""]'
                  : 'border border-transparent bg-transparent text-[#78809b] hover:bg-white/4 hover:text-[#e7ebf6]',
              ].join(' ')}
            >
              <span className={['inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200', isActive ? 'bg-[#4a3517] text-[#f5b031]' : 'bg-[#111725] text-[#77809c]'].join(' ')}>
                <ShowtimeIcon name={item.icon} />
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className={['ml-auto inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none', item.badge === '5' ? 'bg-[#ff4f7d] text-white' : 'bg-[#6b4512] text-[#ffc24a]'].join(' ')}>
                  {item.badge}
                </span>
              ) : null}
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
      <span className="text-amber-300">Showtimes</span>
      <span className="text-[#68728e]">›</span>
      <span className="text-[#9aa4c0]">{current}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: 'active' | 'almost-full' | 'sold-out' | 'cancelled' | 'completed' }) {
  const classes = {
    active: 'bg-teal-400/10 text-teal-300 before:bg-teal-300',
    'almost-full': 'bg-rose-400/10 text-rose-300 before:bg-rose-300',
    'sold-out': 'bg-amber-400/10 text-amber-300 before:bg-amber-300',
    cancelled: 'bg-rose-400/10 text-rose-300 before:bg-rose-300',
    completed: 'bg-blue-400/10 text-blue-300 before:bg-blue-300',
  }[status]
  const label = status === 'almost-full' ? 'Almost Full' : status === 'sold-out' ? 'Sold Out' : status

  return <span className={`before:mr-1.5 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize before:h-[5px] before:w-[5px] before:rounded-full before:content-[''] ${classes}`}>{label}</span>
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: 'gold' | 'teal' | 'rose' }) {
  const toneClass = { gold: 'text-amber-300', teal: 'text-teal-300', rose: 'text-rose-300' }[tone]
  return (
    <article className="dashboard-enter rounded-[16px] border border-white/8 bg-[#101526] px-6 py-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#717b99]">{label}</div>
      <strong className={`mt-4 block font-serif text-2xl font-semibold ${toneClass}`}>{value}</strong>
    </article>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/6 py-3 last:border-b-0">
      <span className="text-[#77819e]">{label}</span>
      <strong className="text-right font-semibold text-[#eef1f8]">{value}</strong>
    </div>
  )
}

function ProgressMetric({ label, value, max, suffix }: { label: string; value: number; max: number; suffix: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm font-bold text-[#eef1f8]">
        <span>{label}</span>
        <span className="font-mono text-amber-300">{value}{suffix}</span>
      </div>
      <div className="progress-track h-[8px] overflow-hidden rounded-full bg-[#22283a]">
        <div className="progress-fill h-full rounded-full bg-amber-400" style={{ '--progress-width': `${Math.min((value / max) * 100, 100)}%` } as CSSProperties} />
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: ReactElement }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-amber-300">{label}</span>
      {children}
    </label>
  )
}

function ShowtimeIcon({ name }: { name: string }) {
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
    edit: <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 7.5l3 3" />,
    back: <path d="M19 12H5M11 6l-6 6 6 6" />,
    ban: <><circle cx="12" cy="12" r="8" /><path d="m8 8 8 8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  }[name]

  return <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">{icon}</svg>
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

const inputClasses =
  'h-12 w-full rounded-lg border border-white/10 bg-white/[0.035] px-4 text-sm font-semibold text-[#eef1f8] outline-none transition duration-200 placeholder:text-[#69728e] focus:border-amber-400/55 focus:bg-white/[0.055] focus:ring-4 focus:ring-amber-400/10'

function displayStatus(showtime: Showtime): 'active' | 'almost-full' | 'sold-out' | 'cancelled' | 'completed' {
  if (showtime.status === 'cancelled') return 'cancelled'
  if (showtime.status === 'completed') return 'completed'
  const available = capacityFor(showtime) - bookedSeats(showtime)
  if (available <= 0) return 'sold-out'
  if (available < capacityFor(showtime) * 0.15) return 'almost-full'
  return 'active'
}

function capacityFor(showtime: Showtime) {
  if (showtime.hall_name.toLowerCase().includes('c')) return 60
  if (showtime.hall_name.toLowerCase().includes('b')) return 120
  return 200
}

function bookedSeats(showtime: Showtime) {
  return (showtime.show_time_id * 29 + showtime.movie_duration) % capacityFor(showtime)
}

function availability(showtime: Showtime) {
  const capacity = capacityFor(showtime)
  return `${Math.max(capacity - bookedSeats(showtime), 0)}/${capacity}`
}

function movieMark(title: string) {
  const marks = ['🦁', '🚀', '🕵️', '💗', '👻', '🥊']
  return marks[title.length % marks.length]
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value))
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

function normalizeDateInput(value?: string) {
  if (!value) return ''
  return value.slice(0, 10)
}

function normalizeTimeInput(value?: string) {
  if (!value) return ''
  return value.slice(0, 5)
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours ? `${hours}h ${mins.toString().padStart(2, '0')}m` : `${mins}m`
}

export default ShowtimesPage
