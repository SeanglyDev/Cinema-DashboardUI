import pool from '../config/db';
import type { MovieFromDB, CreateMovieInput, UpdateMovieInput } from '../@types/movie';

// Get all movies
export async function getAllMovies(): Promise<MovieFromDB[]> {
  const result = await pool.query(
    'SELECT * FROM movies ORDER BY created_at DESC'
  );
  return result.rows;
}

// Get movie by id
export async function getMovieById(id: number): Promise<MovieFromDB | null> {
  const result = await pool.query(
    'SELECT * FROM movies WHERE movie_id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Get movie by title
export async function getMovieByTitle(title: string): Promise<MovieFromDB | null> {
  const result = await pool.query(
    'SELECT * FROM movies WHERE LOWER(title) = LOWER($1) LIMIT 1',
    [title.trim()]
  );
  return result.rows[0] || null;
}

// Create movie
export async function createMovie(data: CreateMovieInput): Promise<MovieFromDB> {
  const result = await pool.query(
    `INSERT INTO movies (poster_url, title, genre, duration_min, status, description)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      data.poster_url || null,
      data.title,
      data.genre || null,
      data.duration_min || null,
      data.status || 'active',
      data.description || null,
    ]
  );
  return result.rows[0];
}

// Update movie
export async function updateMovie(id: number, data: UpdateMovieInput): Promise<MovieFromDB | null> {
  const result = await pool.query(
    `UPDATE movies SET
      poster_url = COALESCE($1, poster_url),
      title = COALESCE($2, title),
      genre = COALESCE($3, genre),
      duration_min = COALESCE($4, duration_min),
      status = COALESCE($5, status),
      description = COALESCE($6, description)
     WHERE movie_id = $7 RETURNING *`,
    [
      data.poster_url,
      data.title,
      data.genre,
      data.duration_min,
      data.status,
      data.description,
      id,
    ]
  );
  return result.rows[0] || null;
}

// Delete movie
export async function deleteMovie(id: number): Promise<void> {
  await pool.query('DELETE FROM movies WHERE movie_id = $1', [id]);
}
