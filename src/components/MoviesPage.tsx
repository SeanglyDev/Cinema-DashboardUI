import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactElement, type ReactNode } from 'react'
import '../css/Dashboard.css'
import Navbar from './Navbar'

type PageName = 'dashboard' | 'reports' | 'movies' | 'showtimes' | 'cinemas'
type MovieView = 'list' | 'details' | 'form'
type MovieStatus = 'active' | 'upcoming' | 'inactive'

type Movie = {
  movie_id: number
  poster_url: string | null
  title: string
  genre: string | null
  duration_min: number | null
  status: string
  description: string | null
  created_at?: string
}

type MoviePayload = {
  poster_url?: string
  title: string
  genre?: string
  duration_min?: number
  status?: MovieStatus
  description?: string
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

const emptyForm = {
  title: '',
  genre: 'Action',
  duration_min: '120',
  status: 'active' as MovieStatus,
  poster_url: '',
  description: '',
}

const posterGradients = [
  'from-lime-900/45 via-slate-950 to-slate-950',
  'from-indigo-800/45 via-slate-950 to-slate-950',
  'from-zinc-700/35 via-slate-950 to-slate-950',
  'from-rose-900/42 via-slate-950 to-slate-950',
  'from-fuchsia-950/42 via-slate-950 to-slate-950',
  'from-orange-950/40 via-slate-950 to-slate-950',
]

function MoviesPage({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const [view, setView] = useState<MovieView>('list')
  const [movies, setMovies] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | MovieStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const loadMovies = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const data = await apiRequest<Movie[]>('/api/movies')
      setMovies(data)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load movies' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMovies()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const movieStatus = normalizeStatus(movie.status)
      const matchesStatus = statusFilter === 'all' || movieStatus === statusFilter
      const matchesSearch = `${movie.title} ${movie.genre ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [movies, searchQuery, statusFilter])

  const openDetails = async (movie: Movie) => {
    setMessage(null)

    try {
      const freshMovie = await apiRequest<Movie>(`/api/movies/${movie.movie_id}`)
      setSelectedMovie(freshMovie)
      setView('details')
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to open movie' })
    }
  }

  const openForm = (movie?: Movie) => {
    setEditingMovie(movie ?? null)
    setView('form')
    setMessage(null)
  }

  const handleSave = async (payload: MoviePayload) => {
    const method = editingMovie ? 'PUT' : 'POST'
    const endpoint = editingMovie ? `/api/movies/${editingMovie.movie_id}` : '/api/movies'
    const savedMovie = await apiRequest<Movie>(endpoint, {
      method,
      body: JSON.stringify(payload),
      auth: true,
    })

    await loadMovies()
    setSelectedMovie(savedMovie)
    setEditingMovie(null)
    setView('details')
    setMessage({ type: 'success', text: editingMovie ? 'Movie updated successfully.' : 'Movie added successfully.' })
  }

  const handleDelete = async (movie: Movie) => {
    await apiRequest<{ message: string }>(`/api/movies/${movie.movie_id}`, { method: 'DELETE', auth: true })
    await loadMovies()
    setSelectedMovie(null)
    setView('list')
    setMessage({ type: 'success', text: 'Movie deleted successfully.' })
  }

  return (
    <MovieShell activeNav="Movies" onNavigate={onNavigate} movieCount={movies.length}>
      <Navbar title="Movies" subtitle="Manage your cinema catalog" />

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
        <MovieListView
          movies={filteredMovies}
          totalMovies={movies.length}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onAddMovie={() => openForm()}
          onViewMovie={openDetails}
        />
      ) : null}

      {view === 'details' && selectedMovie ? (
        <MovieDetailsView
          movie={selectedMovie}
          onBack={() => setView('list')}
          onEdit={() => openForm(selectedMovie)}
          onDelete={handleDelete}
        />
      ) : null}

      {view === 'form' ? (
        <MovieFormView
          movie={editingMovie}
          onCancel={() => {
            setEditingMovie(null)
            setView(editingMovie ? 'details' : 'list')
          }}
          onSave={handleSave}
        />
      ) : null}
    </MovieShell>
  )
}

function MovieListView({
  movies,
  totalMovies,
  statusFilter,
  searchQuery,
  isLoading,
  onSearchChange,
  onStatusChange,
  onAddMovie,
  onViewMovie,
}: {
  movies: Movie[]
  totalMovies: number
  statusFilter: 'all' | MovieStatus
  searchQuery: string
  isLoading: boolean
  onSearchChange: (value: string) => void
  onStatusChange: (value: 'all' | MovieStatus) => void
  onAddMovie: () => void
  onViewMovie: (movie: Movie) => void
}) {
  return (
    <div className="content-transition">
      <section className="mt-10 flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div>
          <h1 className="m-0 font-serif text-[30px] font-semibold text-[#faf7ee]">Movies</h1>
          <p className="mt-1 text-sm text-[#7b849d]">Manage your cinema catalog</p>

          <div className="mt-6 inline-flex rounded-[10px] border border-white/10 bg-white/[0.03] p-1">
            {(['all', 'active', 'upcoming', 'inactive'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(status)}
                className={[
                  'rounded-lg px-5 py-2 text-sm font-semibold capitalize transition duration-200',
                  statusFilter === status ? 'bg-amber-400/16 text-amber-300' : 'text-[#858eaa] hover:text-[#f1f3fb]',
                ].join(' ')}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border border-white/10 bg-[#101420] px-3 sm:w-[270px]">
            <MovieIcon name="search" />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              type="search"
              placeholder="Search..."
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#eef1f8] outline-none placeholder:text-[#69728e]"
            />
          </label>
          <button
            type="button"
            onClick={onAddMovie}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05] transition duration-200 hover:-translate-y-0.5"
          >
            <MovieIcon name="plus" />
            Add Movie
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {isLoading ? (
          Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="dashboard-enter h-[308px] rounded-[16px] border border-white/8 bg-[#101526] opacity-70"
              style={{ animationDelay: `${index * 60}ms` }}
            />
          ))
        ) : movies.length ? (
          movies.map((movie, index) => (
            <MovieCard key={movie.movie_id} movie={movie} index={index} onView={() => onViewMovie(movie)} />
          ))
        ) : (
          <div className="dashboard-enter col-span-full rounded-[16px] border border-white/8 bg-[#101526] p-8 text-center text-[#8992ad]">
            {totalMovies ? 'No movies match this filter.' : 'No movies found.'}
          </div>
        )}
      </section>
    </div>
  )
}

function MovieCard({ movie, index, onView }: { movie: Movie; index: number; onView: () => void }) {
  const status = normalizeStatus(movie.status)
  const rating = getMovieRating(movie, index)

  return (
    <article
      className="dashboard-enter stat-card overflow-hidden rounded-[16px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]"
      style={{ animationDelay: `${110 + index * 65}ms` }}
    >
      <div className={`relative grid h-[184px] place-items-center bg-gradient-to-br ${posterGradients[index % posterGradients.length]}`}>
        <PosterArt movie={movie} index={index} />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-amber-400/30 bg-black/45 px-2.5 py-1 text-xs font-bold text-amber-300">
          <MovieIcon name="star" />
          {rating ? rating.toFixed(1) : '-'}
        </span>
      </div>

      <div className="grid gap-3 p-4">
        <div>
          <h2 className="truncate text-base font-extrabold text-[#f2f4fb]">{movie.title}</h2>
          <p className="mt-1 truncate text-sm text-[#717b99]">
            {movie.genre ?? 'General'} <span className="mx-1">•</span> {formatDuration(movie.duration_min)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={status} />
          <button
            type="button"
            onClick={onView}
            className="inline-flex h-8 items-center gap-2 rounded-lg bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-3 text-xs font-extrabold text-[#140d04]"
          >
            <MovieIcon name="eye" />
            View
          </button>
        </div>
      </div>
    </article>
  )
}

function MovieDetailsView({
  movie,
  onBack,
  onEdit,
  onDelete,
}: {
  movie: Movie
  onBack: () => void
  onEdit: () => void
  onDelete: (movie: Movie) => Promise<void>
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const status = normalizeStatus(movie.status)
  const sold = getTicketsSold(movie)
  const target = Math.max(600, sold + 80)

  const deleteMovie = async () => {
    setIsDeleting(true)
    try {
      await onDelete(movie)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="content-transition">
      <Breadcrumb current={movie.title} />

      <section className="dashboard-enter mt-6 rounded-[18px] border border-white/8 bg-[#101526] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
        <div className="grid gap-6 xl:grid-cols-[156px_minmax(0,1fr)_auto] xl:items-center">
          <div className={`grid aspect-[0.75] w-[150px] place-items-center rounded-[14px] bg-gradient-to-br ${posterGradients[movie.movie_id % posterGradients.length]}`}>
            <PosterArt movie={movie} index={movie.movie_id} large />
          </div>

          <div className="min-w-0">
            <h1 className="m-0 font-serif text-[34px] font-semibold text-[#faf7ee]">{movie.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={status} />
              <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">{movie.genre ?? 'General'}</span>
              <span className="rounded-full bg-white/7 px-3 py-1 text-xs font-bold text-[#8f99b5]">{formatDuration(movie.duration_min)}</span>
            </div>
            <p className="mt-6 max-w-5xl text-sm leading-6 text-[#aeb6cf]">{movie.description || 'No synopsis available.'}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-5 text-sm font-extrabold text-[#170f05]"
              >
                <MovieIcon name="edit" />
                Edit Movie
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-bold text-[#9da6c2]"
              >
                <MovieIcon name="back" />
                Back to List
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={deleteMovie}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/12 px-5 text-sm font-bold text-rose-300"
          >
            <MovieIcon name="trash" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Revenue" value={`$${(sold * 24).toLocaleString()}`} tone="gold" />
        <MetricCard label="Tickets Sold" value={sold.toLocaleString()} tone="teal" />
        <MetricCard label="IMDB Rating" value={`${getMovieRating(movie, movie.movie_id).toFixed(1)} / 10`} tone="gold" />
        <MetricCard label="Active Showtimes" value={status === 'active' ? '4' : '0'} tone="blue" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="dashboard-enter rounded-[18px] border border-white/8 bg-[#101526] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h2 className="border-b border-white/8 px-6 py-5 font-serif text-xl font-semibold text-[#faf7ee]">Movie Details</h2>
          <div className="grid gap-0 p-6">
            <DetailRow label="Genre" value={movie.genre ?? 'General'} />
            <DetailRow label="Duration" value={formatDuration(movie.duration_min)} />
            <DetailRow label="Status" value={status} />
            <DetailRow label="Movie ID" value={`#${movie.movie_id}`} />
            <DetailRow label="Created" value={formatDate(movie.created_at)} />
          </div>
        </article>

        <article className="dashboard-enter rounded-[18px] border border-white/8 bg-[#101526] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h2 className="m-0 font-serif text-xl font-semibold text-[#faf7ee]">Performance</h2>
          <div className="mt-7 grid gap-5">
            <ProgressMetric label="Ticket Sales Progress" value={sold} max={target} tone="gold" />
            <ProgressMetric label="Audience Rating" value={84} max={100} suffix="%" tone="teal" />
            <ProgressMetric label="Seat Occupancy Avg" value={78} max={100} suffix="%" tone="blue" />
          </div>
          <div className="mt-8 grid gap-4 border-t border-white/8 pt-7">
            <DetailRow label="Hall A Revenue" value="$7,200" compact />
            <DetailRow label="Hall B Revenue" value="$3,800" compact />
          </div>
        </article>
      </section>
    </div>
  )
}

function MovieFormView({
  movie,
  onCancel,
  onSave,
}: {
  movie: Movie | null
  onCancel: () => void
  onSave: (payload: MoviePayload) => Promise<void>
}) {
  const [form, setForm] = useState(() => ({
    title: movie?.title ?? emptyForm.title,
    genre: movie?.genre ?? emptyForm.genre,
    duration_min: movie?.duration_min ? String(movie.duration_min) : emptyForm.duration_min,
    status: normalizeStatus(movie?.status ?? emptyForm.status),
    poster_url: movie?.poster_url ?? emptyForm.poster_url,
    description: movie?.description ?? emptyForm.description,
  }))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      await onSave({
        title: form.title.trim(),
        genre: form.genre,
        duration_min: Number(form.duration_min) || undefined,
        status: form.status,
        poster_url: form.poster_url.trim() || undefined,
        description: form.description.trim() || undefined,
      })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save movie')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="content-transition">
      <Breadcrumb current={movie ? `Edit ${movie.title}` : 'Add New Movie'} />

      <form onSubmit={handleSubmit} className="dashboard-enter mt-6">
        <section className="rounded-[18px] border border-white/8 bg-[#101526] p-7 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h1 className="m-0 flex items-center gap-3 border-b border-white/8 pb-5 font-serif text-xl font-semibold text-[#faf7ee]">
            <span className="text-amber-400">
              <MovieIcon name="film" />
            </span>
            Movie Information
          </h1>

          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-5 xl:grid-cols-2">
            <FormField label="Title">
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Movie title"
                required
                className={inputClasses}
              />
            </FormField>

            <FormField label="Genre">
              <select
                value={form.genre}
                onChange={(event) => setForm({ ...form, genre: event.target.value })}
                className={inputClasses}
              >
                {['Action', 'Sci-Fi', 'Thriller', 'Romance', 'Horror', 'Drama', 'Comedy'].map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Duration (Min)">
              <input
                value={form.duration_min}
                onChange={(event) => setForm({ ...form, duration_min: event.target.value })}
                type="number"
                min="1"
                placeholder="120"
                className={inputClasses}
              />
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as MovieStatus })}
                className={inputClasses}
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>

            <div className="xl:col-span-2">
              <FormField label="Poster URL">
                <input
                  value={form.poster_url}
                  onChange={(event) => setForm({ ...form, poster_url: event.target.value })}
                  placeholder="https://..."
                  className={inputClasses}
                />
              </FormField>
            </div>

            <div className="xl:col-span-2">
              <FormField label="Synopsis">
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Movie description..."
                  rows={5}
                  className={`${inputClasses} min-h-[110px] resize-y py-3`}
                />
              </FormField>
            </div>
          </div>

          {error ? <div className="mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
        </section>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-bold text-[#a1abc8]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-[#ffbb36] to-[#f2a318] px-6 text-sm font-extrabold text-[#170f05]"
          >
            <MovieIcon name="check" />
            {isSaving ? 'Saving...' : 'Save Movie'}
          </button>
        </div>
      </form>
    </div>
  )
}

function MovieShell({
  children,
  activeNav,
  movieCount,
  onNavigate,
}: {
  children: ReactNode
  activeNav: string
  movieCount: number
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
            <NavSection title="OVERVIEW" items={overviewItems} activeNav={activeNav} onNavigate={onNavigate} movieCount={movieCount} />
            <NavSection title="CONTENT" items={contentItems} activeNav={activeNav} onNavigate={onNavigate} movieCount={movieCount} />
            <NavSection title="VENUE" items={venueItems} activeNav={activeNav} onNavigate={onNavigate} movieCount={movieCount} />
            <NavSection title="TRANSACTIONS" items={transactionItems} activeNav={activeNav} onNavigate={onNavigate} movieCount={movieCount} />
            <div className="mb-3 mt-[18px] px-3.5 text-xs tracking-[0.08em] text-[#727b97]">Analytics</div>
            <NavSection title="" items={analyticsItems} activeNav={activeNav} onNavigate={onNavigate} movieCount={movieCount} />
            <NavSection title="SYSTEM" items={systemItems} activeNav={activeNav} onNavigate={onNavigate} movieCount={movieCount} />
          </nav>

          <div className="relative z-10 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl bg-[#111725] px-3.5 py-2.5">
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
  movieCount,
  onNavigate,
}: {
  title: string
  items: NavItem[]
  activeNav: string
  movieCount: number
  onNavigate: (page: PageName) => void
}) {
  return (
    <section className="mt-[18px] first:mt-0">
      {title ? <p className="mb-3 px-3.5 text-xs tracking-[0.08em] text-[#727b97]">{title}</p> : null}
      <div className="grid gap-1.5">
        {items.map((item) => {
          const isActive = activeNav === item.label
          const badge = item.label === 'Movies' ? String(movieCount || item.badge || 0) : item.badge

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
                <MovieIcon name={item.icon} />
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {badge ? (
                <span className={['ml-auto inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none', badge === '5' ? 'bg-[#ff4f7d] text-white' : 'bg-[#6b4512] text-[#ffc24a]'].join(' ')}>
                  {badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function PosterArt({ movie, index, large = false }: { movie: Movie; index: number; large?: boolean }) {
  if (movie.poster_url) {
    return <img src={movie.poster_url} alt="" className="h-full w-full rounded-[inherit] object-cover" />
  }

  return (
    <div className={['grid place-items-center rounded-2xl bg-black/20 text-4xl shadow-[0_16px_38px_rgba(0,0,0,0.22)]', large ? 'h-24 w-24 text-5xl' : 'h-20 w-20'].join(' ')}>
      <span>{['🎬', '🚀', '🕵️', '♥', '★', '●'][index % 6]}</span>
    </div>
  )
}

function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="mt-6 flex items-center gap-3 text-sm font-bold">
      <span className="text-amber-300">Movies</span>
      <span className="text-[#68728e]">›</span>
      <span className="text-[#9aa4c0]">{current}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: MovieStatus }) {
  const classes: Record<MovieStatus, string> = {
    active: 'bg-teal-400/10 text-teal-300 before:bg-teal-300',
    upcoming: 'bg-blue-400/10 text-blue-300 before:bg-blue-300',
    inactive: 'bg-white/7 text-[#9aa4c0] before:bg-[#9aa4c0]',
  }

  return (
    <span className={`before:mr-1.5 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize before:h-[5px] before:w-[5px] before:rounded-full before:content-[''] ${classes[status]}`}>
      {status}
    </span>
  )
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: 'gold' | 'teal' | 'blue' }) {
  const toneClass = {
    gold: 'text-amber-300',
    teal: 'text-teal-300',
    blue: 'text-blue-300',
  }[tone]

  return (
    <article className="dashboard-enter rounded-[16px] border border-white/8 bg-[#101526] px-6 py-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#717b99]">{label}</div>
      <strong className={`mt-4 block font-serif text-2xl font-semibold ${toneClass}`}>{value}</strong>
    </article>
  )
}

function DetailRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={['flex items-center justify-between gap-4 border-b border-white/6 last:border-b-0', compact ? 'py-2 text-sm' : 'py-3'].join(' ')}>
      <span className="text-[#77819e]">{label}</span>
      <strong className="text-right font-semibold capitalize text-[#eef1f8]">{value}</strong>
    </div>
  )
}

function ProgressMetric({
  label,
  value,
  max,
  suffix = '',
  tone,
}: {
  label: string
  value: number
  max: number
  suffix?: string
  tone: 'gold' | 'teal' | 'blue'
}) {
  const width = Math.min((value / max) * 100, 100)
  const color = {
    gold: 'bg-amber-400',
    teal: 'bg-teal-300',
    blue: 'bg-blue-300',
  }[tone]

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm font-bold text-[#eef1f8]">
        <span>{label}</span>
        <span className="font-mono text-amber-300">
          {value}
          {suffix} {suffix ? '' : `/ ${max} target`}
        </span>
      </div>
      <div className="progress-track h-[6px] overflow-hidden rounded-full bg-[#22283a]">
        <div className={`progress-fill h-full rounded-full ${color}`} style={{ '--progress-width': `${width}%` } as CSSProperties} />
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

function MovieIcon({ name }: { name: string }) {
  const icons: Record<string, ReactElement> = {
    clapper: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon fill-current stroke-0">
        <path d="M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm.2-4.3 2.6-.7 2.5 3.5-3.8 1-1.3-3.8Zm6-.4 2.6-.7 2.5 3.5-3.8 1-1.3-3.8Zm6-.3 2.3-.6 1.3 3.7-3.1.8-2.5-3.4Z" />
      </svg>
    ),
    film: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 4v16M15 4v16M5 8h4M15 8h4M5 16h4M15 16h4" />
      </svg>
    ),
    gauge: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M6.5 15a5.5 5.5 0 1 1 11 0M12 12l3-3M5 19h14" />
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
        <path d="M8 14a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM16 13a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM3.5 19a4.5 4.5 0 0 1 9 0M13 19a4 4 0 0 1 7.5-1.8" />
      </svg>
    ),
    ticket: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z" />
      </svg>
    ),
    wallet: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9ZM15 12h5" />
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
    settings: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="m12 3 1.5 2.7 3.1.4.7 3 .7.5-.7.5-.7 3-3.1.4L12 21l-1.5-2.7-3.1-.4-.7-3-.7-.5.7-.5.7-3 3.1-.4L12 3Z" />
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm9 2-3.5-3.5" />
      </svg>
    ),
    plus: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon fill-current">
        <path d="m12 3 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3Z" />
      </svg>
    ),
    edit: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 7.5l3 3" />
      </svg>
    ),
    back: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
    ),
    trash: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-icon">
        <path d="m5 12 4 4L19 6" />
      </svg>
    ),
  }

  return icons[name] ?? <span />
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

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? 'Request failed')
  }

  return result.data as T
}

const inputClasses =
  'h-12 w-full rounded-lg border border-white/10 bg-white/[0.035] px-4 text-sm font-semibold text-[#eef1f8] outline-none transition duration-200 placeholder:text-[#69728e] focus:border-amber-400/55 focus:bg-white/[0.055] focus:ring-4 focus:ring-amber-400/10'

function normalizeStatus(status: string): MovieStatus {
  const value = status.toLowerCase()
  if (value === 'upcoming') return 'upcoming'
  if (value === 'inactive') return 'inactive'
  return 'active'
}

function formatDuration(minutes: number | null) {
  if (!minutes) return 'No duration'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours ? `${hours}h ${mins.toString().padStart(2, '0')}m` : `${mins}m`
}

function formatDate(value?: string) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function getMovieRating(movie: Movie, index: number) {
  return Math.min(9.2, 6.8 + ((movie.movie_id + index) % 18) / 10)
}

function getTicketsSold(movie: Movie) {
  return 220 + ((movie.movie_id * 37 + (movie.duration_min ?? 90)) % 420)
}

export default MoviesPage
