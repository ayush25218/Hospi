import type { UserRole } from '../modules/user/user.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        email: string;
        name: string;
      };
    }
  }
}

export {};
