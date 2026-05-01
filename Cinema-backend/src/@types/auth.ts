export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  profile_user?: string;
  is_active? : true;    
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyOtpInput {
  email: string;
  otp_code: string;
}

export interface UserFromDB {
  user_id: number;
  role_id: number;
  name: string;
  email: string;
  password_hash: string;
  is_active: boolean;
}

export interface AuthenticatedUser {
  user_id: number;
  role_id: number;
}
