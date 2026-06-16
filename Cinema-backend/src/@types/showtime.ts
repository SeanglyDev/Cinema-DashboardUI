// =====================
// INPUT TYPES
// =====================

export interface CreateShowTimeInput {
  movie_id: number;
  hall_id: number;
  show_date: string; // '2026-05-23'
  show_time: string; // '14:00'
  status?: string;   // 'active' | 'cancelled' | 'completed'
}

export interface UpdateShowTimeInput {
  movie_id?: number;
  hall_id?: number;
  show_date?: string;
  show_time?: string;
  status?: string;
}

// =====================
// DATABASE TYPE
// =====================

export interface ShowTimeFromDB {
  show_time_id: number;
  movie_id: number;
  hall_id: number;
  show_date: Date;
  show_time: string;
  status: string;
  created_at: Date;
}

// =====================
// RESPONSE TYPE (with movie & hall info)
// =====================

export interface ShowTimeDetail {
  show_time_id: number;
  show_date: string;
  show_time: string;
  status: string;
  movie_title: string;
  movie_genre: string;
  movie_duration: number;
  hall_name: string;
  cinema_name: string;
}
