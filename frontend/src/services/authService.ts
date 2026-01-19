import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

interface LoginResponse {
  message: string;
  token: string;
}

interface RegisterResponse {
  token: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>("/login", {
        email,
        password,
      });

      const { token } = response.data;

      await AsyncStorage.setItem("@narvalhando:token", token);

      const user = this.decodeToken(token);
      await AsyncStorage.setItem("@narvalhando:user", JSON.stringify(user));

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Erro ao fazer login. Tente novamente.");
    }
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>("/register", {
        name,
        email,
        password,
      });

      const { token } = response.data;

      await AsyncStorage.setItem("@narvalhando:token", token);

      const user = this.decodeToken(token);
      await AsyncStorage.setItem("@narvalhando:user", JSON.stringify(user));

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Erro ao criar conta. Tente novamente.");
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem("@narvalhando:token");
    await AsyncStorage.removeItem("@narvalhando:user");
  },

  async getUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem("@narvalhando:user");
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem("@narvalhando:token");
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },

  decodeToken(token: string): User {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return { id: 0, name: "", email: "" };
    }
  },
};
