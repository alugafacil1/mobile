import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../../../src/services/api"; 
import { authService } from "../../../src/services/auth/authService"; 
import { User, LoginResponse, AuthContextType } from "../../../src/types/auth"; 

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        const storedUser = await SecureStore.getItemAsync("user");

        if (storedToken && storedUser) {
          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Erro ao carregar storage:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const data = await authService.login(email, password) as LoginResponse;

      if (!data || !data.access_token) {
        throw new Error("Token não fornecido.");
      }

      const userRole = data.roles && data.roles.length > 0 ? data.roles[data.roles.length - 1] : "TENANT";
  
      const userData: User = {
        email: email,
        name: email.split("@")[0],
        role: userRole,
      };

      await SecureStore.setItemAsync("token", data.access_token);
      await SecureStore.setItemAsync("user", JSON.stringify(userData));

      api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;

      setUser(userData);
      setIsAuthenticated(true);

    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signUp(name: string, email: string, phone: string, cpf: string, type: string, password: string) {
    setLoading(true);
    try {
      await authService.signUp(name, email, phone, cpf, type, password);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setUser(null);
    setIsAuthenticated(false);
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    api.defaults.headers.common["Authorization"] = undefined;
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, signUp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}