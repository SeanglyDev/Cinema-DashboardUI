// =====================
// INPUT TYPES
// =====================

export interface CreateBookingInput {
  user_id: number;
  show_time_id: number;
  seat_ids: number[]; // [1, 2, 3]
}

export interface UpdateBookingInput {
  status: string; // 'pending' | 'confirmed' | 'cancelled'
}

// =====================
// DATABASE TYPES
// =====================

export interface BookingFromDB {
  booking_id: number;
  user_id: number;
  show_time_id: number;
  total_amount: number;
  status: string;
  created_at: Date;
}

export interface BookingSeatFromDB {
  booking_seat_id: number;
  booking_id: number;
  seat_id: number;
  status: string;
}

// =====================
// RESPONSE TYPE (with details)
// =====================

export interface BookingDetail {
  booking_id: number;
  user_id: number;
  show_time_id: number;
  status: string;
  total_amount: number;
  created_at: Date;
  user_name: string;
  user_email: string;
  movie_title: string;
  hall_name: string;
  cinema_name: string;
  show_date: string;
  show_time: string;
  seats: {
    seat_number: string;
    seat_type: string;
    price: number;
  }[];
}
