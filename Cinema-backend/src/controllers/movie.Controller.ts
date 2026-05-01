import type { Request, Response } from 'express';
import { fetchAllMovies, fetchMovieById, addMovie, editMovie, removeMovie } from '../services/movie.Service';

// GET /api/movies
export async function getAll(req: Request, res: Response) {
  try {
    const movies = await fetchAllMovies();
    res.json({ success: true, data: movies });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/movies/:id
export async function getById(req: Request, res: Response) {
  try {
    const movie = await fetchMovieById(Number(req.params.id));
    res.json({ success: true, data: movie });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

// POST /api/movies
export async function create(req: Request, res: Response) {
  try {
    const movie = await addMovie(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// PUT /api/movies/:id
export async function update(req: Request, res: Response) {
  try {
    const movie = await editMovie(Number(req.params.id), req.body);
    res.json({ success: true, data: movie });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// DELETE /api/movies/:id
export async function remove(req: Request, res: Response) {
  try {
    await removeMovie(Number(req.params.id));
    res.json({ success: true, message: 'Movie deleted' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}