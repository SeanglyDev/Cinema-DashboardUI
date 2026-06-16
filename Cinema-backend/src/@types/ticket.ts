export interface CreatePaymentInput {
  method: string;
  transaction_id?: string;
}

export interface PaymentFromDB {
  payment_id: number;
  booking_id: number;
  method: string;
  amount: number;
  status: string;
  paid_at: Date;
  transaction_id: string | null;
}

export interface TicketFromDB {
  ticket_id: number;
  booking_id: number;
  payment_id: number;
  qr_code: string;
  is_used_at: Date | null;
}

export interface TicketDetail {
  ticket_id: number;
  booking_id: number;
  payment_id: number;
  qr_code: string;
  is_used_at: Date | null;
  booking_status: string;
  total_amount: number;
  user_id: number;
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
