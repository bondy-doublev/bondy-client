export default interface User {
  id: number;
  email: string;
  name?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName?: string;
  avatarUrl?: string;
  gender?: string;
  address?: string;
  password: string;
  phone?: string;
  createdAt: string; // Date in ISO string format
  updatedAt: string; // Date in ISO string format
  isActive: boolean;
  friendCount: number;
}

export interface UserBasic {
  id: number;
  fullName: string;
  avatarUrl: string;
  friendCount: number;
}
