// =====================
// INPUT TYPES
// =====================

export interface CreateSeatInput {
  hall_id: number;
  seat_number: string;
  seat_type: string; // 'standard' | 'vip' | 'couple'
}

export interface UpdateSeatInput {
  seat_number?: string;
  seat_type?: string;
}

export interface BulkCreateSeatInput {
  hall_id: number;
  seat_type: string;
  capacity: number;
}

// =====================
// DATABASE TYPE
// =====================

export interface SeatFromDB {
  seat_id: number;
  hall_id: number;
  seat_number: string;
  seat_type: string;
}
