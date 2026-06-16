import type { Request, Response } from 'express';
import { fetchAllShowTimes, fetchShowTimesByMovieId, fetchShowTimeById, addShowTime, editShowTime, removeShowTime } from '../services/showTime.Service';

// GET /api/showtimes
export async function getAll(req: Request, res: Response) {
  try {
    const showTimes = await fetchAllShowTimes();
    res.json({ success: true, data: showTimes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/showtimes/movie/:movieId
export async function getByMovieId(req: Request, res: Response) {
  try {
    const showTimes = await fetchShowTimesByMovieId(Number(req.params.movieId));
    res.json({ success: true, data: showTimes });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

// GET /api/showtimes/:id
export async function getById(req: Request, res: Response) {
  try {
    const showTime = await fetchShowTimeById(Number(req.params.id));
    res.json({ success: true, data: showTime });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

// POST /api/showtimes
export async function create(req: Request, res: Response) {
  try {
    const showTime = await addShowTime(req.body);
    res.status(201).json({ success: true, data: showTime });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// PUT /api/showtimes/:id
export async function update(req: Request, res: Response) {
  try {
    const showTime = await editShowTime(Number(req.params.id), req.body);
    res.json({ success: true, data: showTime });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// DELETE /api/showtimes/:id
export async function remove(req: Request, res: Response) {
  try {
    await removeShowTime(Number(req.params.id));
    res.json({ success: true, message: 'Show time deleted' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}