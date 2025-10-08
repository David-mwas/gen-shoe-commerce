import { createContext } from "react";

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  address?: any;
  is_admin?: boolean;
}

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
