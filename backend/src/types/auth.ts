import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: 'admin' | 'manager' | 'driver';
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
