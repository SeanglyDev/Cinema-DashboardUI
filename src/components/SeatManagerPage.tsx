import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
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

type SeatView = 'map' | 'configure'

type Hall = {
  hall_id: number
  cinema_id: number
  name: string
  capacity: number
}

type Seat = {
  seat_id: number
  hall_id: number
  seat_number: string
  seat_type: string
}

type Booking = {
  booking_id: number
  hall_name?: string
  seats?: BookingSeat[]
}

type BookingSeat = {
  seat_number: string
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
const inputClasses =
  'h-12 w-full rounded-lg border border-white/10 bg-white/[0.035] px-4 text-sm font-semibold text-[#eef1f8] outline-none transition duration-200 placeholder:text-[#69728e] focus:border-amber-400/55 focus:bg-white/[0.055] focus:ring-4 focus:ring-amber-400/10'

function SeatManagerPage({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const [view, setView] = useState<SeatView>('map')
  const [halls, setHalls] = useState<Hall[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set())
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null)
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const selectedHall = halls.find((hall) => hall.hall_id === selectedHallId) ?? halls[0]

  const loadHalls = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const hallData = await apiRequest<Hall[]>('/api/halls')
      setHalls(hallData)
      const firstHallId = selectedHallId ?? hallData[0]?.hall_id ?? null
      setSelectedHallId(firstHallId)
      if (firstHallId) await loadSeats(firstHallId, hallData.find((hall) => hall.hall_id === firstHallId)?.name)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load halls' })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSeats = async (hallId: number, hallName?: string) => {
    const seatData = await apiRequest<Seat[]>(`/api/seats/hall/${hallId}`)
    setSeats(seatData)
    setSelectedSeatId(null)
    setBookedSeats(await fetchBookedSeatNumbers(hallName ?? halls.find((hall) => hall.hall_id === hallId)?.name ?? ''))
  }

  useEffect(() => {
    void loadHalls()
  }, [])

  const handleHallChange = async (hallId: number) => {
    setSelectedHallId(hallId)
    setIsLoading(true)
    setMessage(null)
    try {
      await loadSeats(hallId, halls.find((hall) => hall.hall_id === hallId)?.name)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load seats' })
    } finally {
      setIsLoading(false)
    }
  }

  const generateSeats = async (payload: { hallId: number; seatType: string; rows: number; seatsPerRow: number }) => {
    const seatPayloads = Array.from({ length: payload.rows * payload.seatsPerRow }, (_, index) => {
      const row = String.fromCharCode(65 + Math.floor(index / payload.seatsPerRow))
      return {
        hall_id: payload.hallId,
        seat_number: `${row}${(index % payload.seatsPerRow) + 1}`,
        seat_type: payload.seatType,
      }
    })

    await Promise.all(
      seatPayloads.map((seat) =>
        apiRequest<Seat>('/api/seats', {
          method: 'POST',
          body: JSON.stringify(seat),
          auth: true,
        }),
      ),
    )
    await loadSeats(payload.hallId, halls.find((hall) => hall.hall_id === payload.hallId)?.name)
    setSelectedHallId(payload.hallId)
    setView('map')
    setMessage({ type: 'success', text: 'Seats generated successfully.' })
  }

  return (
    <PageShell activeNav="Seat Manager" onNavigate={onNavigate}>
      <Navbar title="Seat Manager" subtitle="Configure and view seat maps" />

      {message ? (
        <div className={['dashboard-enter mt-5 rounded-xl border px-4 py-3 text-sm', message.type === 'error' ? 'border-rose-400/25 bg-rose-500/10 text-rose-200' : 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'].join(' ')}>
          {message.text}
        </div>
      ) : null}

      {view === 'map' ? (
        <SeatMapView
          halls={halls}
          seats={seats}
          bookedSeats={bookedSeats}
          selectedHall={selectedHall}
          selectedSeatId={selectedSeatId}
          isLoading={isLoading}
          onConfigure={() => setView('configure')}
          onHallChange={(hallId) => void handleHallChange(hallId)}
          onSeatSelect={setSelectedSeatId}
        />
      ) : (
        <SeatConfigForm halls={halls} selectedHallId={selectedHall?.hall_id ?? null} onCancel={() => setView('map')} onGenerate={generateSeats} />
      )}
    </PageShell>
  )
}

function SeatMapView({
  halls,
  seats,
  bookedSeats,
  selectedHall,
  selectedSeatId,
  isLoading,
  onConfigure,
  onHallChange,
  onSeatSelect,
}: {
  halls: Hall[]
  seats: Seat[]
  bookedSeats: Set<string>
  selectedHall?: Hall
  selectedSeatId: number | null
  isLoading: boolean
  onConfigure: () => void
  onHallChange: (hallId: number) => void
  onSeatSelect: (seatId: number) => void
}) {
  const groupedSeats = useMemo(() => groupSeats(seats), [seats])

  return (
    <div className="content-transition">
      <section className="mt-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="m-0 font-serif text-[30px] font-semibold text-[#faf7ee]">Seat Manager</h1>
          <p className="mt-1 text-sm text-[#7b849d]">Visual seat map editor</p>
        </div>
        <button type="button" onClick={onConfigure} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05] transition duration-200 hover:-translate-y-0.5">
          <AppIcon name="plus" />
          Configure Seats
        </button>
      </section>

      <section className="dashboard-enter mt-6 overflow-hidden rounded-[16px] border border-white/10 bg-[#101526] shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/7 px-6 py-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="m-0 font-serif text-lg font-semibold text-[#faf7ee]">{selectedHall ? `${selectedHall.name} — Grand Cinema` : 'No hall selected'}</h2>
            <p className="mt-1 text-sm text-[#7b849d]">{selectedHall?.capacity ?? seats.length} seats - Standard</p>
          </div>
          <select value={selectedHall?.hall_id ?? ''} onChange={(event) => onHallChange(Number(event.target.value))} className="h-10 rounded-lg border border-amber-400/35 bg-white/[0.035] px-4 text-sm font-bold text-[#f0f2f8] outline-none">
            {halls.map((hall) => (
              <option key={hall.hall_id} value={hall.hall_id} className="bg-[#101526]">{hall.name} — Grand</option>
            ))}
          </select>
        </div>

        <div className="mx-6 my-5 rounded-[14px] bg-[#080d18] px-4 py-7 shadow-[inset_0_30px_90px_rgba(0,0,0,0.22)]">
          <div className="mx-auto mb-8 max-w-[980px] text-center">
            <div className="text-xs uppercase tracking-[0.48em] text-[#68728e]">Screen</div>
            <div className="mx-auto mt-4 h-2 max-w-[780px] rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-[1px]" />
          </div>

          {isLoading ? <div className="py-20 text-center text-sm text-[#7b849d]">Loading seats...</div> : null}
          {!isLoading && seats.length === 0 ? <div className="py-20 text-center text-sm text-[#7b849d]">No seats configured for this hall.</div> : null}

          {!isLoading && seats.length > 0 ? (
            <div className="mx-auto w-fit max-w-full overflow-x-auto pb-2">
              <div className="grid gap-2">
                {groupedSeats.map(([row, rowSeats]) => (
                  <div key={row} className="grid grid-cols-[18px_repeat(var(--seat-count),28px)] items-center gap-2" style={{ '--seat-count': rowSeats.length } as CSSProperties}>
                    <span className="text-xs text-[#7b849d]">{row}</span>
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeatId === seat.seat_id
                      const isBooked = bookedSeats.has(seat.seat_number)
                      const isVip = seat.seat_type.toLowerCase().includes('vip')
                      return (
                        <button
                          key={seat.seat_id}
                          type="button"
                          title={seat.seat_number}
                          onClick={() => onSeatSelect(seat.seat_id)}
                          className={[
                            'h-7 w-7 rounded-[5px] border transition duration-200 hover:-translate-y-0.5',
                            isSelected
                              ? 'border-amber-300 bg-amber-400 shadow-[0_0_18px_rgba(245,166,35,0.35)]'
                              : isBooked
                                ? 'border-rose-400/45 bg-rose-500/20'
                                : isVip
                                  ? 'border-sky-400/45 bg-sky-500/15'
                                  : 'border-teal-400/45 bg-teal-500/15',
                          ].join(' ')}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-[#7b849d]">
            <Legend color="border-teal-400/45 bg-teal-500/15" label="Available" />
            <Legend color="border-rose-400/45 bg-rose-500/20" label="Booked" />
            <Legend color="border-sky-400/45 bg-sky-500/15" label="VIP" />
            <Legend color="border-amber-300 bg-amber-400" label="Selected" />
          </div>
        </div>
      </section>
    </div>
  )
}

function SeatConfigForm({ halls, selectedHallId, onCancel, onGenerate }: { halls: Hall[]; selectedHallId: number | null; onCancel: () => void; onGenerate: (payload: { hallId: number; seatType: string; rows: number; seatsPerRow: number }) => Promise<void> }) {
  const [hallId, setHallId] = useState(selectedHallId ?? halls[0]?.hall_id ?? 0)
  const [seatType, setSeatType] = useState('standard')
  const [rows, setRows] = useState(8)
  const [seatsPerRow, setSeatsPerRow] = useState(12)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await onGenerate({ hallId, seatType, rows, seatsPerRow })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="content-transition" onSubmit={(event) => void handleSubmit(event)}>
      <Breadcrumb current="Configure Seats" />
      <section className="dashboard-enter mt-6 rounded-[16px] border border-white/10 bg-[#101526] px-6 py-7 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
        <div className="flex items-center gap-3 border-b border-white/8 pb-5">
          <span className="text-amber-300"><AppIcon name="seat" /></span>
          <h2 className="m-0 font-serif text-lg font-semibold text-[#faf7ee]">Seat Configuration</h2>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <FormField label="Hall">
            <select value={hallId} onChange={(event) => setHallId(Number(event.target.value))} className={inputClasses}>
              {halls.map((hall) => (
                <option key={hall.hall_id} value={hall.hall_id} className="bg-[#101526]">{hall.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Seat Type">
            <select value={seatType} onChange={(event) => setSeatType(event.target.value)} className={inputClasses}>
              <option value="standard" className="bg-[#101526]">Standard</option>
              <option value="vip" className="bg-[#101526]">VIP</option>
              <option value="couple" className="bg-[#101526]">Couple</option>
            </select>
          </FormField>
          <FormField label="Rows">
            <input type="number" min={1} max={26} value={rows} onChange={(event) => setRows(Number(event.target.value))} className={inputClasses} />
          </FormField>
          <FormField label="Seats/Row">
            <input type="number" min={1} max={24} value={seatsPerRow} onChange={(event) => setSeatsPerRow(Number(event.target.value))} className={inputClasses} />
          </FormField>
        </div>
      </section>

      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-white/10 bg-white/[0.035] px-5 text-sm font-bold text-[#aeb6cc]">Cancel</button>
        <button type="submit" disabled={!hallId || isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05] disabled:opacity-60">
          <AppIcon name="check" />
          {isSaving ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </form>
  )
}

function PageShell({ children, activeNav, onNavigate }: { children: ReactNode; activeNav: string; onNavigate: (page: PageName) => void }) {
  return (
    <div className="min-h-screen bg-[#05070f] text-[#f4f0e6] lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top,rgba(255,178,44,0.08),transparent_22%),linear-gradient(180deg,#050813_0%,#05070f_100%)] lg:h-screen lg:min-h-0 lg:grid-cols-[274px_minmax(0,1fr)]">
        <aside className="relative z-40 flex flex-col justify-between gap-6 border-b border-white/6 bg-[#080c18] px-3.5 py-6 lg:h-screen lg:min-h-0 lg:border-r lg:border-b-0">
          <div className="relative z-10 flex items-center gap-3.5 border-b border-white/8 bg-[#080c18] px-3 py-2 pb-6">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-b from-[#ffcb4c] to-[#f6a517] shadow-[0_12px_30px_rgba(246,165,23,0.25)]"><AppIcon name="clapper" /></div>
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

function Breadcrumb({ current }: { current: string }) {
  return <div className="mt-6 flex items-center gap-3 text-sm font-bold"><span className="text-amber-300">Seat Manager</span><span className="text-[#68728e]">&gt;</span><span className="text-[#9aa4c0]">{current}</span></div>
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2"><span className="text-xs font-extrabold uppercase tracking-[0.12em] text-amber-300">{label}</span>{children}</label>
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2"><span className={`h-3.5 w-3.5 rounded-[3px] border ${color}`} />{label}</span>
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
    check: <path d="m5 12 4 4L19 6" />,
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

async function fetchBookedSeatNumbers(hallName: string) {
  try {
    const bookings = await apiRequest<Booking[]>('/api/bookings', { auth: true })
    const details = await Promise.all(bookings.slice(0, 30).map((booking) => apiRequest<Booking>(`/api/bookings/${booking.booking_id}`, { auth: true }).catch(() => booking)))
    return new Set(
      details
        .filter((booking) => !hallName || booking.hall_name === hallName)
        .flatMap((booking) => booking.seats?.map((seat) => seat.seat_number) ?? []),
    )
  } catch {
    return new Set<string>()
  }
}

function groupSeats(seats: Seat[]) {
  const rows = new Map<string, Seat[]>()
  seats.forEach((seat) => {
    const row = seat.seat_number.match(/^[A-Za-z]+/)?.[0] ?? 'A'
    rows.set(row, [...(rows.get(row) ?? []), seat])
  })
  return Array.from(rows.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([row, rowSeats]) => [row, rowSeats.sort((a, b) => seatNumber(a.seat_number) - seatNumber(b.seat_number))] as [string, Seat[]])
}

function seatNumber(value: string) {
  return Number(value.match(/\d+$/)?.[0] ?? 0)
}

export default SeatManagerPage
