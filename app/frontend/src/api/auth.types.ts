export interface RegisterRequest {
  registrationNumber: string;
  email: string;
  phoneNumber?: string;
  name: string;
  password?: string;
  role?: string;
  department?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  expectedRoleGroup?: 'student' | 'faculty' | 'coordinator' | 'spoc' | 'admin';
}

export interface ForgotPasswordRequest {
  identity: string;
  channel: 'EMAIL' | 'SMS';
}

export interface ResetPasswordRequest {
  sessionToken: string;
  otp: string;
  newPassword?: string;
}

export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  registrationNumber: string | null;
  accessToken?: string;
}

export interface UserResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  registrationNumber: string | null;
}

export interface SPOCResponse {
  userId: string;
  name: string;
  email: string;
  role: 'SPOC';
  department: string;
}

export interface Department {
  code: string;
  name: string;
  createdAt?: string;
}

export interface SystemConfiguration {
  key: string;
  value: number;
  description?: string;
  updatedAt?: string;
}

export interface ProfileUpdateRequest {
  name: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}
