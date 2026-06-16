import pool from '../config/db';
import type { CinemaFromDB, CreateCinemaInput, UpdateCinemaInput } from '../@types/cinema';

// Get all cinemas
export async function getAllCinemas(): Promise<CinemaFromDB[]> {
  const result = await pool.query(
    'SELECT * FROM cinemas ORDER BY created_at DESC'
  );
  return result.rows;
}

// Get cinema by id
export async function getCinemaById(id: number): Promise<CinemaFromDB | null> {
  const result = await pool.query(
    'SELECT * FROM cinemas WHERE cinema_id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Get cinema by name
export async function getCinemaByName(name: string): Promise<CinemaFromDB | null> {
  const result = await pool.query(
    'SELECT * FROM cinemas WHERE LOWER(name) = LOWER($1) LIMIT 1',
    [name.trim()]
  );
  return result.rows[0] || null;
}

// Create cinema
export async function createCinema(data: CreateCinemaInput): Promise<CinemaFromDB> {
  const result = await pool.query(
    `INSERT INTO cinemas (name, location, contact)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.name, data.location || null, data.contact || null]
  );
  return result.rows[0];
}

// Update cinema
export async function updateCinema(id: number, data: UpdateCinemaInput): Promise<CinemaFromDB | null> {
  const result = await pool.query(
    `UPDATE cinemas SET
      name = COALESCE($1, name),
      location = COALESCE($2, location),
      contact = COALESCE($3, contact)
     WHERE cinema_id = $4 RETURNING *`,
    [data.name, data.location, data.contact, id]
  );
  return result.rows[0] || null;
}

// Delete cinema
export async function deleteCinema(id: number): Promise<void> {
  await pool.query('DELETE FROM cinemas WHERE cinema_id = $1', [id]);
}
