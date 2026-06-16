import type { Request, Response } from 'express';
import type { AuthenticatedUser } from '../@types/auth';
import {
  confirmScannedTicket,
  fetchTicketForScan,
  payBookingAndCreateTicket,
} from '../services/ticket.Service';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export async function payBooking(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const ticket = await payBookingAndCreateTicket(
      Number(req.params.bookingId),
      user.user_id,
      user.role_id,
      req.body
    );

    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    const status = error.message === 'You do not have permission' ? 403 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function scanTicket(req: Request, res: Response): Promise<void> {
  try {
    const ticket = await fetchTicketForScan(Number(req.params.ticketId));

    if (req.accepts('html') && !req.accepts('json')) {
      const seats = ticket.seats.map((seat) => seat.seat_number).join(', ');
      const seatTypes = [...new Set(ticket.seats.map((seat) => seat.seat_type))].join(', ');
      const isConfirmed = ticket.booking_status === 'confirmed';
      const isUsed = Boolean(ticket.is_used_at);

      res.send(`
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Ticket #${ticket.ticket_id}</title>
            <style>
              body { margin: 0; font-family: Arial, sans-serif; background: #1f2024; color: #fff; }
              main { max-width: 560px; margin: 0 auto; padding: 32px 20px; }
              h1 { margin: 0 0 24px; font-size: 32px; }
              dl { display: grid; grid-template-columns: 150px 1fr; gap: 14px 18px; margin: 0 0 28px; }
              dt { color: #fff; }
              dd { margin: 0; color: #b9bbc3; }
              button { width: 100%; padding: 14px 16px; border: 0; border-radius: 6px; background: #e21b2d; color: #fff; font-size: 18px; cursor: pointer; }
              button:disabled { background: #555; cursor: not-allowed; }
              .status { margin: 0 0 20px; color: #b9bbc3; }
            </style>
          </head>
          <body>
            <main>
              <h1>Your Reservation</h1>
              <p class="status">Status: ${ticket.booking_status}${isUsed ? ' / ticket already used' : ''}</p>
              <dl>
                <dt>Booking number</dt><dd>${ticket.booking_id}</dd>
                <dt>Ticket ID</dt><dd>${ticket.ticket_id}</dd>
                <dt>Cinema</dt><dd>${ticket.cinema_name}</dd>
                <dt>Movie</dt><dd>${ticket.movie_title}</dd>
                <dt>Screen Name</dt><dd>${ticket.hall_name}</dd>
                <dt>Seat number</dt><dd>${seatTypes} (${ticket.seats.length}) ${seats}</dd>
                <dt>Date</dt><dd>${ticket.show_date}</dd>
                <dt>Time</dt><dd>${ticket.show_time}</dd>
              </dl>
              <form method="post" action="/api/tickets/${ticket.ticket_id}/confirm">
                <button type="submit" ${isConfirmed || isUsed ? 'disabled' : ''}>
                  ${isConfirmed || isUsed ? 'Ticket Confirmed' : 'Confirm Take Ticket'}
                </button>
              </form>
            </main>
          </body>
        </html>
      `);
      return;
    }

    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function confirmTicket(req: Request, res: Response): Promise<void> {
  try {
    const ticket = await confirmScannedTicket(Number(req.params.ticketId));

    if (req.accepts('html') && !req.accepts('json')) {
      res.redirect(`/api/tickets/${ticket?.ticket_id}/scan`);
      return;
    }

    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
