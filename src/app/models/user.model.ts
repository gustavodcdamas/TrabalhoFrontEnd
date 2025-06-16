// src/app/models/user.model.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  cpf: string;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isClient: boolean;
  role: UserRole;
  token?: string;
  emailVerified?: boolean;
  accountDisabled?: boolean;
  resetPasswordTokenHash?: string;
  resetPasswordExpires?: Date;
  address?: {
    cep?: string;
    logradouro?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    numero?: string;
    complemento?: string;
  };
}

export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isClient: boolean;
  };
}

// ✅ NOVA INTERFACE para resposta de atualização
export interface UpdateUserResponse {
  message: string;
  user: User;
}