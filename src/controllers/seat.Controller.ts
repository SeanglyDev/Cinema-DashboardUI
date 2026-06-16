import type { Request, Response } from 'express';
import { fetchAllSeats, fetchSeatsByHallId, fetchSeatById, addSeat, addBulkSeats, editSeat, removeSeat } from '../services/seat.Service';

// GET /api/seats
export async function getAll(req: Request, res: Response) {
  try {
    const seats = await fetchAllSeats();
    res.json({ success: true, data: seats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/seats/hall/:hallId
export async function getByHallId(req: Request, res: Response) {
  try {
    const seats = await fetchSeatsByHallId(Number(req.params.hallId));
    res.json({ success: true, data: seats });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

// GET /api/seats/:id
export async function getById(req: Request, res: Response) {
  try {
    const seat = await fetchSeatById(Number(req.params.id));
    res.json({ success: true, data: seat });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

// POST /api/seats
export async function create(req: Request, res: Response) {
  try {
    const seat = await addSeat(req.body);
    res.status(201).json({ success: true, data: seat });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// POST /api/seats/bulk
export async function createBulk(req: Request, res: Response) {
  try {
    const seats = await addBulkSeats(req.body);
    res.status(201).json({
      success: true,
      message: `${seats.length} seats created successfully`,
      data: seats,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// PUT /api/seats/:id
export async function update(req: Request, res: Response) {
  try {
    const seat = await editSeat(Number(req.params.id), req.body);
    res.json({ success: true, data: seat });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// DELETE /api/seats/:id
export async function remove(req: Request, res: Response) {
  try {
    await removeSeat(Number(req.params.id));
    res.json({ success: true, message: 'Seat deleted' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}
