import type { Request, Response } from 'express';
import { fetchAllHalls, fetchHallsByCinemaId, fetchHallById, addHall, editHall, removeHall } from '../services/hall.Service';

export async function getAll(req: Request, res: Response) {
  try {
    const halls = await fetchAllHalls();
    res.json({ success: true, data: halls });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getByCinemaId(req: Request, res: Response) {
  try {
    const halls = await fetchHallsByCinemaId(Number(req.params.cinemaId));
    res.json({ success: true, data: halls });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const hall = await fetchHallById(Number(req.params.id));
    res.json({ success: true, data: hall });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const hall = await addHall(req.body);
    res.status(201).json({ success: true, data: hall });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const hall = await editHall(Number(req.params.id), req.body);
    res.json({ success: true, data: hall });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await removeHall(Number(req.params.id));
    res.json({ success: true, message: 'Hall deleted' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}