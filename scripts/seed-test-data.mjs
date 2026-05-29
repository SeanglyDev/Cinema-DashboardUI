const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  console.error('Missing ADMIN_TOKEN. Set it to a valid admin JWT before running this script.')
  console.error('PowerShell example: $env:ADMIN_TOKEN="YOUR_ADMIN_TOKEN"; npm run seed:test')
  process.exit(1)
}

const movies = [
  {
    title: "The Lion's Kingdom",
    genre: 'Action',
    duration_min: 138,
    status: 'active',
    description: 'An epic adventure following a young lion prince reclaiming his kingdom.',
    poster_url: '',
  },
  {
    title: 'Galaxy Rush 3',
    genre: 'Sci-Fi',
    duration_min: 155,
    status: 'active',
    description: 'A fast cosmic rescue mission across collapsing star lanes.',
    poster_url: '',
  },
  {
    title: 'Shadow Detective',
    genre: 'Thriller',
    duration_min: 115,
    status: 'active',
    description: 'A detective hunts a hidden criminal network before midnight.',
    poster_url: '',
  },
  {
    title: 'Forever & Always',
    genre: 'Romance',
    duration_min: 102,
    status: 'active',
    description: 'A heartfelt story about second chances and old promises.',
    poster_url: '',
  },
  {
    title: 'Midnight Horror',
    genre: 'Horror',
    duration_min: 108,
    status: 'upcoming',
    description: 'A late-night screening turns into a terrifying mystery.',
    poster_url: '',
  },
  {
    title: 'Iron Fist',
    genre: 'Action',
    duration_min: 125,
    status: 'inactive',
    description: 'A former fighter returns for one final underground match.',
    poster_url: '',
  },
]

const cinemas = [
  {
    name: 'CineStar Central',
    location: 'Phnom Penh',
    contact: '+855 23 456 789',
    halls: [
      { name: 'Hall A', capacity: 200 },
      { name: 'Hall B', capacity: 120 },
      { name: 'VIP', capacity: 60 },
    ],
  },
  {
    name: 'Galaxy Cinema',
    location: 'Siem Reap',
    contact: '+855 63 456 789',
    halls: [
      { name: 'Hall 1', capacity: 180 },
      { name: 'IMAX', capacity: 250 },
    ],
  },
]

const showtimeSeeds = [
  { movie: "The Lion's Kingdom", cinema: 'CineStar Central', hall: 'Hall A', show_date: '2026-06-01', show_time: '14:30', status: 'active' },
  { movie: 'Galaxy Rush 3', cinema: 'CineStar Central', hall: 'Hall B', show_date: '2026-06-01', show_time: '17:00', status: 'active' },
  { movie: 'Shadow Detective', cinema: 'CineStar Central', hall: 'VIP', show_date: '2026-06-01', show_time: '19:45', status: 'active' },
  { movie: 'Forever & Always', cinema: 'Galaxy Cinema', hall: 'Hall 1', show_date: '2026-06-02', show_time: '20:30', status: 'active' },
  { movie: 'Midnight Horror', cinema: 'Galaxy Cinema', hall: 'IMAX', show_date: '2026-06-03', show_time: '22:15', status: 'active' },
]

async function main() {
  console.log(`Seeding test data through ${API_BASE_URL}`)

  const movieMap = new Map()
  for (const movie of movies) {
    const savedMovie = await findOrCreateMovie(movie)
    movieMap.set(savedMovie.title, savedMovie)
  }

  const cinemaMap = new Map()
  const hallMap = new Map()
  for (const cinema of cinemas) {
    const savedCinema = await findOrCreateCinema(cinema)
    cinemaMap.set(savedCinema.name, savedCinema)

    for (const hall of cinema.halls) {
      const savedHall = await findOrCreateHall(savedCinema.cinema_id, hall)
      hallMap.set(`${savedCinema.name}:${savedHall.name}`, savedHall)
    }
  }

  for (const showtime of showtimeSeeds) {
    const movie = movieMap.get(showtime.movie)
    const hall = hallMap.get(`${showtime.cinema}:${showtime.hall}`)

    if (!movie || !hall) {
      console.warn(`Skipping showtime because movie or hall was not found: ${showtime.movie} / ${showtime.hall}`)
      continue
    }

    await findOrCreateShowtime({
      movie_id: movie.movie_id,
      hall_id: hall.hall_id,
      show_date: showtime.show_date,
      show_time: showtime.show_time,
      status: showtime.status,
    })
  }

  console.log('Seed complete.')
}

async function findOrCreateMovie(movie) {
  const existingMovies = await apiGet('/api/movies')
  const existing = existingMovies.find((item) => sameText(item.title, movie.title))
  if (existing) {
    console.log(`Movie exists: ${existing.title}`)
    return existing
  }

  const created = await apiWrite('/api/movies', 'POST', movie)
  console.log(`Movie created: ${created.title}`)
  return created
}

async function findOrCreateCinema(cinema) {
  const existingCinemas = await apiGet('/api/cinemas')
  const existing = existingCinemas.find((item) => sameText(item.name, cinema.name))
  if (existing) {
    console.log(`Cinema exists: ${existing.name}`)
    return existing
  }

  const created = await apiWrite('/api/cinemas', 'POST', {
    name: cinema.name,
    location: cinema.location,
    contact: cinema.contact,
  })
  console.log(`Cinema created: ${created.name}`)
  return created
}

async function findOrCreateHall(cinemaId, hall) {
  const existingHalls = await apiGet(`/api/halls/cinema/${cinemaId}`)
  const existing = existingHalls.find((item) => sameText(item.name, hall.name))
  if (existing) {
    console.log(`Hall exists: ${existing.name}`)
    return existing
  }

  const created = await apiWrite('/api/halls', 'POST', {
    cinema_id: cinemaId,
    name: hall.name,
    capacity: hall.capacity,
  })
  console.log(`Hall created: ${created.name}`)
  return created
}

async function findOrCreateShowtime(showtime) {
  const existingShowtimes = await apiGet('/api/showtimes')
  const existing = existingShowtimes.find((item) => {
    return (
      item.show_date === showtime.show_date &&
      normalizeTime(item.show_time) === normalizeTime(showtime.show_time) &&
      item.movie_title &&
      item.hall_name
    )
  })

  if (existing) {
    console.log(`Showtime may already exist: ${existing.movie_title} ${existing.show_date} ${normalizeTime(existing.show_time)}`)
    return existing
  }

  const created = await apiWrite('/api/showtimes', 'POST', showtime)
  console.log(`Showtime created: ${created.movie_title} ${created.show_date} ${normalizeTime(created.show_time)}`)
  return created
}

async function apiGet(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)
  return readApiResponse(response)
}

async function apiWrite(endpoint, method, body) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return readApiResponse(response)
}

async function readApiResponse(response) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message ?? `${response.status} ${response.statusText}`)
  }
  return payload.data ?? payload
}

function sameText(left, right) {
  return String(left).trim().toLowerCase() === String(right).trim().toLowerCase()
}

function normalizeTime(value) {
  return String(value).slice(0, 5)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
