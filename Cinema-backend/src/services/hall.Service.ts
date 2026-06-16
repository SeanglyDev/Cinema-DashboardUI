import type { HallFromDB, CreateHallInput, UpdateHallInput } from '../@types/cinema';
import { getAllHalls, getHallsByCinemaId, getHallById, getHallByCinemaIdAndName, createHall, updateHall, deleteHall } from '../models/hallModel';
import { getCinemaById } from '../models/cinemaModel';

export async function fetchAllHalls(): Promise<HallFromDB[]> {
  return await getAllHalls();
}

export async function fetchHallsByCinemaId(cinemaId: number): Promise<HallFromDB[]> {
  return await getHallsByCinemaId(cinemaId);
}

export async function fetchHallById(id: number): Promise<HallFromDB> {
  const hall = await getHallById(id);
  if (!hall) throw new Error('Hall not found');
  return hall;
}

export async function addHall(data: CreateHallInput): Promise<HallFromDB> {
  if (!data.name) throw new Error('Name is required');
  if (!data.capacity) throw new Error('Capacity is required');
  // Check cinema exists
  const cinema = await getCinemaById(data.cinema_id);
  if (!cinema) throw new Error('Cinema not found');
  const existingHall = await getHallByCinemaIdAndName(data.cinema_id, data.name);
  if (existingHall) throw new Error('Hall already exists in this cinema');
  return await createHall(data);
}

export async function editHall(id: number, data: UpdateHallInput): Promise<HallFromDB> {
  const hall = await getHallById(id);
  if (!hall) throw new Error('Hall not found');
  const updated = await updateHall(id, data);
  return updated!;
}

export async function removeHall(id: number): Promise<void> {
  const hall = await getHallById(id);
  if (!hall) throw new Error('Hall not found');
  await deleteHall(id);
}
