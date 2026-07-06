import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { env } from "../../config/env.js";
import { logger } from "../../shared/logger/logger.js";

const getWebhookSignature = (req: Request) => {
  return req.header("x-zid-signature");
};

export const verifyZidWebhookSignature = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!env.ZID_WEBHOOK_SECRET) {
    logger.warn("ZID_WEBHOOK_SECRET is not configured; skipping webhook signature verification");
    return next();
  }

  const signature = getWebhookSignature(req);

  if (!signature) {
    return res.status(401).json({
      message: "Missing webhook signature",
    });
  }

  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", env.ZID_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

const signatureBuffer = Buffer.from(signature);
const expectedSignatureBuffer = Buffer.from(expectedSignature);

if (signatureBuffer.length !== expectedSignatureBuffer.length) {
  return res.status(401).json({
    message: "Invalid webhook signature",
  });
}

const isValid = crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);

  if (!isValid) {
    return res.status(401).json({
      message: "Invalid webhook signature",
    });
  }

  return next();
};