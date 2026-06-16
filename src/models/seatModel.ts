import pool from '../config/db';
import type { SeatFromDB, CreateSeatInput, UpdateSeatInput } from '../@types/seat';

// Get all seats
export async function getAllSeats(): Promise<SeatFromDB[]> {
  const result = await pool.query(
    'SELECT * FROM seats ORDER BY seat_id ASC'
  );
  return result.rows;
}

// Get seats by hall id
export async function getSeatsByHallId(hallId: number): Promise<SeatFromDB[]> {
  const result = await pool.query(
    'SELECT * FROM seats WHERE hall_id = $1 ORDER BY seat_number ASC',
    [hallId]
  );
  return result.rows;
}

// Get seat by id
export async function getSeatById(id: number): Promise<SeatFromDB | null> {
  const result = await pool.query(
    'SELECT * FROM seats WHERE seat_id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Get seat by hall and seat number
export async function getSeatByHallAndNumber(hallId: number, seatNumber: string): Promise<SeatFromDB | null> {
  const result = await pool.query(
    'SELECT * FROM seats WHERE hall_id = $1 AND LOWER(seat_number) = LOWER($2)',
    [hallId, seatNumber]
  );
  return result.rows[0] || null;
}

// Create seat
export async function createSeat(data: CreateSeatInput): Promise<SeatFromDB> {
  const result = await pool.query(
    `INSERT INTO seats (hall_id, seat_number, seat_type)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.hall_id, data.seat_number, data.seat_type]
  );
  return result.rows[0];
}

// Create many seats
export async function createSeats(data: CreateSeatInput[]): Promise<SeatFromDB[]> {
  const values: string[] = [];
  const params: Array<number | string> = [];

  data.forEach((seat, index) => {
    const paramIndex = index * 3;
    values.push(`($${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`);
    params.push(seat.hall_id, seat.seat_number, seat.seat_type);
  });

  const result = await pool.query(
    `INSERT INTO seats (hall_id, seat_number, seat_type)
     VALUES ${values.join(', ')}
     RETURNING *`,
    params
  );

  return result.rows;
}

// Update seat
export async function updateSeat(id: number, data: UpdateSeatInput): Promise<SeatFromDB | null> {
  const result = await pool.query(
    `UPDATE seats SET
      seat_number = COALESCE($1, seat_number),
      seat_type = COALESCE($2, seat_type)
     WHERE seat_id = $3 RETURNING *`,
    [data.seat_number, data.seat_type, id]
  );
  return result.rows[0] || null;
}

// Delete seat
export async function deleteSeat(id: number): Promise<void> {
  await pool.query('DELETE FROM seats WHERE seat_id = $1', [id]);
}
