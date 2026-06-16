import type { SeatFromDB, CreateSeatInput, UpdateSeatInput, BulkCreateSeatInput } from '../@types/seat';
import { getAllSeats, getSeatsByHallId, getSeatById, getSeatByHallAndNumber, createSeat, createSeats, updateSeat, deleteSeat } from '../models/seatModel';
import { getHallById } from '../models/hallModel';

// Get all seats
export async function fetchAllSeats(): Promise<SeatFromDB[]> {
  return await getAllSeats();
}

// Get seats by hall id
export async function fetchSeatsByHallId(hallId: number): Promise<SeatFromDB[]> {
  // Check hall exists
  const hall = await getHallById(hallId);
  if (!hall) throw new Error('Hall not found');
  return await getSeatsByHallId(hallId);
}

// Get seat by id
export async function fetchSeatById(id: number): Promise<SeatFromDB> {
  const seat = await getSeatById(id);
  if (!seat) throw new Error('Seat not found');
  return seat;
}

// Create seat
export async function addSeat(data: CreateSeatInput): Promise<SeatFromDB> {
  if (!data.hall_id) throw new Error('Hall ID is required');
  if (!data.seat_number) throw new Error('Seat number is required');
  if (!data.seat_type) throw new Error('Seat type is required');

  data.seat_number = data.seat_number.trim();
  if (!data.seat_number) throw new Error('Seat number is required');

  // Check hall exists
  const hall = await getHallById(data.hall_id);
  if (!hall) throw new Error('Hall not found');

  const existingSeat = await getSeatByHallAndNumber(data.hall_id, data.seat_number);
  if (existingSeat) throw new Error('Seat number already exists in this hall');

  return await createSeat(data);
}

// Create seats by capacity
export async function addBulkSeats(data: BulkCreateSeatInput): Promise<SeatFromDB[]> {
  if (!data.hall_id) throw new Error('Hall ID is required');
  if (!data.seat_type) throw new Error('Seat type is required');
  if (!Number.isInteger(data.capacity) || data.capacity <= 0) throw new Error('Capacity must be a positive number');

  const hall = await getHallById(data.hall_id);
  if (!hall) throw new Error('Hall not found');

  const seatType = data.seat_type.trim();
  if (!seatType) throw new Error('Seat type is required');

  const seats: CreateSeatInput[] = [];

  const seatsPerRow = 10;

  for (let seatIndex = 0; seatIndex < data.capacity; seatIndex++) {
    const rowIndex = Math.floor(seatIndex / seatsPerRow);
    if (rowIndex >= 26) throw new Error('Capacity is too large. Maximum supported capacity is 260 seats');

    const rowName = String.fromCharCode(65 + rowIndex);
    const seatNumber = `${rowName}${(seatIndex % seatsPerRow) + 1}`;
    const duplicateSeat = await getSeatByHallAndNumber(data.hall_id, seatNumber);
    if (duplicateSeat) throw new Error(`Seat number ${seatNumber} already exists in this hall`);

    seats.push({
      hall_id: data.hall_id,
      seat_number: seatNumber,
      seat_type: seatType,
    });
  }

  return await createSeats(seats);
}

// Update seat
export async function editSeat(id: number, data: UpdateSeatInput): Promise<SeatFromDB> {
  const seat = await getSeatById(id);
  if (!seat) throw new Error('Seat not found');

  if (data.seat_number) {
    const seatNumber = data.seat_number.trim();
    if (!seatNumber) throw new Error('Seat number is required');

    const existingSeat = await getSeatByHallAndNumber(seat.hall_id, seatNumber);
    if (existingSeat && existingSeat.seat_id !== id) {
      throw new Error('Seat number already exists in this hall');
    }
    data.seat_number = seatNumber;
  }

  const updated = await updateSeat(id, data);
  return updated!;
}

// Delete seat
export async function removeSeat(id: number): Promise<void> {
  const seat = await getSeatById(id);
  if (!seat) throw new Error('Seat not found');
  await deleteSeat(id);
}
