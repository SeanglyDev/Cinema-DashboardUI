// =====================
// INPUT TYPES
// =====================

export interface CreateMovieInput {
  poster_url?: string;
  title: string;
  genre?: string;
  duration_min?: number;
  status?: string;
  description?: string;
}

export interface UpdateMovieInput {
  poster_url?: string;
  title?: string;
  genre?: string;
  duration_min?: number;
  status?: string;
  description?: string;
}

// =====================
// DATABASE TYPE
// =====================

export interface MovieFromDB {
  movie_id: number;
  poster_url: string | null;
  title: string;
  genre: string | null;
  duration_min: number | null;
  status: string;
  description: string | null;
  created_at: Date;
}