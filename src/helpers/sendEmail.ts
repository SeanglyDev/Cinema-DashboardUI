import nodemailer from 'nodemailer';
import type { TicketDetail } from '../@types/ticket';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string, purpose = 'login') {
  if (!to) {
    throw new Error('OTP email recipient is not configured');
  }

  const actionText = purpose === 'reset-password' ? 'reset your password' : 'login';

  const info = await transporter.sendMail({
    from: `"CinemaAdmin" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your OTP Code</h2>
        <p>Use this code to ${actionText}:</p>
        <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in <b>5 minutes</b>.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  if (info.rejected.length > 0) {
    throw new Error(`OTP email was rejected for: ${info.rejected.join(', ')}`);
  }

  console.log(`OTP email sent to ${to}. Accepted: ${info.accepted.join(', ')}`);
}

function escapeHtml(value: string | number | Date | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendTicketEmail(ticket: TicketDetail, qrImage: Buffer) {
  if (!ticket.user_email) {
    throw new Error('Ticket email recipient is not configured');
  }

  const seatNumbers = ticket.seats.map((seat) => seat.seat_number).join(', ');
  const seatTypes = [...new Set(ticket.seats.map((seat) => seat.seat_type))].join(', ');

  const info = await transporter.sendMail({
    from: `"Legend Cinema" <${process.env.EMAIL_USER}>`,
    to: ticket.user_email,
    subject: `Your Reservation #${ticket.booking_id}`,
    html: `
      <div style="background:#1f2024;color:#ffffff;font-family:Arial,sans-serif;padding:32px;max-width:640px;margin:0 auto;">
        <h1 style="margin:0 0 28px;font-size:34px;">Your Reservation</h1>
        <p style="font-size:18px;margin:0 0 24px;">Hello ${escapeHtml(ticket.user_name)},</p>
        <p style="font-size:18px;line-height:1.45;margin:0 0 32px;">
          Thank you for choosing <b>Legend Cinema</b>!<br>
          Your reservation details are listed below. Enjoy the movie!
        </p>
        <div style="text-align:center;background:#ffffff;padding:24px;margin-bottom:32px;">
          <img src="cid:ticket-qr" alt="Ticket QR Code" style="width:260px;height:260px;display:block;margin:0 auto;">
        </div>
        <table style="width:100%;font-size:18px;line-height:1.5;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#ffffff;">Booking number:</td><td style="padding:8px 0;color:#b9bbc3;">${ticket.booking_id}</td></tr>
          <tr><td style="padding:8px 0;color:#ffffff;">Ticket ID:</td><td style="padding:8px 0;color:#b9bbc3;">${ticket.ticket_id}</td></tr>
          <tr><td style="padding:8px 0;color:#ffffff;">Cinema:</td><td style="padding:8px 0;color:#b9bbc3;">${escapeHtml(ticket.cinema_name)}</td></tr>
          <tr><td style="padding:8px 0;color:#ffffff;">Movie:</td><td style="padding:8px 0;color:#b9bbc3;">${escapeHtml(ticket.movie_title)}</td></tr>
          <tr><td style="padding:8px 0;color:#ffffff;">Screen Name:</td><td style="padding:8px 0;color:#b9bbc3;">${escapeHtml(ticket.hall_name)}</td></tr>
          <tr><td style="padding:8px 0;color:#ffffff;">Seat number:</td><td style="padding:8px 0;color:#b9bbc3;">${escapeHtml(seatTypes)} (${ticket.seats.length}) ${escapeHtml(seatNumbers)}</td></tr>
          <tr><td style="padding:8px 0;color:#ffffff;">Date:</td><td style="padding:8px 0;color:#b9bbc3;">${escapeHtml(ticket.show_date)}</td></tr>
          <tr><td style="padding:8px 0;color:#ffffff;">Time:</td><td style="padding:8px 0;color:#b9bbc3;">${escapeHtml(ticket.show_time)}</td></tr>
        </table>
      </div>
    `,
    attachments: [
      {
        filename: `ticket-${ticket.ticket_id}-qr.png`,
        content: qrImage,
        cid: 'ticket-qr',
      },
    ],
  });

  if (info.rejected.length > 0) {
    throw new Error(`Ticket email was rejected for: ${info.rejected.join(', ')}`);
  }

  console.log(`Ticket email sent to ${ticket.user_email}. Accepted: ${info.accepted.join(', ')}`);
}
