export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
