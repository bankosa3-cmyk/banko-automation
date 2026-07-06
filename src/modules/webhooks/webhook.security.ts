import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/AppError.js";
import { logger } from "../../shared/logger/logger.js";

const getWebhookSignature = (req: Request) => {
  return req.header("x-zid-signature");
};

export const verifyZidWebhookSignature = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!env.ZID_WEBHOOK_SECRET) {
    logger.warn("ZID_WEBHOOK_SECRET is not configured; skipping webhook signature verification");
    return next();
  }

  const signature = getWebhookSignature(req);

  if (!signature) {
    return next(new AppError("Missing webhook signature", 401));
  }

  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", env.ZID_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return next(new AppError("Invalid webhook signature", 401));
  }

  const isValid = crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);

  if (!isValid) {
    return next(new AppError("Invalid webhook signature", 401));
  }

  return next();
};