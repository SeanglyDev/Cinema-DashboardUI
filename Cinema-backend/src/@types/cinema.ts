export interface CreateCinemaInput {
  name: string;
  location?: string;
  contact?: string;
}

export interface UpdateCinemaInput {
  name?: string;
  location?: string;
  contact?: string;
}

export interface CinemaFromDB {
  cinema_id: number;
  name: string;
  location: string | null;
  contact: string | null;
  created_at: Date;
}
export interface CreateHallInput {
  cinema_id: number;
  name: string;
  capacity: number;
}

export interface UpdateHallInput {
  name?: string;
  capacity?: number;
}

export interface HallFromDB {
  hall_id: number;
  cinema_id: number;
  name: string;
  capacity: number;
  created_at: Date;
}