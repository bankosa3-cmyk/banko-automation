import { logger } from "../../shared/logger/logger.js";
import type { ZidWebhookPayload } from "./webhook.validation.js";

export const processZidWebhook = async (payload: ZidWebhookPayload) => {
  logger.info("Processing Zid webhook", {
    event: payload.event,
  });

  if (payload.event !== "order.completed") {
    logger.info("Ignoring unsupported Zid webhook event", {
      event: payload.event,
    });

    return {
      processed: false,
      reason: "unsupported_event",
    };
  }

  return {
    processed: true,
    reason: "order_completed_received",
  };
};