export interface User {
  id?: string | number;
  name: string;
  email: string;
  role: string;
  user_id: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  roles: string[];
  user_id: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, phone: string, cpf: string, type: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}