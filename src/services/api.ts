import axios from "axios";

type OnUnauthorized = () => void;

let onUnauthorized: OnUnauthorized | null = null;

const LOCAL_NETWORK_BASE = "http://192.168.15.5:5106/api/v1";

const resolveBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  return LOCAL_NETWORK_BASE;
};

export const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000,
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);
