import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use o IP da sua máquina na mesma rede do emulador/dispositivo
// ou 10.0.2.2 para Android Emulator acessar localhost
// Para iOS Simulator use: http://localhost:3000/
const API_URL = "https://l0cdstpd-3000.brs.devtunnels.ms/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@narvalhando:token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("@narvalhando:token");
      await AsyncStorage.removeItem("@narvalhando:user");
    }
    return Promise.reject(error);
  }
);

export { api, API_URL };
