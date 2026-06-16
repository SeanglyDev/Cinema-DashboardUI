import pool from '../config/db';
import type { BookingFromDB, BookingSeatFromDB, BookingDetail } from '../@types/booking';

// Get all bookings with details
export async function getAllBookings(): Promise<BookingDetail[]> {
  const result = await pool.query(`
    SELECT
      b.booking_id,
      b.user_id,
      b.show_time_id,
      b.status,
      b.total_amount,
      b.created_at,
      u.name AS user_name,
      u.email AS user_email,
      m.title AS movie_title,
      h.name AS hall_name,
      c.name AS cinema_name,
      TO_CHAR(st.show_date, 'YYYY-MM-DD') AS show_date,
      st.show_time
    FROM booking b
    JOIN users u ON b.user_id = u.user_id
    JOIN show_times st ON b.show_time_id = st.show_time_id
    JOIN movies m ON st.movie_id = m.movie_id
    JOIN halls h ON st.hall_id = h.hall_id
    JOIN cinemas c ON h.cinema_id = c.cinema_id
    ORDER BY b.created_at DESC
  `);
  return result.rows;
}

// Get booking by id with seat details
export async function getBookingById(id: number): Promise<any> {
  // Get booking info
  const bookingResult = await pool.query(`
    SELECT
      b.booking_id,
      b.user_id,
      b.show_time_id,
      b.status,
      b.total_amount,
      b.created_at,
      u.name AS user_name,
      u.email AS user_email,
      m.title AS movie_title,
      h.name AS hall_name,
      c.name AS cinema_name,
      TO_CHAR(st.show_date, 'YYYY-MM-DD') AS show_date,
      st.show_time
    FROM booking b
    JOIN users u ON b.user_id = u.user_id
    JOIN show_times st ON b.show_time_id = st.show_time_id
    JOIN movies m ON st.movie_id = m.movie_id
    JOIN halls h ON st.hall_id = h.hall_id
    JOIN cinemas c ON h.cinema_id = c.cinema_id
    WHERE b.booking_id = $1
  `, [id]);

  if (!bookingResult.rows[0]) return null;

  // Get seats for this booking
  const seatsResult = await pool.query(`
    SELECT
      s.seat_number,
      s.seat_type,
      tp.price
    FROM booking_seats bs
    JOIN seats s ON bs.seat_id = s.seat_id
    JOIN ticket_prices tp ON tp.show_time_id = $1
      AND tp.seat_type = s.seat_type
    WHERE bs.booking_id = $2
  `, [bookingResult.rows[0].show_time_id, id]);

  return {
    ...bookingResult.rows[0],
    seats: seatsResult.rows,
  };
}

// Get bookings by user id
export async function getBookingsByUserId(userId: number): Promise<BookingFromDB[]> {
  const result = await pool.query(
    'SELECT * FROM booking WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

// Create booking
export async function createBooking(
  userId: number,
  showTimeId: number,
  totalAmount: number
): Promise<BookingFromDB> {
  const result = await pool.query(
    `INSERT INTO booking (user_id, show_time_id, total_amount, status)
     VALUES ($1, $2, $3, 'pending') RETURNING *`,
    [userId, showTimeId, totalAmount]
  );
  return result.rows[0];
}

// Create booking seats
export async function createBookingSeats(
  bookingId: number,
  seatIds: number[]
): Promise<void> {
  const values: any[] = [];
  const placeholders = seatIds.map((seatId, index) => {
    values.push(bookingId, seatId);
    const i = index * 2;
    return `($${i + 1}, $${i + 2}, 'reserved')`;
  });

  await pool.query(
    `INSERT INTO booking_seats (booking_id, seat_id, status)
     VALUES ${placeholders.join(', ')}`,
    values
  );
}

// Update booking status
export async function updateBookingStatus(
  id: number,
  status: string
): Promise<BookingFromDB | null> {
  const result = await pool.query(
    `UPDATE booking SET status = $1
     WHERE booking_id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0] || null;
}

// Delete booking
export async function deleteBooking(id: number): Promise<void> {
  await pool.query('DELETE FROM booking_seats WHERE booking_id = $1', [id]);
  await pool.query('DELETE FROM booking WHERE booking_id = $1', [id]);
}

// Check if seat already booked for show time
export async function checkSeatsAvailable(
  showTimeId: number,
  seatIds: number[]
): Promise<boolean> {
  const result = await pool.query(`
    SELECT bs.seat_id
    FROM booking_seats bs
    JOIN booking b ON bs.booking_id = b.booking_id
    WHERE b.show_time_id = $1
      AND bs.seat_id = ANY($2)
      AND b.status != 'cancelled'
  `, [showTimeId, seatIds]);
  return result.rows.length === 0; // true = available
}
