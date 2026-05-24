import pool from '../config/db';
import type { ShowTimeFromDB, CreateShowTimeInput, UpdateShowTimeInput, ShowTimeDetail } from '../@types/showtime';

// Get all show times with movie & hall info
export async function getAllShowTimes(): Promise<ShowTimeDetail[]> {
  const result = await pool.query(`
    SELECT
      st.show_time_id,
      TO_CHAR(st.show_date, 'YYYY-MM-DD') AS show_date,
      st.show_time,
      st.status,
      m.title AS movie_title,
      m.genre AS movie_genre,
      m.duration_min AS movie_duration,
      h.name AS hall_name,
      c.name AS cinema_name
    FROM show_times st
    JOIN movies m ON st.movie_id = m.movie_id
    JOIN halls h ON st.hall_id = h.hall_id
    JOIN cinemas c ON h.cinema_id = c.cinema_id
    ORDER BY st.show_date ASC, st.show_time ASC
  `);
  return result.rows;
}

// Get show times by movie id
export async function getShowTimesByMovieId(movieId: number): Promise<ShowTimeDetail[]> {
  const result = await pool.query(`
    SELECT
      st.show_time_id,
      TO_CHAR(st.show_date, 'YYYY-MM-DD') AS show_date,
      st.show_time,
      st.status,
      m.title AS movie_title,
      m.genre AS movie_genre,
      m.duration_min AS movie_duration,
      h.name AS hall_name,
      c.name AS cinema_name
    FROM show_times st
    JOIN movies m ON st.movie_id = m.movie_id
    JOIN halls h ON st.hall_id = h.hall_id
    JOIN cinemas c ON h.cinema_id = c.cinema_id
    WHERE st.movie_id = $1
    ORDER BY st.show_date ASC, st.show_time ASC
  `, [movieId]);
  return result.rows;
}

// Get show time by id
export async function getShowTimeById(id: number): Promise<ShowTimeFromDB | null> {
  const result = await pool.query(
    'SELECT * FROM show_times WHERE show_time_id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Get show time detail by id
export async function getShowTimeDetailById(id: number): Promise<ShowTimeDetail | null> {
  const result = await pool.query(`
    SELECT
      st.show_time_id,
      TO_CHAR(st.show_date, 'YYYY-MM-DD') AS show_date,
      st.show_time,
      st.status,
      m.title AS movie_title,
      m.genre AS movie_genre,
      m.duration_min AS movie_duration,
      h.name AS hall_name,
      c.name AS cinema_name
    FROM show_times st
    JOIN movies m ON st.movie_id = m.movie_id
    JOIN halls h ON st.hall_id = h.hall_id
    JOIN cinemas c ON h.cinema_id = c.cinema_id
    WHERE st.show_time_id = $1
  `, [id]);
  return result.rows[0] || null;
}

// Get show time by hall, date, and time
export async function getShowTimeByHallDateAndTime(
  hallId: number,
  showDate: string | Date,
  showTime: string
): Promise<ShowTimeFromDB | null> {
  const result = await pool.query(
    `SELECT * FROM show_times
     WHERE hall_id = $1
       AND show_date = $2
       AND show_time = $3`,
    [hallId, showDate, showTime]
  );
  return result.rows[0] || null;
}

// Create show time
export async function createShowTime(data: CreateShowTimeInput): Promise<ShowTimeFromDB> {
  const result = await pool.query(
    `INSERT INTO show_times (movie_id, hall_id, show_date, show_time, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      data.movie_id,
      data.hall_id,
      data.show_date,
      data.show_time,
      data.status || 'active',
    ]
  );
  return result.rows[0];
}

// Update show time
export async function updateShowTime(id: number, data: UpdateShowTimeInput): Promise<ShowTimeFromDB | null> {
  const result = await pool.query(
    `UPDATE show_times SET
      movie_id = COALESCE($1, movie_id),
      hall_id = COALESCE($2, hall_id),
      show_date = COALESCE($3, show_date),
      show_time = COALESCE($4, show_time),
      status = COALESCE($5, status)
     WHERE show_time_id = $6 RETURNING *`,
    [
      data.movie_id,
      data.hall_id,
      data.show_date,
      data.show_time,
      data.status,
      id,
    ]
  );
  return result.rows[0] || null;
}

// Delete show time
export async function deleteShowTime(id: number): Promise<void> {
  await pool.query('DELETE FROM show_times WHERE show_time_id = $1', [id]);
}
