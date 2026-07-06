import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import { logger } from "../../shared/logger/logger.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { processZidWebhook } from "./webhook.service.js";
import { zidWebhookSchema } from "./webhook.validation.js";

export const handleZidWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const result = zidWebhookSchema.safeParse(req.body);

    if (!result.success) {
      logger.warn("Invalid Zid webhook payload", {
        errors: result.error.flatten().fieldErrors,
      });

      throw new AppError("Invalid webhook payload", 400);
    }

    const processingResult = await processZidWebhook(result.data);

    return res.status(200).json({
      received: true,
      processed: processingResult.processed,
      reason: processingResult.reason,
    });
  },
);