import type { RequestHandler } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../errors/AppError.js";

export const apiKeyMiddleware: RequestHandler = (req, _res, next) => {
  if (!env.INTERNAL_API_KEY) {
    return next(new AppError("Internal API key is not configured", 500));
  }

  const apiKey = req.header("x-api-key");

  if (apiKey !== env.INTERNAL_API_KEY) {
    return next(new AppError("Invalid API key", 401));
  }

  return next();
};

export const requireApiKey = apiKeyMiddleware;