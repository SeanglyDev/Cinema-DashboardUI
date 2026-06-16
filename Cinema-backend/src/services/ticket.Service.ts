import QRCode from 'qrcode';
import pool from '../config/db';
import type { CreatePaymentInput } from '../@types/ticket';
import { sendTicketEmail } from '../helpers/sendEmail';
import { getBookingById, updateBookingStatus } from '../models/bookingModel';
import {
  confirmTicketUsed,
  createPaidPayment,
  createTicket,
  getTicketByBookingId,
  getTicketDetail,
  updateTicketQrCode,
} from '../models/ticketModel';

const baseUrl = process.env.APP_URL || 'http://localhost:3000';

export async function payBookingAndCreateTicket(
  bookingId: number,
  userId: number,
  roleId: number,
  data: CreatePaymentInput
) {
  if (!data.method?.trim()) throw new Error('Payment method is required');

  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error('Booking not found');

  if (roleId !== 1 && booking.user_id !== userId) {
    throw new Error('You do not have permission');
  }

  if (booking.status === 'cancelled') {
    throw new Error('Cannot pay cancelled booking');
  }

  const existingTicket = await getTicketByBookingId(bookingId);
  if (existingTicket) {
    const ticketDetail = await getTicketDetail(existingTicket.ticket_id);
    return ticketDetail;
  }

  const payment = await createPaidPayment(
    bookingId,
    data.method.trim(),
    booking.total_amount,
    data.transaction_id?.trim() || null
  );

  const ticket = await createTicket(bookingId, payment.payment_id, '');
  const scanUrl = `${baseUrl}/api/tickets/${ticket.ticket_id}/scan`;
  const qrCode = await QRCode.toDataURL(scanUrl);
  const qrImage = await QRCode.toBuffer(scanUrl);
  await updateTicketQrCode(ticket.ticket_id, qrCode);

  const ticketDetail = await getTicketDetail(ticket.ticket_id);
  if (!ticketDetail) throw new Error('Ticket not found');

  await sendTicketEmail(ticketDetail, qrImage);

  return ticketDetail;
}

export async function fetchTicketForScan(ticketId: number) {
  const ticket = await getTicketDetail(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  return ticket;
}

export async function confirmScannedTicket(ticketId: number) {
  const ticket = await getTicketDetail(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  if (ticket.is_used_at) throw new Error('Ticket already used');

  await confirmTicketUsed(ticketId);
  await updateBookingStatus(ticket.booking_id, 'confirmed');

  return await getTicketDetail(ticketId);
}
