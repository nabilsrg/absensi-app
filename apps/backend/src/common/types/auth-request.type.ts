import type { Request } from 'express';

export type AuthUser = {
  userId: number;
  username: string;
  role: string;
  employeeId: number | null;
};

export type AuthRequest = Request & {
  user: AuthUser;
};
