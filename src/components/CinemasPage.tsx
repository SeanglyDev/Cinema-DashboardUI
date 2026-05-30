import { useEffect, useMemo, useState, type FormEvent, type ReactElement, type ReactNode } from 'react'
import '../css/Dashboard.css'
import Navbar from './Navbar'

type PageName = 'dashboard' | 'reports' | 'movies' | 'showtimes' | 'cinemas' | 'bookings' | 'users'
type CinemaView = 'list' | 'details' | 'form'

type Cinema = {
  cinema_id: number
  name: string
  location: string | null
  contact: string | null
  created_at?: string
}

type Hall = {
  hall_id: number
  cinema_id: number
  name: string
  capacity: number
  created_at?: string
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

function CinemasPage({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const [view, setView] = useState<CinemaView>('list')
  const [cinemas, setCinemas] = useState<Cinema[]>([])
  const [hallsByCinema, setHallsByCinema] = useState<Record<number, Hall[]>>({})
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null)
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const loadCinemas = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const cinemaData = await apiRequest<Cinema[]>('/api/cinemas')
      const hallEntries = await Promise.all(
        cinemaData.map(async (cinema) => [cinema.cinema_id, await apiRequest<Hall[]>(`/api/halls/cinema/${cinema.cinema_id}`)] as const),
      )
      setCinemas(cinemaData)
      setHallsByCinema(Object.fromEntries(hallEntries))
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load cinemas' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCinemas()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const filteredCinemas = useMemo(
    () => cinemas.filter((cinema) => `${cinema.name} ${cinema.location ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase())),
    [cinemas, searchQuery],
  )

  const openDetails = async (cinema: Cinema) => {
    setSelectedCinema(cinema)
    setView('details')
    setMessage(null)
    if (!hallsByCinema[cinema.cinema_id]) {
      setHallsByCinema((current) => ({ ...current, [cinema.cinema_id]: [] }))
    }
  }

  const openForm = (cinema?: Cinema) => {
    setEditingCinema(cinema ?? null)
    setView('form')
    setMessage(null)
  }

  const saveCinema = async (payload: CinemaFormPayload) => {
    const cinemaPayload = {
      name: payload.name,
      location: payload.location,
      contact: payload.contact,
    }
    const isEdit = Boolean(editingCinema)
    const cinema = isEdit
      ? await apiRequest<Cinema>(`/api/cinemas/${editingCinema?.cinema_id}`, {
          method: 'PUT',
          body: JSON.stringify(cinemaPayload),
          auth: true,
        })
      : await apiRequest<Cinema>('/api/cinemas', {
          method: 'POST',
          body: JSON.stringify(cinemaPayload),
          auth: true,
        })

    const existingHall = editingCinema ? hallsByCinema[editingCinema.cinema_id]?.[0] : null
    if (payload.hallName && payload.capacity) {
      if (existingHall) {
        await apiRequest<Hall>(`/api/halls/${existingHall.hall_id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: payload.hallName, capacity: payload.capacity }),
          auth: true,
        })
      } else {
        await apiRequest<Hall>('/api/halls', {
          method: 'POST',
          body: JSON.stringify({ cinema_id: cinema.cinema_id, name: payload.hallName, capacity: payload.capacity }),
          auth: true,
        })
      }
    }

    await loadCinemas()
    setSelectedCinema(cinema)
    setEditingCinema(null)
    setView('details')
    setMessage({ type: 'success', text: isEdit ? 'Cinema updated successfully.' : 'Cinema added successfully.' })
  }

  const deleteCinema = async (cinema: Cinema) => {
    await apiRequest<{ message: string }>(`/api/cinemas/${cinema.cinema_id}`, { method: 'DELETE', auth: true })
    await loadCinemas()
    setSelectedCinema(null)
    setView('list')
    setMessage({ type: 'success', text: 'Cinema deleted successfully.' })
  }

  return (
    <CinemaShell activeNav="Cinemas & Halls" onNavigate={onNavigate}>
      <Navbar title="Cinemas & Halls" subtitle="Manage locations and rooms" />

      {message ? (
        <div className={['dashboard-enter mt-5 rounded-xl border px-4 py-3 text-sm', message.type === 'error' ? 'border-rose-400/25 bg-rose-500/10 text-rose-200' : 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'].join(' ')}>
          {message.text}
        </div>
      ) : null}

      {view === 'list' ? (
        <CinemaList
          cinemas={filteredCinemas}
          hallsByCinema={hallsByCinema}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
          onAdd={() => openForm()}
          onView={openDetails}
        />
      ) : null}

      {view === 'details' && selectedCinema ? (
        <CinemaDetails
          cinema={selectedCinema}
          halls={hallsByCinema[selectedCinema.cinema_id] ?? []}
          onBack={() => setView('list')}
          onEdit={() => openForm(selectedCinema)}
          onDelete={deleteCinema}
        />
      ) : null}

      {view === 'form' ? (
        <CinemaForm
          cinema={editingCinema}
          hall={editingCinema ? hallsByCinema[editingCinema.cinema_id]?.[0] : null}
          onCancel={() => setView(editingCinema ? 'details' : 'list')}
          onSave={saveCinema}
        />
      ) : null}
    </CinemaShell>
  )
}

function CinemaList({
  cinemas,
  hallsByCinema,
  searchQuery,
  isLoading,
  onSearchChange,
  onAdd,
  onView,
}: {
  cinemas: Cinema[]
  hallsByCinema: Record<number, Hall[]>
  searchQuery: string
  isLoading: boolean
  onSearchChange: (value: string) => void
  onAdd: () => void
  onView: (cinema: Cinema) => void
}) {
  return (
    <div className="content-transition">
      <section className="mt-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="m-0 font-serif text-[30px] font-semibold text-[#faf7ee]">Cinemas & Halls</h1>
          <p className="mt-1 text-sm text-[#7b849d]">Manage locations and screening rooms</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border border-white/10 bg-[#101420] px-3 sm:w-[270px]">
            <CinemaIcon name="search" />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search..."
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#eef1f8] outline-none placeholder:text-[#69728e]"
            />
          </label>
          <button type="button" onClick={onAdd} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05] transition duration-200 hover:-translate-y-0.5">
            <CinemaIcon name="plus" />
            Add Cinema
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 2 }, (_, index) => <div key={index} className="dashboard-enter h-[220px] rounded-[18px] border border-white/8 bg-[#101526]" />)
        ) : cinemas.length ? (
          cinemas.map((cinema, index) => <CinemaCard key={cinema.cinema_id} cinema={cinema} halls={hallsByCinema[cinema.cinema_id] ?? []} index={index} onView={() => onView(cinema)} />)
        ) : (
          <div className="dashboard-enter col-span-full rounded-[16px] border border-white/8 bg-[#101526] p-8 text-center text-[#8992ad]">No cinemas found.</div>
        )}
      </section>
    </div>
  )
}

function CinemaCard({ cinema, halls, index, onView }: { cinema: Cinema; halls: Hall[]; index: number; onView: () => void }) {
  return (
    <article className="dashboard-enter stat-card rounded-[18px] border border-white/8 bg-[#101526] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)]" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className={['grid h-14 w-14 place-items-center rounded-xl text-2xl shadow-[0_16px_34px_rgba(245,166,35,0.22)]', index % 2 ? 'bg-gradient-to-br from-blue-400 to-blue-700' : 'bg-gradient-to-b from-[#ffcb4c] to-[#d98c00]'].join(' ')}>
            <CinemaIcon name="building" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-extrabold text-[#f2f4fb]">{cinema.name}</h2>
            <p className="mt-1 truncate text-sm text-[#7b849d]">{cinema.location || 'No location'} · {halls.length} Halls</p>
          </div>
        </div>
        <StatusBadge />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {(halls.length ? halls.slice(0, 3) : [{ hall_id: 0, cinema_id: cinema.cinema_id, name: 'Hall A', capacity: 0 }]).map((hall) => (
          <div key={hall.hall_id || hall.name} className="rounded-lg border border-amber-400/15 bg-white/[0.035] p-3 text-center">
            <div className="truncate text-[11px] text-[#7b849d]">{hall.name}</div>
            <strong className="mt-1 block text-sm text-[#f2f4fb]">{hall.capacity}</strong>
          </div>
        ))}
      </div>
      <button type="button" onClick={onView} className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#ffbb36] to-[#f2a318] text-sm font-extrabold text-[#170f05]">
        <CinemaIcon name="eye" />
        View Details
      </button>
    </article>
  )
}

function CinemaDetails({
  cinema,
  halls,
  onBack,
  onEdit,
  onDelete,
}: {
  cinema: Cinema
  halls: Hall[]
  onBack: () => void
  onEdit: () => void
  onDelete: (cinema: Cinema) => Promise<void>
}) {
  const totalSeats = halls.reduce((sum, hall) => sum + hall.capacity, 0)
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteItem = async () => {
    setIsDeleting(true)
    try {
      await onDelete(cinema)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="content-transition">
      <Breadcrumb current={cinema.name} />
      <section className="dashboard-enter mt-6 rounded-[18px] border border-white/8 bg-[#101526] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
        <div className="grid gap-6 xl:grid-cols-[100px_minmax(0,1fr)_auto] xl:items-center">
          <div className="grid h-[100px] w-[100px] place-items-center rounded-[14px] bg-gradient-to-br from-amber-950 via-slate-950 to-slate-950 text-4xl">
            <CinemaIcon name="building" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-300">Cinema Location</div>
            <h1 className="mt-3 font-serif text-[32px] font-semibold text-[#faf7ee]">{cinema.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge />
              <span className="rounded-full bg-white/7 px-3 py-1 text-xs font-bold text-[#9ba5c0]">{cinema.location || 'No location'}</span>
            </div>
            <p className="mt-5 text-sm text-[#aeb6cf]">Full-service cinema complex with {halls.length || 1} premium screening halls offering the finest cinematic experience.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={onEdit} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05]">
                <CinemaIcon name="edit" />
                Edit Cinema
              </button>
              <button type="button" onClick={onBack} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-bold text-[#9da6c2]">
                <CinemaIcon name="back" />
                Back
              </button>
            </div>
          </div>
          <button type="button" onClick={deleteItem} disabled={isDeleting} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/12 px-5 text-sm font-bold text-rose-300">
            <CinemaIcon name="trash" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Total Halls" value={String(halls.length)} tone="gold" />
        <MetricCard label="Total Seats" value={String(totalSeats)} tone="teal" />
        <MetricCard label="Shows Today" value="8" tone="blue" />
        <MetricCard label="Today Revenue" value="$1,842" tone="gold" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="dashboard-enter rounded-[18px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h2 className="border-b border-white/8 px-6 py-5 font-serif text-xl font-semibold text-[#faf7ee]">Contact Information</h2>
          <div className="grid p-6">
            <DetailRow label="Address" value={cinema.location || 'Not provided'} />
            <DetailRow label="Phone" value={cinema.contact || 'Not provided'} />
            <DetailRow label="Opening Hours" value="10:00 - 23:00" />
            <DetailRow label="Status" value="Open" />
            <DetailRow label="Created" value={formatDate(cinema.created_at)} />
          </div>
        </article>
        <article className="dashboard-enter rounded-[18px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h2 className="border-b border-white/8 px-6 py-5 font-serif text-xl font-semibold text-[#faf7ee]">Halls Overview</h2>
          <div className="grid gap-3 p-6">
            {halls.length ? halls.map((hall, index) => <HallOverview key={hall.hall_id} hall={hall} index={index} />) : <div className="text-sm text-[#8992ad]">No halls for this cinema.</div>}
          </div>
        </article>
      </section>
    </div>
  )
}

type CinemaFormPayload = {
  name: string
  location?: string
  contact?: string
  hallName?: string
  capacity?: number
}

function CinemaForm({
  cinema,
  hall,
  onCancel,
  onSave,
}: {
  cinema: Cinema | null
  hall?: Hall | null
  onCancel: () => void
  onSave: (payload: CinemaFormPayload) => Promise<void>
}) {
  const [form, setForm] = useState({
    name: cinema?.name ?? '',
    location: cinema?.location ?? '',
    contact: cinema?.contact ?? '',
    email: '',
    hallName: hall?.name ?? 'Hall A',
    capacity: hall?.capacity ? String(hall.capacity) : '200',
    type: 'Standard',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      await onSave({
        name: form.name.trim(),
        location: form.location.trim() || undefined,
        contact: form.contact.trim() || undefined,
        hallName: form.hallName.trim() || undefined,
        capacity: Number(form.capacity) || undefined,
      })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save cinema')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="content-transition">
      <Breadcrumb current={cinema ? 'Edit Cinema' : 'Add Cinema'} />
      <form onSubmit={submitForm} className="dashboard-enter mt-6">
        <section className="rounded-[18px] border border-white/8 bg-[#101526] p-7 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h1 className="m-0 flex items-center gap-3 border-b border-white/8 pb-5 font-serif text-xl font-semibold text-[#faf7ee]">
            <span className="text-amber-400"><CinemaIcon name="building" /></span>
            Cinema Info
          </h1>
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-5 xl:grid-cols-2">
            <FormField label="Cinema Name">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. CineStar Central" className={inputClasses} required />
            </FormField>
            <FormField label="Location">
              <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="City, Address" className={inputClasses} />
            </FormField>
            <FormField label="Contact">
              <input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} className={inputClasses} />
            </FormField>
            <FormField label="Email">
              <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={inputClasses} />
            </FormField>
          </div>
        </section>

        <section className="mt-5 rounded-[18px] border border-white/8 bg-[#101526] p-7 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h2 className="m-0 flex items-center gap-3 border-b border-white/8 pb-5 font-serif text-xl font-semibold text-[#faf7ee]">
            <span className="text-amber-400"><CinemaIcon name="hall" /></span>
            Hall Details
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-5 xl:grid-cols-3">
            <FormField label="Hall Name">
              <input value={form.hallName} onChange={(event) => setForm({ ...form, hallName: event.target.value })} placeholder="Hall A" className={inputClasses} />
            </FormField>
            <FormField label="Capacity">
              <input value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} type="number" min="1" placeholder="200" className={inputClasses} />
            </FormField>
            <FormField label="Type">
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className={inputClasses}>
                <option>Standard</option>
                <option>Premium</option>
                <option>VIP</option>
              </select>
            </FormField>
          </div>
        </section>

        {error ? <div className="mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-bold text-[#a1abc8]">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-6 text-sm font-extrabold text-[#170f05]">
            <CinemaIcon name="check" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

function CinemaShell({
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
        <main className="content-transition dashboard-scrollbar min-h-0 px-3.5 pb-6 sm:px-5 lg:h-screen lg:overflow-y-auto">{children}</main>
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
                if (item.label === 'Users') onNavigate('users')
              }}
              className={[
                'relative flex w-full items-center gap-3 rounded-[10px] px-3.5 py-3 text-left text-sm transition duration-200',
                isActive
                  ? 'border border-white/85 bg-[linear-gradient(90deg,rgba(245,166,35,0.26),rgba(245,166,35,0.17))] text-[#f5b031] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] before:absolute before:bottom-3 before:left-0 before:top-3 before:w-[3px] before:rounded-r-full before:bg-[#f5a623] before:content-[""]'
                  : 'border border-transparent bg-transparent text-[#78809b] hover:bg-white/4 hover:text-[#e7ebf6]',
              ].join(' ')}
            >
              <span className={['inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200', isActive ? 'bg-[#4a3517] text-[#f5b031]' : 'bg-[#111725] text-[#77809c]'].join(' ')}>
                <CinemaIcon name={item.icon} />
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
      <span className="text-amber-300">Cinemas</span>
      <span className="text-[#68728e]">›</span>
      <span className="text-[#9aa4c0]">{current}</span>
    </div>
  )
}

function StatusBadge() {
  return <span className="before:mr-1.5 inline-flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-bold text-teal-300 before:h-[5px] before:w-[5px] before:rounded-full before:bg-teal-300 before:content-['']">Open</span>
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: 'gold' | 'teal' | 'blue' }) {
  const toneClass = { gold: 'text-amber-300', teal: 'text-teal-300', blue: 'text-blue-300' }[tone]
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

function HallOverview({ hall, index }: { hall: Hall; index: number }) {
  const occupancy = [78, 65, 92, 71][index % 4]
  const tone = occupancy > 85 ? 'text-rose-300' : occupancy > 70 ? 'text-amber-300' : 'text-teal-300'
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-5 py-4">
      <div>
        <strong className="text-[#f2f4fb]">{hall.name}</strong>
        <p className="mt-1 text-xs text-[#7b849d]">{hall.capacity} seats · Standard</p>
      </div>
      <div className="text-right">
        <strong className={`text-xl ${tone}`}>{occupancy}%</strong>
        <p className="text-xs text-[#7b849d]">occupied</p>
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

function CinemaIcon({ name }: { name: string }) {
  const icon = {
    gauge: <path d="M6.5 15a5.5 5.5 0 1 1 11 0M12 12l3-3M5 19h14" />,
    film: <><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9 4v16M15 4v16M5 8h4M15 8h4M5 16h4M15 16h4" /></>,
    calendar: <><rect x="4" y="6" width="16" height="14" rx="2" /><path d="M8 3v6M16 3v6M4 10h16" /></>,
    building: <path d="M4 20h16M6 20V8l6-4 6 4v12M9 12h.01M12 12h.01M15 12h.01" />,
    hall: <path d="M4 20h16M7 20V7l5-3 5 3v13M10 12h4M10 16h4" />,
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
    trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
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

function formatDate(value?: string) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(value))
}

export default CinemasPage
