import axios from "axios";

type OnUnauthorized = () => void;

let onUnauthorized: OnUnauthorized | null = null;

// Seu IP local — mantém como fallback:
const LOCAL_NETWORK_BASE = "http://192.168.15.5:5106/api/v1";

// Função que decide qual URL usar:
const resolveBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  return LOCAL_NETWORK_BASE;
};

// Instância Axios configurada:
export const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 60000, // 60s — necessário para Gemini
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Auth token padrão
export const setApiAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const setOnUnauthorized = (callback: OnUnauthorized | null) => {
  onUnauthorized = callback;
};

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Expirou login
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    // Log bonitinho para debug
    console.log("API ERROR:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);
