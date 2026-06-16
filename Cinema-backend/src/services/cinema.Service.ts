import type { CinemaFromDB, CreateCinemaInput, UpdateCinemaInput } from '../@types/cinema';
import { getAllCinemas, getCinemaById, getCinemaByName, createCinema, updateCinema, deleteCinema } from '../models/cinemaModel';

export async function fetchAllCinemas(): Promise<CinemaFromDB[]> {
  return await getAllCinemas();
}

export async function fetchCinemaById(id: number): Promise<CinemaFromDB> {
  const cinema = await getCinemaById(id);
  if (!cinema) throw new Error('Cinema not found');
  return cinema;
}

export async function addCinema(data: CreateCinemaInput): Promise<CinemaFromDB> {
  if (!data.name) throw new Error('Name is required');
  const existingCinema = await getCinemaByName(data.name);
  if (existingCinema) throw new Error('Cinema already exists');
  return await createCinema(data);
}

export async function editCinema(id: number, data: UpdateCinemaInput): Promise<CinemaFromDB> {
  const cinema = await getCinemaById(id);
  if (!cinema) throw new Error('Cinema not found');
  const updated = await updateCinema(id, data);
  return updated!;
}

export async function removeCinema(id: number): Promise<void> {
  const cinema = await getCinemaById(id);
  if (!cinema) throw new Error('Cinema not found');
  await deleteCinema(id);
}
