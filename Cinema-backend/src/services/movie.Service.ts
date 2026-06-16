import type { CreateMovieInput, UpdateMovieInput, MovieFromDB } from '../@types/movie';
import { getAllMovies, getMovieById, getMovieByTitle, createMovie, updateMovie, deleteMovie } from '../models/movieModel';

// Get all movies
export async function fetchAllMovies(): Promise<MovieFromDB[]> {
  return await getAllMovies();
}

// Get movie by id
export async function fetchMovieById(id: number): Promise<MovieFromDB> {
  const movie = await getMovieById(id);
  if (!movie) throw new Error('Movie not found');
  return movie;
}

// Create movie
export async function addMovie(data: CreateMovieInput): Promise<MovieFromDB> {
  if (!data.title) throw new Error('Title is required');
  const existingMovie = await getMovieByTitle(data.title);
  if (existingMovie) throw new Error('Movie already exists');
  return await createMovie(data);
}

// Update movie
export async function editMovie(id: number, data: UpdateMovieInput): Promise<MovieFromDB> {
  const movie = await getMovieById(id);
  if (!movie) throw new Error('Movie not found');
  const updated = await updateMovie(id, data);
  return updated!;
}

// Delete movie
export async function removeMovie(id: number): Promise<void> {
  const movie = await getMovieById(id);
  if (!movie) throw new Error('Movie not found');
  await deleteMovie(id);
}
