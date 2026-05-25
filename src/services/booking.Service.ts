import type { BookingFromDB, CreateBookingInput, UpdateBookingInput } from '../@types/booking';
import {
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  createBooking,
  createBookingSeats,
  updateBookingStatus,
  deleteBooking,
  checkSeatsAvailable,
} from '../models/bookingModel';
import { getShowTimeById } from '../models/showTimeModel';
import pool from '../config/db';

// Get all bookings
export async function fetchAllBookings() {
  return await getAllBookings();
}

// Get booking by id
export async function fetchBookingById(id: number) {
  const booking = await getBookingById(id);
  if (!booking) throw new Error('Booking not found');
  return booking;
}

// Get bookings by user
export async function fetchBookingsByUserId(userId: number) {
  return await getBookingsByUserId(userId);
}

// Create booking
export async function addBooking(data: CreateBookingInput) {
  if (!data.user_id) throw new Error('User ID is required');
  if (!data.show_time_id) throw new Error('Show time ID is required');
  if (!Array.isArray(data.seat_ids) || data.seat_ids.length === 0) {
    throw new Error('Please select at least one seat');
  }

  if (data.seat_ids.length > 10) {
    throw new Error('You can book a maximum of 10 seats at one time');
  }

  const uniqueSeatIds = new Set(data.seat_ids);
  if (uniqueSeatIds.size !== data.seat_ids.length) {
    throw new Error('Duplicate seats are not allowed');
  }

  if (data.seat_ids.some((seatId) => !Number.isInteger(seatId) || seatId <= 0)) {
    throw new Error('Seat IDs must be valid numbers');
  }

  // Check show time exists
  const showTime = await getShowTimeById(data.show_time_id);
  if (!showTime) throw new Error('Show time not found');

  if (showTime.status !== 'active') {
    throw new Error('Cannot book this show time');
  }

  const showDate = showTime.show_date instanceof Date
    ? showTime.show_date.toISOString().slice(0, 10)
    : String(showTime.show_date).slice(0, 10);
  const showDateTime = new Date(`${showDate}T${showTime.show_time}`);

  if (showDateTime.getTime() <= Date.now()) {
    throw new Error('Cannot book a show time in the past');
  }

  const seatsResult = await pool.query(
    'SELECT seat_id, hall_id, seat_type FROM seats WHERE seat_id = ANY($1)',
    [data.seat_ids]
  );

  if (seatsResult.rows.length !== data.seat_ids.length) {
    throw new Error('One or more seats were not found');
  }

  const invalidHallSeat = seatsResult.rows.find((seat) => seat.hall_id !== showTime.hall_id);
  if (invalidHallSeat) {
    throw new Error('One or more seats do not belong to this show time hall');
  }

  // Check seats available
  const available = await checkSeatsAvailable(data.show_time_id, data.seat_ids);
  if (!available) throw new Error('One or more seats are already booked for this showtime');

  // Calculate total amount from ticket_prices
  const priceResult = await pool.query(`
    SELECT SUM(tp.price) AS total, COUNT(tp.price) AS price_count
    FROM seats s
    JOIN ticket_prices tp ON tp.show_time_id = $1
      AND tp.seat_type = s.seat_type
    WHERE s.seat_id = ANY($2)
  `, [data.show_time_id, data.seat_ids]);

  const totalAmount = priceResult.rows[0].total || 0;
  const priceCount = Number(priceResult.rows[0].price_count || 0);

  if (priceCount !== data.seat_ids.length) {
    throw new Error('Ticket price is not configured for one or more selected seats');
  }

  // Create booking
  const booking = await createBooking(data.user_id, data.show_time_id, totalAmount);

  // Create booking seats
  await createBookingSeats(booking.booking_id, data.seat_ids);

  return booking;
}

// Update booking status
export async function editBookingStatus(id: number, data: UpdateBookingInput) {
  const booking = await getBookingById(id);
  if (!booking) throw new Error('Booking not found');

  const allowedStatuses = ['pending', 'confirmed', 'cancelled'];
  if (!data.status || !allowedStatuses.includes(data.status)) {
    throw new Error('Invalid booking status');
  }

  const updated = await updateBookingStatus(id, data.status);
  return updated;
}

// Delete booking
export async function removeBooking(id: number) {
  const booking = await getBookingById(id);
  if (!booking) throw new Error('Booking not found');
  await deleteBooking(id);
}
