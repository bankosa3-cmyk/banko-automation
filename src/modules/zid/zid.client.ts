import axios from "axios";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/AppError.js";
import { prisma } from "../../shared/database/prisma.js";

const getZidCredentials = async () => {
  const storeId = env.ZID_STORE_ID;

  if (!storeId) {
    throw new AppError("Zid store id is not configured", 500);
  }

  const token = await prisma.zidStoreToken.findUnique({
    where: {
      storeId,
    },
  });

  if (!token) {
    throw new AppError("Zid OAuth tokens are not configured", 500);
  }

  return {
    authorization: token.authorizationToken,
    managerToken: token.managerToken,
  };
};

export const isZidConfigured = async () => {
  if (!env.ZID_STORE_ID) {
    return false;
  }

  const token = await prisma.zidStoreToken.findUnique({
    where: {
      storeId: env.ZID_STORE_ID,
    },
  });

  return Boolean(token);
};

export const zidHttpClient = axios.create({
  baseURL: env.ZID_API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

zidHttpClient.interceptors.request.use(async (config) => {
  const credentials = await getZidCredentials();

config.headers.Authorization = credentials.authorization.startsWith("Bearer ")
  ? credentials.authorization
  : `Bearer ${credentials.authorization}`;
  config.headers["X-Manager-Token"] = credentials.managerToken;
  config.headers["Accept-Language"] = "ar";

  return config;
});