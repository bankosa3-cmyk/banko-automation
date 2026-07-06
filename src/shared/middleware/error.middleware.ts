import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { logger } from "../logger/logger.js";

export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    logger.warn("Operational error", {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    });

    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  logger.error("Unexpected error", {
    message: error.message,
    stack: error.stack,
  });

  return res.status(500).json({
    message: "Internal server error",
  });
};