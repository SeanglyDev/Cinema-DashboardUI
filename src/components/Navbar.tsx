import type { ReactElement } from 'react'

type NavbarProps = {
  title: string
  subtitle: string
}

function Navbar({ title, subtitle }: NavbarProps) {
  const handleLogout = () => {
    localStorage.removeItem('cinemax_token')
    sessionStorage.removeItem('cinemax_last_password')
    window.location.hash = ''
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 -mx-3 -mt-3 flex min-h-[62px] items-center justify-between gap-4 border-b border-white/8 bg-[#050813] px-6 py-2.5 shadow-[0_14px_24px_rgba(5,8,19,0.95)] sm:-mx-4 sm:-mt-4 lg:-mx-5 lg:-mt-5 lg:px-6">
      <div className="min-w-0">
        <h2 className="m-0 font-serif text-[22px] font-semibold leading-none text-[#faf7ee]">{title}</h2>
        <p className="mt-1.5 text-xs leading-none text-[#7b849d]">{subtitle}</p>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
        <label
          className="hidden h-9 w-full max-w-[216px] items-center gap-2.5 rounded-lg border border-white/10 bg-[#101420] px-3 sm:flex"
          aria-label="Search"
        >
          <span className="text-[#7f87a6]">
            <NavbarIcon name="search" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#eef1f8] outline-none placeholder:text-[#69728e]"
          />
        </label>

        <NavbarButton label="Notifications" icon="bell" hasBadge />
        <NavbarButton label="Settings" icon="settings" />
        <NavbarButton label="Logout" icon="logout" onClick={handleLogout} variant="danger" />

        <button
          type="button"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#ff944d] to-[#ff5f73] text-sm font-semibold text-[#fff5ec]"
          aria-label="Open profile menu"
        >
          SA
        </button>
      </div>
    </header>
  )
}

function NavbarButton({
  label,
  icon,
  onClick,
  hasBadge = false,
  variant = 'default',
}: {
  label: string
  icon: string
  onClick?: () => void
  hasBadge?: boolean
  variant?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
        variant === 'danger'
          ? 'border-[#ff5f73]/30 bg-[#2a1119] text-[#ff8d9b] hover:border-[#ff5f73]/50 hover:bg-[#371722]'
          : 'border-white/10 bg-[#101420] text-[#98a3c6] hover:border-white/20 hover:bg-[#151a28]'
      }`}
    >
      <NavbarIcon name={icon} />
      {hasBadge ? (
        <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#ff4b73] ring-2 ring-[#101420]" />
      ) : null}
    </button>
  )
}

function NavbarIcon({ name }: { name: string }) {
  const icons: Record<string, ReactElement> = {
    search: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M6 17h12l-1.2-1.4a2 2 0 0 1-.5-1.3V11a4.3 4.3 0 1 0-8.6 0v3.3a2 2 0 0 1-.5 1.3L6 17Z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="m12 3 1.5 2.7 3.1.4.7 3 .7.5-.7.5-.7 3-3.1.4L12 21l-1.5-2.7-3.1-.4-.7-3-.7-.5.7-.5.7-3 3.1-.4L12 3Z" />
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
        <path d="m15 8 4 4-4 4" />
        <path d="M19 12H9" />
      </svg>
    ),
  }

  return icons[name] ?? <span />
}

export default Navbar
