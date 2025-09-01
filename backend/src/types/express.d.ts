import 'express';

export {};

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      username: string;
      role?: string;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}
