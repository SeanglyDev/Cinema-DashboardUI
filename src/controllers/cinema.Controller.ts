import type { Request, Response } from 'express';
import { fetchAllCinemas, fetchCinemaById, addCinema, editCinema, removeCinema } from '../services/cinema.Service';

export async function getAll(req: Request, res: Response) {
  try {
    const cinemas = await fetchAllCinemas();
    res.json({ success: true, data: cinemas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const cinema = await fetchCinemaById(Number(req.params.id));
    res.json({ success: true, data: cinema });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const cinema = await addCinema(req.body);
    res.status(201).json({ success: true, data: cinema });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const cinema = await editCinema(Number(req.params.id), req.body);
    res.json({ success: true, data: cinema });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await removeCinema(Number(req.params.id));
    res.json({ success: true, message: 'Cinema deleted' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}