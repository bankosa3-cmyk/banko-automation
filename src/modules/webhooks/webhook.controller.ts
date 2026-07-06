import type { Request, Response } from "express";
import { logger } from "../../shared/logger/logger.js";
import { zidWebhookSchema } from "./webhook.validation.js";

export const handleZidWebhook = (req: Request, res: Response) => {
  const result = zidWebhookSchema.safeParse(req.body);

  if (!result.success) {
    logger.warn("Invalid Zid webhook payload", {
      errors: result.error.flatten().fieldErrors,
    });

    return res.status(400).json({
      message: "Invalid webhook payload",
    });
  }

  logger.info("Zid webhook received", {
    event: result.data.event,
  });

  return res.status(200).json({
    received: true,
  });
};