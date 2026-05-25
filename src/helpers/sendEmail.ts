import nodemailer from 'nodemailer';

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
