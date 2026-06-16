import pool from '../config/db';
import type { HallFromDB, CreateHallInput, UpdateHallInput } from '../@types/cinema';

// Get all halls
export async function getAllHalls(): Promise<HallFromDB[]> {
  const result = await pool.query(
    'SELECT * FROM halls ORDER BY created_at DESC'
  );
  return result.rows;
}

// Get halls by cinema id
export async function getHallsByCinemaId(cinemaId: number): Promise<HallFromDB[]> {
  const result = await pool.query(
    'SELECT * FROM halls WHERE cinema_id = $1',
    [cinemaId]
  );
  return result.rows;
}

// Get hall by id
export async function getHallById(id: number): Promise<HallFromDB | null> {
  const result = await pool.query(
    'SELECT * FROM halls WHERE hall_id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Get hall by cinema and name
export async function getHallByCinemaIdAndName(cinemaId: number, name: string): Promise<HallFromDB | null> {
  const result = await pool.query(
    'SELECT * FROM halls WHERE cinema_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1',
    [cinemaId, name.trim()]
  );
  return result.rows[0] || null;
}

// Create hall
export async function createHall(data: CreateHallInput): Promise<HallFromDB> {
  const result = await pool.query(
    `INSERT INTO halls (cinema_id, name, capacity)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.cinema_id, data.name, data.capacity]
  );
  return result.rows[0];
}

// Update hall
export async function updateHall(id: number, data: UpdateHallInput): Promise<HallFromDB | null> {
  const result = await pool.query(
    `UPDATE halls SET
      name = COALESCE($1, name),
      capacity = COALESCE($2, capacity)
     WHERE hall_id = $3 RETURNING *`,
    [data.name, data.capacity, id]
  );
  return result.rows[0] || null;
}

// Delete hall
export async function deleteHall(id: number): Promise<void> {
  await pool.query('DELETE FROM halls WHERE hall_id = $1', [id]);
}
