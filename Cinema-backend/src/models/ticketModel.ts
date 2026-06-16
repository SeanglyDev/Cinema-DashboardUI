import pool from '../config/db';
import type { PaymentFromDB, TicketDetail, TicketFromDB } from '../@types/ticket';

export async function createPaidPayment(
  bookingId: number,
  method: string,
  amount: number,
  transactionId: string | null
): Promise<PaymentFromDB> {
  const result = await pool.query(
    `INSERT INTO payments (booking_id, method, amount, status, paid_at, transaction_id)
     VALUES ($1, $2, $3, 'paid', NOW(), $4)
     RETURNING *`,
    [bookingId, method, amount, transactionId]
  );

  return result.rows[0];
}

export async function createTicket(
  bookingId: number,
  paymentId: number,
  qrCode: string
): Promise<TicketFromDB> {
  const result = await pool.query(
    `INSERT INTO tickets (booking_id, payment_id, qr_code)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [bookingId, paymentId, qrCode]
  );

  return result.rows[0];
}

export async function updateTicketQrCode(ticketId: number, qrCode: string): Promise<TicketFromDB> {
  const result = await pool.query(
    'UPDATE tickets SET qr_code = $1 WHERE ticket_id = $2 RETURNING *',
    [qrCode, ticketId]
  );

  return result.rows[0];
}

export async function getTicketByBookingId(bookingId: number): Promise<TicketFromDB | null> {
  const result = await pool.query(
    'SELECT * FROM tickets WHERE booking_id = $1 ORDER BY ticket_id DESC LIMIT 1',
    [bookingId]
  );

  return result.rows[0] || null;
}

export async function getTicketDetail(ticketId: number): Promise<TicketDetail | null> {
  const ticketResult = await pool.query(
    `SELECT
       t.ticket_id,
       t.booking_id,
       t.payment_id,
       t.qr_code,
       t.is_used_at,
       b.status AS booking_status,
       b.total_amount,
       b.user_id,
       u.name AS user_name,
       u.email AS user_email,
       m.title AS movie_title,
       h.name AS hall_name,
       c.name AS cinema_name,
       TO_CHAR(st.show_date, 'YYYY-MM-DD') AS show_date,
       st.show_time
     FROM tickets t
     JOIN booking b ON b.booking_id = t.booking_id
     JOIN users u ON u.user_id = b.user_id
     JOIN show_times st ON st.show_time_id = b.show_time_id
     JOIN movies m ON m.movie_id = st.movie_id
     JOIN halls h ON h.hall_id = st.hall_id
     JOIN cinemas c ON c.cinema_id = h.cinema_id
     WHERE t.ticket_id = $1`,
    [ticketId]
  );

  if (!ticketResult.rows[0]) return null;

  const seatsResult = await pool.query(
    `SELECT
       s.seat_number,
       s.seat_type,
       tp.price
     FROM booking_seats bs
     JOIN booking b ON b.booking_id = bs.booking_id
     JOIN seats s ON s.seat_id = bs.seat_id
     JOIN ticket_prices tp ON tp.show_time_id = b.show_time_id
       AND tp.seat_type = s.seat_type
     WHERE bs.booking_id = $1
     ORDER BY s.seat_number`,
    [ticketResult.rows[0].booking_id]
  );

  return {
    ...ticketResult.rows[0],
    seats: seatsResult.rows,
  };
}

export async function confirmTicketUsed(ticketId: number): Promise<TicketFromDB | null> {
  const result = await pool.query(
    `UPDATE tickets
     SET is_used_at = NOW()
     WHERE ticket_id = $1
       AND is_used_at IS NULL
     RETURNING *`,
    [ticketId]
  );

  return result.rows[0] || null;
}
