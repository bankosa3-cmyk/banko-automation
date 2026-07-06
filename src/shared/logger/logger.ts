import winston from "winston";
import { env } from "../../config/env.js";

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const isProduction = env.NODE_ENV === "production";

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp(),
    errors({ stack: true }),
    isProduction ? json() : simple(),
  ),
  transports: [
    new winston.transports.Console({
      format: isProduction ? json() : combine(colorize(), simple()),
    }),
  ],
});