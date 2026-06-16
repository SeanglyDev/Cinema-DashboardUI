import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { sendOtpEmail } from '../helpers/sendEmail';
import type {
  RegisterInput,
  LoginInput,
  LoginResult,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UserFromDB,
} from '../@types/auth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpRegex = /^\d{6}$/;
const minPasswordLength = 6;

function normalizeEmail(email: string | undefined): string {
  if (!email) throw new Error('Email is required');

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Email is required');
  if (!emailRegex.test(normalizedEmail)) throw new Error('Email is invalid');

  return normalizedEmail;
}

function validatePassword(password: string | undefined, fieldName = 'Password'): string {
  if (!password) throw new Error(`${fieldName} is required`);
  if (password.length < minPasswordLength) {
    throw new Error(`${fieldName} must be at least ${minPasswordLength} characters`);
  }

  return password;
}

function validateOtp(otpCode: string | undefined): string {
  if (!otpCode) throw new Error('OTP code is required');

  const normalizedOtp = otpCode.trim();
  if (!otpRegex.test(normalizedOtp)) throw new Error('OTP code must be 6 digits');

  return normalizedOtp;
}

// =====================
// REGISTER
// =====================
export async function register(data: RegisterInput): Promise<string> {
  if (!data.name) throw new Error('Name is required');

  const name = data.name.trim();
  if (!name) throw new Error('Name is required');

  const email = normalizeEmail(data.email);
  const password = validatePassword(data.password);
  const profileUser = data.profile_user?.trim() || null;

  // 1. Check email already exists
  const existing = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  if (existing.rows[0]) throw new Error('Email already exists');

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Default role = customer (role_id = 2)
  const defaultRoleId = 2;

  // 4. Save user to DB
  await pool.query(
    `INSERT INTO users (role_id, name, email, password_hash, profile_user, is_active)
     VALUES ($1, $2, $3, $4, $5, true)`,
    [defaultRoleId, name, email, hashedPassword, profileUser]
  );

  return 'Register successful! Please login.';
}

// =====================
// LOGIN - Step 1
// =====================
export async function login(data: LoginInput): Promise<LoginResult> {
  const email = normalizeEmail(data.email);
  if (!data.password) throw new Error('Password is required');

  // 1. Check user exists
  const result = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  const user: UserFromDB = result.rows[0];
  if (!user) throw new Error('Email not found');

  // 2. Check account is active
  if (!user.is_active) throw new Error('Account is not active');

  // 3. Check password
  const isMatch = await bcrypt.compare(data.password, user.password_hash);
  if (!isMatch) throw new Error('Wrong password');

  // 4. Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 5. Expire time = 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 6. Save OTP to DB
  await pool.query(
    `INSERT INTO otp_token (user_id, otp_code, expires_at, is_used)
     VALUES ($1, $2, $3, false)`,
    [user.user_id, otpCode, expiresAt]
  );

  // 7. Send OTP based on role
  let sendToEmail = user.email; // default = customer → send to self

  if (user.role_id === 1) {
    // Admin → send to admin email from .env
    sendToEmail = process.env.ADMIN_EMAIL as string;
  } else if (user.role_id === 3) {
    // Staff → send to staff email from .env
    sendToEmail = process.env.STAFF_EMAIL as string; 
  }

  try {
    await sendOtpEmail(sendToEmail, otpCode);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    console.warn(`OTP email failed. Development OTP for ${email}: ${otpCode}`, error);
    return {
      message: 'OTP email failed locally. Use the development OTP shown on the verification page.',
      dev_otp: otpCode,
    };
  }

  return { message: 'OTP sent to your email' };
}

// =====================
// VERIFY OTP - Step 2
// =====================
export async function verifyOtp(data: VerifyOtpInput): Promise<string> {
  const email = normalizeEmail(data.email);
  const otpCode = validateOtp(data.otp_code);

  // 1. Get user
  const userResult = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  const user: UserFromDB = userResult.rows[0];
  if (!user) throw new Error('User not found');

  // 2. Get OTP from DB
  const otpResult = await pool.query(
    `SELECT * FROM otp_token
     WHERE user_id = $1 AND otp_code = $2 AND is_used = false
     ORDER BY created_at DESC LIMIT 1`,
    [user.user_id, otpCode]
  );
  const otp = otpResult.rows[0];
  if (!otp) throw new Error('Invalid OTP code');

  // 3. Check expired
  if (new Date() > otp.expires_at) throw new Error('OTP code has expired');

  // 4. Mark OTP as used
  await pool.query(
    'UPDATE otp_token SET is_used = true WHERE otp_id = $1',
    [otp.otp_id]
  );

  // 5. Generate JWT token
  const token = jwt.sign(
    { user_id: user.user_id, role_id: user.role_id },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  );

  return token;
}

// =====================
// FORGOT PASSWORD - Step 1
// =====================
export async function forgotPassword(data: ForgotPasswordInput): Promise<string> {
  const email = normalizeEmail(data.email);

  const result = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  const user: UserFromDB = result.rows[0];
  if (!user) throw new Error('Email not found');
  if (!user.is_active) throw new Error('Account is not active');

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await pool.query(
    `INSERT INTO otp_token (user_id, otp_code, expires_at, is_used)
     VALUES ($1, $2, $3, false)`,
    [user.user_id, otpCode, expiresAt]
  );

  await sendOtpEmail(user.email, otpCode, 'reset-password');

  return 'Password reset OTP sent to your email';
}

// =====================
// RESET PASSWORD - Step 2
// =====================
export async function resetPassword(data: ResetPasswordInput): Promise<string> {
  const email = normalizeEmail(data.email);
  const otpCode = validateOtp(data.otp_code);
  const newPassword = validatePassword(data.new_password, 'New password');

  const userResult = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  const user: UserFromDB = userResult.rows[0];
  if (!user) throw new Error('User not found');
  if (!user.is_active) throw new Error('Account is not active');

  const otpResult = await pool.query(
    `SELECT * FROM otp_token
     WHERE user_id = $1 AND otp_code = $2 AND is_used = false
     ORDER BY created_at DESC LIMIT 1`,
    [user.user_id, otpCode]
  );
  const otp = otpResult.rows[0];
  if (!otp) throw new Error('Invalid OTP code');
  if (new Date() > otp.expires_at) throw new Error('OTP code has expired');

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    'UPDATE users SET password_hash = $1 WHERE user_id = $2',
    [hashedPassword, user.user_id]
  );

  await pool.query(
    'UPDATE otp_token SET is_used = true WHERE otp_id = $1',
    [otp.otp_id]
  );

  return 'Password reset successful. Please login with your new password.';
}
