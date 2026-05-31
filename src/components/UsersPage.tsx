import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import '../css/Dashboard.css'
import Navbar from './Navbar'

type PageName = 'dashboard' | 'reports' | 'movies' | 'showtimes' | 'cinemas' | 'seat-manager' | 'bookings' | 'payments' | 'users' | 'roles' | 'notifications'
type UserView = 'list' | 'details' | 'form'

type User = {
  user_id: number
  role_id: number | null
  role_name: string | null
  name: string
  email: string
  profile_user: string | null
  is_active: boolean | null
  created_at: string | null
}

type Booking = {
  user_id: number
  total_amount: number | string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

type UserPayload = {
  name: string
  email: string
  role_id: number
  is_active: boolean
  password?: string
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

function UsersPage({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const [view, setView] = useState<UserView>('list')
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const loadUsers = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const [userData, bookingData] = await Promise.all([
        apiRequest<User[]>('/api/users', { auth: true }),
        apiRequest<Booking[]>('/api/bookings', { auth: true }).catch(() => []),
      ])
      setUsers(userData)
      setBookings(bookingData)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load users' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const filteredUsers = useMemo(
    () => users.filter((user) => `${user.name} ${user.email} ${roleLabel(user)}`.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, users],
  )

  const openDetails = async (user: User) => {
    setMessage(null)
    try {
      setSelectedUser(await apiRequest<User>(`/api/users/${user.user_id}`, { auth: true }))
      setView('details')
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to open user' })
    }
  }

  const openForm = (user?: User) => {
    setEditingUser(user ?? null)
    setMessage(null)
    setView('form')
  }

  const saveUser = async (payload: UserPayload) => {
    const isEdit = Boolean(editingUser)
    const endpoint = isEdit ? `/api/users/${editingUser?.user_id}` : '/api/users'
    const body = isEdit ? { ...payload, password: undefined } : payload
    const user = await apiRequest<User>(endpoint, {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(body),
      auth: true,
    })
    await loadUsers()
    setSelectedUser(user)
    setEditingUser(null)
    setView('details')
    setMessage({ type: 'success', text: isEdit ? 'User updated successfully.' : 'User created successfully.' })
  }

  const deactivateUser = async (user: User) => {
    await apiRequest<{ message: string }>(`/api/users/${user.user_id}`, { method: 'DELETE', auth: true })
    await loadUsers()
    const updated = await apiRequest<User>(`/api/users/${user.user_id}`, { auth: true })
    setSelectedUser(updated)
    setMessage({ type: 'success', text: 'User deactivated.' })
  }

  return (
    <UsersShell activeNav="Users" onNavigate={onNavigate}>
      <Navbar title="Users" subtitle="Manage system accounts" />

      {message ? (
        <div className={['dashboard-enter mt-5 rounded-xl border px-4 py-3 text-sm', message.type === 'error' ? 'border-rose-400/25 bg-rose-500/10 text-rose-200' : 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'].join(' ')}>
          {message.text}
        </div>
      ) : null}

      {view === 'list' ? (
        <UsersList
          users={filteredUsers}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
          onAdd={() => openForm()}
          onView={(user) => void openDetails(user)}
        />
      ) : null}

      {view === 'details' && selectedUser ? (
        <UserDetails
          user={selectedUser}
          bookings={bookings}
          onBack={() => setView('list')}
          onEdit={() => openForm(selectedUser)}
          onDeactivate={(user) => void deactivateUser(user)}
        />
      ) : null}

      {view === 'form' ? (
        <UserForm
          user={editingUser}
          onCancel={() => setView(editingUser ? 'details' : 'list')}
          onSave={saveUser}
        />
      ) : null}
    </UsersShell>
  )
}

function UsersList({
  users,
  searchQuery,
  isLoading,
  onSearchChange,
  onAdd,
  onView,
}: {
  users: User[]
  searchQuery: string
  isLoading: boolean
  onSearchChange: (value: string) => void
  onAdd: () => void
  onView: (user: User) => void
}) {
  return (
    <div className="content-transition">
      <section className="mt-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="m-0 font-serif text-[30px] font-semibold text-[#faf7ee]">Users</h1>
          <p className="mt-1 text-sm text-[#7b849d]">Manage system accounts</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border border-white/10 bg-[#101420] px-3 sm:w-[270px] lg:hidden">
            <UserIcon name="search" />
            <input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search..." className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#eef1f8] outline-none placeholder:text-[#69728e]" />
          </label>
          <button type="button" onClick={onAdd} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05] transition duration-200 hover:-translate-y-0.5">
            <UserIcon name="plus" />
            Add User
          </button>
        </div>
      </section>

      <section className="dashboard-enter mt-6 overflow-hidden rounded-[18px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
        <div className="dashboard-scrollbar overflow-x-auto">
          <table className="min-w-[960px] w-full border-collapse">
            <thead>
              <tr className="border-b border-white/8 text-left text-xs font-bold uppercase tracking-[0.16em] text-[#737d9b]">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-5 py-6 text-sm text-[#8f99b5]">Loading users...</td></tr>
              ) : users.length ? (
                users.map((user, index) => (
                  <tr key={user.user_id} className="booking-row border-b border-white/6 last:border-b-0" style={{ animationDelay: `${index * 70}ms` }}>
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar user={user} />
                        <div className="min-w-0">
                          <strong className="block truncate text-[#eef1f8]">{user.name}</strong>
                          <span className="text-xs text-[#717b99]">UID-{String(user.user_id).padStart(3, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#a8b0ca]">{user.email}</td>
                    <td className="px-5 py-4"><RoleBadge user={user} /></td>
                    <td className="px-5 py-4"><StatusBadge active={Boolean(user.is_active)} /></td>
                    <td className="px-5 py-4 text-[#7f89a8]">{formatMonthYear(user.created_at)}</td>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => onView(user)} className="inline-flex h-8 items-center gap-2 rounded-lg bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-3 text-xs font-extrabold text-[#140d04]">
                        <UserIcon name="eye" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-[#8f99b5]">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function UserDetails({
  user,
  bookings,
  onBack,
  onEdit,
  onDeactivate,
}: {
  user: User
  bookings: Booking[]
  onBack: () => void
  onEdit: () => void
  onDeactivate: (user: User) => void
}) {
  const userBookings = bookings.filter((booking) => booking.user_id === user.user_id)
  const totalSpent = userBookings.reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0)

  return (
    <div className="content-transition">
      <Breadcrumb current={user.name} />
      <section className="dashboard-enter mt-6 rounded-[18px] border border-white/8 bg-[#101526] p-8 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
        <div className="grid gap-6 lg:grid-cols-[104px_minmax(0,1fr)_auto] lg:items-center">
          <Avatar user={user} large />
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">System User</div>
            <h1 className="mt-2 font-serif text-[34px] font-semibold text-[#faf7ee]">{user.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <RoleBadge user={user} />
              <StatusBadge active={Boolean(user.is_active)} />
            </div>
            <p className="mt-5 text-sm font-semibold text-[#a8b0ca]">{user.email} - Member since {formatLongMonthYear(user.created_at)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={onEdit} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05]">
                <UserIcon name="edit" />
                Edit User
              </button>
              <button type="button" onClick={onBack} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-bold text-[#9da6c2]">
                <UserIcon name="back" />
                Back
              </button>
            </div>
          </div>
          <button type="button" onClick={() => onDeactivate(user)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/12 px-5 text-sm font-bold text-rose-300">
            <UserIcon name="ban" />
            Deactivate
          </button>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard label="Total Bookings" value={String(userBookings.length)} tone="gold" />
        <MetricCard label="Total Spent" value={totalSpent ? formatMoney(totalSpent) : '--'} tone="teal" />
        <MetricCard label="Last Login" value="Dec 22, 2024" tone="plain" />
      </section>

      <section className="dashboard-enter mt-6 rounded-[18px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
        <h2 className="border-b border-white/8 px-6 py-5 font-serif text-xl font-semibold text-[#faf7ee]">Account Details</h2>
        <div className="grid p-6">
          <DetailRow label="Full Name" value={user.name} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Role" value={roleLabel(user)} />
          <DetailRow label="Status" value={user.is_active ? 'Active' : 'Inactive'} badge={Boolean(user.is_active)} />
          <DetailRow label="2FA Enabled" value="Yes" badge />
          <DetailRow label="Joined" value={formatLongMonthYear(user.created_at)} />
        </div>
      </section>
    </div>
  )
}

function UserForm({
  user,
  onCancel,
  onSave,
}: {
  user: User | null
  onCancel: () => void
  onSave: (payload: UserPayload) => Promise<void>
}) {
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    role_id: String(user?.role_id ?? 1),
    status: user?.is_active === false ? 'inactive' : 'active',
    password: '',
    confirm: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      if (!user && form.password !== form.confirm) throw new Error('Passwords do not match')
      await onSave({
        name: form.name.trim(),
        email: form.email.trim(),
        role_id: Number(form.role_id),
        is_active: form.status === 'active',
        password: user ? undefined : form.password,
      })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save user')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="content-transition">
      <Breadcrumb current={user ? 'Edit User' : 'Add User'} />
      <form onSubmit={submitForm} className="dashboard-enter mt-6">
        <section className="rounded-[18px] border border-white/8 bg-[#101526] p-7 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h1 className="m-0 flex items-center gap-3 border-b border-white/8 pb-5 font-serif text-xl font-semibold text-[#faf7ee]">
            <span className="text-amber-400"><UserIcon name="user-plus" /></span>
            User Information
          </h1>
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-5 xl:grid-cols-2">
            <FormField label="Full Name">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" className={inputClasses} required />
            </FormField>
            <FormField label="Email">
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="user@email.com" className={inputClasses} required />
            </FormField>
            <FormField label="Role">
              <select value={form.role_id} onChange={(event) => setForm({ ...form, role_id: event.target.value })} className={inputClasses}>
                <option value="1">Super Admin</option>
                <option value="2">Customer</option>
                <option value="3">Manager</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={inputClasses}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
            {!user ? (
              <>
                <FormField label="Password">
                  <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="********" className={inputClasses} required />
                </FormField>
                <FormField label="Confirm">
                  <input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} placeholder="********" className={inputClasses} required />
                </FormField>
              </>
            ) : null}
          </div>
          {error ? <div className="mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
        </section>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-bold text-[#a1abc8]">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-6 text-sm font-extrabold text-[#170f05] disabled:opacity-60">
            <UserIcon name="check" />
            {isSaving ? 'Saving...' : user ? 'Save User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  )
}

function UsersShell({ children, activeNav, onNavigate }: { children: ReactNode; activeNav: string; onNavigate: (page: PageName) => void }) {
  return (
    <div className="min-h-screen bg-[#05070f] text-[#f4f0e6] lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top,rgba(255,178,44,0.08),transparent_22%),linear-gradient(180deg,#050813_0%,#05070f_100%)] lg:h-screen lg:min-h-0 lg:grid-cols-[274px_minmax(0,1fr)]">
        <aside className="relative z-40 flex flex-col justify-between gap-6 border-b border-white/6 bg-[#080c18] px-3.5 py-6 lg:h-screen lg:min-h-0 lg:border-r lg:border-b-0">
          <div className="relative z-10 flex items-center gap-3.5 border-b border-white/8 bg-[#080c18] px-3 py-2 pb-6">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-b from-[#ffcb4c] to-[#f6a517] shadow-[0_12px_30px_rgba(246,165,23,0.25)]">
              <UserIcon name="clapper" />
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

function NavSection({ title, items, activeNav, onNavigate }: { title: string; items: NavItem[]; activeNav: string; onNavigate: (page: PageName) => void }) {
  return (
    <section className="mt-[18px] first:mt-0">
      {title ? <p className="mb-3 px-3.5 text-xs tracking-[0.08em] text-[#727b97]">{title}</p> : null}
      <div className="grid gap-1.5">
        {items.map((item) => {
          const isActive = activeNav === item.label
          return (
            <button key={item.label} type="button" onClick={() => navigateFromLabel(item.label, onNavigate)} className={['relative flex w-full items-center gap-3 rounded-[10px] px-3.5 py-3 text-left text-sm transition duration-200', isActive ? 'border border-white/85 bg-[linear-gradient(90deg,rgba(245,166,35,0.26),rgba(245,166,35,0.17))] text-[#f5b031] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] before:absolute before:bottom-3 before:left-0 before:top-3 before:w-[3px] before:rounded-r-full before:bg-[#f5a623] before:content-[""]' : 'border border-transparent bg-transparent text-[#78809b] hover:bg-white/4 hover:text-[#e7ebf6]'].join(' ')}>
              <span className={['inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200', isActive ? 'bg-[#4a3517] text-[#f5b031]' : 'bg-[#111725] text-[#77809c]'].join(' ')}>
                <UserIcon name={item.icon} />
              </span>
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
  return (
    <div className="mt-6 flex items-center gap-3 text-sm font-bold">
      <span className="text-amber-300">Users</span>
      <span className="text-[#68728e]">&gt;</span>
      <span className="text-[#9aa4c0]">{current}</span>
    </div>
  )
}

function Avatar({ user, large = false }: { user: User; large?: boolean }) {
  const initials = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  return <div className={[large ? 'h-[102px] w-[102px] rounded-[14px] text-3xl' : 'h-9 w-9 rounded-lg text-xs', 'grid shrink-0 place-items-center bg-gradient-to-br from-[#ffbb36] via-[#ff8845] to-[#ff4f7d] font-extrabold text-white'].join(' ')}>{initials}</div>
}

function RoleBadge({ user }: { user: User }) {
  const role = roleLabel(user)
  const tone = user.role_id === 1 ? 'bg-amber-400/12 text-amber-300 before:bg-amber-300' : user.role_id === 2 ? 'bg-blue-400/12 text-blue-300 before:bg-blue-300' : 'bg-teal-400/12 text-teal-300 before:bg-teal-300'
  return <span className={`before:mr-1.5 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold before:h-[5px] before:w-[5px] before:rounded-full before:content-[''] ${tone}`}>{role}</span>
}

function StatusBadge({ active }: { active: boolean }) {
  return <span className={['before:mr-1.5 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold before:h-[5px] before:w-[5px] before:rounded-full before:content-[\'\']', active ? 'bg-teal-400/10 text-teal-300 before:bg-teal-300' : 'bg-rose-400/10 text-rose-300 before:bg-rose-300'].join(' ')}>{active ? 'Active' : 'Inactive'}</span>
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: 'gold' | 'teal' | 'plain' }) {
  const toneClass = { gold: 'text-amber-300', teal: 'text-teal-300', plain: 'text-[#eef1f8]' }[tone]
  return (
    <article className="dashboard-enter rounded-[16px] border border-white/8 bg-[#101526] px-6 py-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#717b99]">{label}</div>
      <strong className={`mt-4 block text-base font-extrabold ${toneClass}`}>{value}</strong>
    </article>
  )
}

function DetailRow({ label, value, badge = false }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/6 py-3 last:border-b-0">
      <span className="text-[#77819e]">{label}</span>
      {badge ? <StatusBadge active={value === 'Active' || value === 'Yes'} /> : <strong className="text-right font-semibold text-[#eef1f8]">{value}</strong>}
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

function UserIcon({ name }: { name: string }) {
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
    plus: <path d="M12 5v14M5 12h14" />,
    eye: <><path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" /><circle cx="12" cy="12" r="2.5" /></>,
    edit: <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 7.5l3 3" />,
    back: <path d="M19 12H5M11 6l-6 6 6 6" />,
    ban: <><circle cx="12" cy="12" r="8" /><path d="m8 8 8 8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    'user-plus': <><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3 20a6 6 0 0 1 12 0M18 8v6M15 11h6" /></>,
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

function roleLabel(user: User) {
  if (user.role_id === 1) return 'Super Admin'
  if (user.role_id === 2) return 'Customer'
  if (user.role_id === 3) return 'Manager'
  return user.role_name ?? 'User'
}

function formatMonthYear(value: string | null) {
  if (!value) return 'Unknown'
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(value))
}

function formatLongMonthYear(value: string | null) {
  if (!value) return 'Unknown'
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(value))
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

export default UsersPage
