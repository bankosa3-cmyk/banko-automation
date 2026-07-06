import axios from "axios";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/AppError.js";

export const isZidConfigured = () => {
  return Boolean(env.ZID_ACCESS_TOKEN && env.ZID_MANAGER_TOKEN);
};

export const zidHttpClient = axios.create({
  baseURL: env.ZID_API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

zidHttpClient.interceptors.request.use((config) => {
  if (!isZidConfigured()) {
    throw new AppError("Zid API credentials are not configured", 500);
  }

  config.headers.Authorization = `Bearer ${env.ZID_ACCESS_TOKEN}`;
  config.headers["X-Manager-Token"] = env.ZID_MANAGER_TOKEN;

  return config;
});
