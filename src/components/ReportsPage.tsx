import type { ReactElement } from 'react'
import './Dashboard.css'

type NavItem = {
  label: string
  icon: string
  active?: boolean
}

type StatTone = 'gold' | 'teal' | 'blue' | 'pink'

type StatCard = {
  title: string
  value: string
  tone: StatTone
  icon: string
}

type ProgressItem = {
  title: string
  value: string
  progress: number
  tone: 'gold' | 'amber' | 'teal' | 'sky' | 'rose'
}

type BreakdownItem = {
  label: string
  value: string
  highlight?: boolean
}

type HallRevenue = {
  label: string
  amount: string
  shows: string
  tone: 'gold' | 'teal' | 'blue'
}

type MonthlyReport = {
  month: string
  revenue: string
  tickets: string
  avgDay: string
  topMovie: string
  occupancy: string
  tone: 'blue' | 'teal' | 'green'
}

type PageName = 'dashboard' | 'reports'

const overviewItems: NavItem[] = [{ label: 'Dashboard', icon: 'gauge' }]

const contentItems: NavItem[] = [
  { label: 'Movies', icon: 'film' },
  { label: 'Showtimes', icon: 'calendar' },
]

const venueItems: NavItem[] = [
  { label: 'Cinemas & Halls', icon: 'building' },
  { label: 'Seat Managers', icon: 'users' },
]

const transactionItems: NavItem[] = [
  { label: 'Bookings', icon: 'ticket' },
  { label: 'Payments', icon: 'wallet' },
]

const analyticsItems: NavItem[] = [{ label: 'Reports', icon: 'chart', active: true }]

const systemItems: NavItem[] = [
  { label: 'Users', icon: 'user' },
  { label: 'Role & Permissions', icon: 'shield' },
  { label: 'Notifications', icon: 'bell' },
]

const statCards: StatCard[] = [
  { title: 'Total Collected', value: '$48,290', tone: 'gold', icon: 'dollar' },
  { title: 'Tickets Sold', value: '$48,290', tone: 'teal', icon: 'ticket' },
  { title: 'Total Bookings', value: '$48,290', tone: 'blue', icon: 'receipt' },
  { title: 'Total Customers', value: '$48,290', tone: 'pink', icon: 'group' },
]

const revenueBars = [42, 31, 53, 37, 61, 49, 66, 44, 56, 69, 51, 74, 76, 75, 76, 77, 74, 75, 73, 76]

const breakdown: BreakdownItem[] = [
  { label: 'Morning 10:00-12:30', value: '$420' },
  { label: 'Afternoon 13:00-16:30', value: '$640' },
  { label: 'Evening 18:00-20:30', value: '$784', highlight: true },
  { label: 'Total Tickets', value: '743', highlight: true },
  { label: 'Online Sales', value: '60%' },
  { label: 'Walk-In Sales', value: '20%' },
  { label: 'Cancellations', value: '8' },
  { label: 'Net Revenue', value: '$1,842', highlight: true },
]

const moviePopularity: ProgressItem[] = [
  { title: "The Lion's Kingdom", value: '520 tkts', progress: 100, tone: 'gold' },
  { title: "The Lion's Kingdom", value: '340 tkts', progress: 72, tone: 'amber' },
  { title: "The Lion's Kingdom", value: '244 tkts', progress: 30, tone: 'teal' },
  { title: "The Lion's Kingdom", value: '270 tkts', progress: 58, tone: 'sky' },
]

const seatOccupancy: ProgressItem[] = [
  { title: "The Lion's Kingdom", value: '78%', progress: 72, tone: 'gold' },
  { title: 'The Lion Kingdom', value: '76%', progress: 72, tone: 'teal' },
  { title: "The Lion's Kingdom", value: '78%', progress: 72, tone: 'rose' },
]

const hallRevenue: HallRevenue[] = [
  { label: 'All time earnings', amount: '$24,800', shows: '200 seats · Standard', tone: 'gold' },
  { label: 'Hall B - Premium', amount: '$15,300', shows: '120 seats · Premium', tone: 'teal' },
  { label: 'Hall C - VIP', amount: '$8,190', shows: '60 seats · VIP', tone: 'blue' },
]

const monthlyReport: MonthlyReport[] = [
  { month: 'January', revenue: '$4,200', tickets: '350', avgDay: '$135', topMovie: 'Iron Fist', occupancy: '65%', tone: 'blue' },
  { month: 'February', revenue: '$5,100', tickets: '258', avgDay: '$170', topMovie: 'Forever', occupancy: '81%', tone: 'teal' },
  { month: 'March', revenue: '$5,200', tickets: '414', avgDay: '$167', topMovie: 'Shadow Det.', occupancy: '83%', tone: 'green' },
]

const cardToneClasses: Record<StatTone, string> = {
  gold: 'border border-amber-400/20 bg-amber-400/10 text-amber-300',
  teal: 'border border-teal-400/20 bg-teal-400/10 text-teal-300',
  blue: 'border border-blue-400/20 bg-blue-400/10 text-blue-300',
  pink: 'border border-pink-400/20 bg-pink-400/10 text-pink-300',
}

const progressToneClasses: Record<ProgressItem['tone'], string> = {
  gold: 'bg-amber-400',
  amber: 'bg-amber-300',
  teal: 'bg-teal-400',
  sky: 'bg-sky-300',
  rose: 'bg-rose-500',
}

const hallDotClasses: Record<HallRevenue['tone'], string> = {
  gold: 'bg-amber-400',
  teal: 'bg-teal-400',
  blue: 'bg-blue-400',
}

const occupancyBadgeClasses: Record<MonthlyReport['tone'], string> = {
  blue: 'bg-blue-400/12 text-blue-300',
  teal: 'bg-teal-400/12 text-teal-300',
  green: 'bg-emerald-400/12 text-emerald-300',
}

const panelClasses =
  'rounded-[18px] border border-white/6 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]'

function ReportsPage({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  return (
    <div className="min-h-screen bg-[#05070f] text-[#f4f0e6]">
      <div className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top,rgba(255,178,44,0.08),transparent_22%),linear-gradient(180deg,#050813_0%,#05070f_100%)] lg:grid-cols-[274px_minmax(0,1fr)]">
        <aside className="flex flex-col justify-between gap-6 border-b border-white/6 bg-[#080c18]/90 px-3.5 py-6 lg:border-r lg:border-b-0">
          <div className="flex items-center gap-3.5 border-b border-white/8 px-3 py-2 pb-6">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-b from-[#ffcb4c] to-[#f6a517] shadow-[0_12px_30px_rgba(246,165,23,0.25)]">
              <span className="text-lg">C</span>
            </div>
            <div>
              <h1 className="m-0 text-base tracking-[0.08em] text-[#ffce62]">CINEMAX</h1>
              <p className="mt-1 text-[11px] tracking-[0.08em] text-[#a3acc2]">ADMIN PORTAL</p>
            </div>
          </div>

          <nav className="flex-1 pt-6">
            <NavSection title="OVERVIEW" items={overviewItems} onNavigate={onNavigate} />
            <NavSection title="CONTENT" items={contentItems} />
            <NavSection title="VENUE" items={venueItems} />
            <NavSection title="TRANSATIONS" items={transactionItems} />
            <div className="mb-3 mt-[18px] px-3.5 text-xs tracking-[0.08em] text-[#727b97]">Analytics</div>
            <NavSection title="" items={analyticsItems} onNavigate={onNavigate} />
            <NavSection title="SYSTEM" items={systemItems} />
          </nav>

          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl bg-white/4 px-3.5 py-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff944d] to-[#ff7a2f] text-sm text-[#fff5ec]">
              SA
            </div>
            <div>
              <strong className="block text-[15px] text-[#f7f8fb]">Super Admin</strong>
              <span className="mt-0.5 block text-xs text-[#f0ad31]">Full Access</span>
            </div>
            <button type="button" aria-label="Open profile menu" className="border-0 bg-transparent text-[#98a0b7]">
              ...
            </button>
          </div>
        </aside>

        <main className="p-3.5 sm:p-5">
          <header className="flex flex-col items-stretch justify-between gap-5 border-b border-white/8 px-1.5 pb-5 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 font-serif text-2xl font-medium text-[#faf7ee]">Reports</h2>
              <p className="mt-1.5 text-sm text-[#707997]">Analytics and insights</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label
                className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-white/8 bg-[#121624]/88 px-3.5 md:w-[248px]"
                aria-label="Search"
              >
                <span className="text-[#7f87a6]">
                  <ReportsIcon name="search" />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-full w-full border-0 bg-transparent text-[#eef1f8] outline-none placeholder:text-[#69728e]"
                />
              </label>
              <IconButton label="Notifications" icon="bell" />
              <IconButton label="Settings" icon="settings" />
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#ff944d] to-[#ff7a2f] text-[11px] text-[#fff5ec]"
              >
                SA
              </button>
            </div>
          </header>

          <section className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="m-0 font-serif text-[28px] font-medium text-[#faf7ee]">Reports & Analytics</h3>
              <p className="mt-1 text-sm text-[#707997]">
                Daily/monthly sales · Movie popularity · Occupancy · Revenue by hall
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex gap-1 rounded-[10px] border border-white/6 bg-white/4 p-1">
                <button type="button" className="rounded-md bg-amber-400/16 px-2.5 py-1.5 text-[11px] text-amber-300">
                  Monthly
                </button>
                <button type="button" className="rounded-md px-2.5 py-1.5 text-[11px] text-[#9098b6]">
                  Weekly
                </button>
                <button type="button" className="rounded-md px-2.5 py-1.5 text-[11px] text-[#9098b6]">
                  Daily
                </button>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-3 py-2 text-sm font-semibold text-[#231507]"
              >
                <ReportsIcon name="download" />
                Export
              </button>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-[18px] md:grid-cols-2 2xl:grid-cols-4">
            {statCards.map((card) => (
              <article key={card.title} className={`${panelClasses} px-[26px] py-[22px]`}>
                <div className={`mb-4 inline-flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${cardToneClasses[card.tone]}`}>
                  <ReportsIcon name={card.icon} />
                </div>
                <strong className="block text-[32px] font-medium tracking-[0.04em] text-[#f8f7f3]">{card.value}</strong>
                <span className="mt-1.5 block text-[#d1d6e7]">{card.title}</span>
              </article>
            ))}
          </section>

          <section className="mt-[18px] grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(0,1.7fr)_360px]">
            <article className={`${panelClasses} p-[18px]`}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h3 className="m-0 font-serif text-[22px] font-medium text-[#faf7ee]">Revenue Overview</h3>
                  <p className="mt-1 text-sm text-[#707997]">Monthly · 2026</p>
                </div>
                <div className="inline-flex gap-1 rounded-[10px] border border-white/6 bg-white/4 p-1">
                  <button type="button" className="rounded-md bg-amber-400/16 px-2.5 py-1.5 text-[11px] text-amber-300">
                    Monthly
                  </button>
                  <button type="button" className="rounded-md px-2.5 py-1.5 text-[11px] text-[#9098b6]">
                    Weekly
                  </button>
                  <button type="button" className="rounded-md px-2.5 py-1.5 text-[11px] text-[#9098b6]">
                    Daily
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-10 items-end gap-3 border-t border-white/6 pt-6 md:grid-cols-20">
                {revenueBars.map((value, index) => (
                  <div key={`${index + 1}`} className="grid justify-items-center gap-2">
                    <div className="flex h-24 w-4 items-end sm:w-5">
                      <div className="revenue-bar w-full rounded-t-md" style={{ height: `${value}%` }} />
                    </div>
                    <span className="text-[10px] text-[#76809d]">{index + 1}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/6 pt-5 sm:grid-cols-3">
                <MetricInfo label="Best Day" value="Dec 22" />
                <MetricInfo label="Avg/Day" value="$1,050" />
                <MetricInfo label="Month Total" value="$12,450" />
              </div>
            </article>

            <article className={`${panelClasses} p-[18px]`}>
              <div>
                <h3 className="m-0 font-serif text-[22px] font-medium text-[#faf7ee]">Today&apos;s Breakdown</h3>
                <p className="mt-1 text-sm text-[#707997]">Monthly · 2026</p>
              </div>

              <div className="mt-5 grid gap-3">
                {breakdown.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 border-b border-white/6 pb-3 text-sm last:border-b-0 last:pb-0"
                  >
                    <span className="text-[#7c86a3]">{item.label}</span>
                    <strong className={item.highlight ? 'font-medium text-amber-300' : 'font-medium text-[#f0f3fb]'}>
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-[18px] grid grid-cols-1 gap-[18px] xl:grid-cols-3">
            <article className={`${panelClasses} p-[18px]`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="m-0 font-serif text-[22px] font-medium text-[#faf7ee]">Movie Popularity</h3>
                  <p className="mt-1 text-sm text-[#707997]">Ticket sales ranking</p>
                </div>
                <button type="button" className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-[#9098b6]">
                  View All
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                {moviePopularity.map((item) => (
                  <ProgressRow key={`${item.title}-${item.value}`} item={item} />
                ))}
              </div>
            </article>

            <article className={`${panelClasses} p-[18px]`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="m-0 font-serif text-[22px] font-medium text-[#faf7ee]">Seat Occupancy Rate</h3>
                  <p className="mt-1 text-sm text-[#707997]">By hall</p>
                </div>
                <button type="button" className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-[#9098b6]">
                  View All
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                {seatOccupancy.map((item) => (
                  <div key={`${item.title}-${item.value}`} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3 text-[#f7f6f2]">
                      <div>
                        <div className="text-sm">{item.title}</div>
                        <div className="text-[11px] text-[#707997]">150 / 200 seats sold</div>
                      </div>
                      <strong className="text-sm text-amber-300">{item.value}</strong>
                    </div>
                    <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#22283a]">
                      <div
                        className={`h-full rounded-full ${progressToneClasses[item.tone]}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/6 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#707997]">Overall Average</span>
                  <strong className="text-amber-300">78%</strong>
                </div>
              </div>
            </article>

            <article className={`${panelClasses} p-[18px]`}>
              <div>
                <h3 className="m-0 font-serif text-[22px] font-medium text-[#faf7ee]">Revenue by Hall</h3>
                <p className="mt-1 text-sm text-[#707997]">All time earning</p>
              </div>

              <div className="mt-6 grid gap-5">
                {hallRevenue.map((hall) => (
                  <div key={hall.label} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 h-2 w-2 rounded-full ${hallDotClasses[hall.tone]}`} />
                      <div>
                        <div className="text-sm text-[#f0f3fb]">{hall.label}</div>
                        <div className="mt-1 text-[11px] text-[#707997]">{hall.shows}</div>
                      </div>
                    </div>
                    <strong className="text-sm text-amber-300">{hall.amount}</strong>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/6 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#707997]">Grand Total</span>
                  <strong className="text-amber-300">$48,290</strong>
                </div>
                <div className="mt-4 h-[6px] overflow-hidden rounded-full bg-[#22283a]">
                  <div className="flex h-full w-full">
                    <div className="w-[51%] bg-amber-400" />
                    <div className="w-[32%] bg-teal-400" />
                    <div className="w-[17%] bg-blue-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-[#707997]">
                  <span>Hall A 51%</span>
                  <span>Hall B 32%</span>
                  <span>VIP 17%</span>
                </div>
              </div>
            </article>
          </section>

          <section className={`mt-[18px] ${panelClasses} p-[18px]`}>
            <div>
              <h3 className="m-0 font-serif text-[22px] font-medium text-[#faf7ee]">Monthly Sales Report</h3>
              <p className="mt-1 text-sm text-[#707997]">Full breakdown by month · 2026</p>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#727c98]">Month</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#727c98]">Revenue</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#727c98]">Tickets</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#727c98]">Avg/Day</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#727c98]">Top Movie</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-[#727c98]">Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReport.map((row) => (
                    <tr key={row.month} className="border-t border-white/6">
                      <td className="px-4 py-3 text-sm text-[#f0f3fb]">{row.month}</td>
                      <td className="px-4 py-3 text-sm text-[#f0f3fb]">{row.revenue}</td>
                      <td className="px-4 py-3 text-sm text-[#f0f3fb]">{row.tickets}</td>
                      <td className="px-4 py-3 text-sm text-[#f0f3fb]">{row.avgDay}</td>
                      <td className="px-4 py-3 text-sm text-[#f0f3fb]">{row.topMovie}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${occupancyBadgeClasses[row.tone]}`}>
                          {row.occupancy}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function MetricInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center sm:text-left">
      <div className="text-xs text-[#707997]">{label}</div>
      <div className="mt-1 text-sm font-medium text-amber-300">{value}</div>
    </div>
  )
}

function ProgressRow({ item }: { item: ProgressItem }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-[#f7f6f2]">
        <span className="truncate text-sm">{item.title}</span>
        <strong className="text-sm">{item.value}</strong>
      </div>
      <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#22283a]">
        <div className={`h-full rounded-full ${progressToneClasses[item.tone]}`} style={{ width: `${item.progress}%` }} />
      </div>
    </div>
  )
}

function NavSection({
  title,
  items,
  onNavigate,
}: {
  title: string
  items: NavItem[]
  onNavigate?: (page: PageName) => void
}) {
  return (
    <section className="mt-[18px] first:mt-0">
      {title ? <p className="mb-3 px-3.5 text-xs tracking-[0.08em] text-[#727b97]">{title}</p> : null}
      <div className="grid gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.label === 'Dashboard') onNavigate?.('dashboard')
              if (item.label === 'Reports') onNavigate?.('reports')
            }}
            className={[
              'flex w-full items-center gap-3 rounded-[10px] border-0 px-3.5 py-3 text-left text-[15px] transition duration-200',
              item.active
                ? 'bg-amber-400/18 text-[#f5b031] shadow-[inset_3px_0_0_#f5a623]'
                : 'bg-transparent text-[#78809b] hover:bg-white/4 hover:text-[#e7ebf6]',
            ].join(' ')}
          >
            <span className="inline-flex h-[22px] w-[22px] items-center justify-center">
              <ReportsIcon name={item.icon} />
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </section>
  )
}

function IconButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-[#121624]/88 text-[#98a3c6]"
    >
      <ReportsIcon name={icon} />
    </button>
  )
}

function ReportsIcon({ name }: { name: string }) {
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
    download: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M12 4v11" />
        <path d="m8 11 4 4 4-4" />
        <path d="M5 19h14" />
      </svg>
    ),
  }

  return icons[name] ?? <span />
}

export default ReportsPage
