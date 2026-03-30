import type { UserRole } from '../modules/user/user.model.js';

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
};
