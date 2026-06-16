import type { ShowTimeFromDB, CreateShowTimeInput, UpdateShowTimeInput, ShowTimeDetail } from '../@types/showtime';
import { getAllShowTimes, getShowTimesByMovieId, getShowTimeById, getShowTimeDetailById, getShowTimeByHallDateAndTime, createShowTime, updateShowTime, deleteShowTime } from '../models/showTimeModel';
import { getMovieById } from '../models/movieModel';
import { getHallById } from '../models/hallModel';

// Get all show times
export async function fetchAllShowTimes(): Promise<ShowTimeDetail[]> {
  return await getAllShowTimes();
}

// Get show times by movie id
export async function fetchShowTimesByMovieId(movieId: number): Promise<ShowTimeDetail[]> {
  const movie = await getMovieById(movieId);
  if (!movie) throw new Error('Movie not found');
  return await getShowTimesByMovieId(movieId);
}

// Get show time by id
export async function fetchShowTimeById(id: number): Promise<ShowTimeFromDB> {
  const showTime = await getShowTimeById(id);
  if (!showTime) throw new Error('Show time not found');
  return showTime;
}

// Create show time
export async function addShowTime(data: CreateShowTimeInput): Promise<ShowTimeDetail> {
  if (!data.movie_id) throw new Error('Movie ID is required');
  if (!data.hall_id) throw new Error('Hall ID is required');
  if (!data.show_date) throw new Error('Show date is required');
  if (!data.show_time) throw new Error('Show time is required');

  // Check movie exists
  const movie = await getMovieById(data.movie_id);
  if (!movie) throw new Error('Movie not found');

  // Check hall exists
  const hall = await getHallById(data.hall_id);
  if (!hall) throw new Error('Hall not found');

  const existingShowTime = await getShowTimeByHallDateAndTime(
    data.hall_id,
    data.show_date,
    data.show_time
  );
  if (existingShowTime) {
    throw new Error('Show time already exists for this hall, date, and time');
  }

  const created = await createShowTime(data);
  const detail = await getShowTimeDetailById(created.show_time_id);
  return detail!;
}

// Update show time
export async function editShowTime(id: number, data: UpdateShowTimeInput): Promise<ShowTimeDetail> {
  const showTime = await getShowTimeById(id);
  if (!showTime) throw new Error('Show time not found');

  if (data.movie_id) {
    const movie = await getMovieById(data.movie_id);
    if (!movie) throw new Error('Movie not found');
  }

  if (data.hall_id) {
    const hall = await getHallById(data.hall_id);
    if (!hall) throw new Error('Hall not found');
  }

  const hallId = data.hall_id ?? showTime.hall_id;
  const showDate = data.show_date ?? showTime.show_date;
  const showTimeValue = data.show_time ?? showTime.show_time;
  const existingShowTime = await getShowTimeByHallDateAndTime(hallId, showDate, showTimeValue);

  if (existingShowTime && existingShowTime.show_time_id !== id) {
    throw new Error('Show time already exists for this hall, date, and time');
  }

  await updateShowTime(id, data);
  const detail = await getShowTimeDetailById(id);
  return detail!;
}

// Delete show time
export async function removeShowTime(id: number): Promise<void> {
  const showTime = await getShowTimeById(id);
  if (!showTime) throw new Error('Show time not found');
  await deleteShowTime(id);
}
