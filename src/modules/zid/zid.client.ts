import axios from "axios";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/AppError.js";

const getZidCredentials = () => {
  if (!env.ZID_ACCESS_TOKEN || !env.ZID_MANAGER_TOKEN) {
    throw new AppError("Zid API credentials are not configured", 500);
  }

  return {
    authorization: env.ZID_ACCESS_TOKEN,
    managerToken: env.ZID_MANAGER_TOKEN,
  };
};

export const isZidConfigured = () => {
  return Boolean(env.ZID_ACCESS_TOKEN && env.ZID_MANAGER_TOKEN);
};

export const zidHttpClient = axios.create({
  baseURL: env.ZID_API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

zidHttpClient.interceptors.request.use((config) => {
  const credentials = getZidCredentials();

  config.headers.Authorization = credentials.authorization;
  config.headers["X-Manager-Token"] = credentials.managerToken;
  config.headers["Accept-Language"] = "ar";

  return config;
});