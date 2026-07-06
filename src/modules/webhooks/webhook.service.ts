import { handleCompletedOrder } from "../orders/order.service.js";
import { parseZidOrderCompletedWebhook } from "../orders/order-webhook.parser.js";
import { logger } from "../../shared/logger/logger.js";
import { webhookRepository } from "./webhook.repository.js";
import type { ZidWebhookPayload } from "./webhook.validation.js";

export const processZidWebhook = async (payload: ZidWebhookPayload) => {
  const webhookEvent = await webhookRepository.createReceivedEvent({
    provider: "zid",
    eventType: payload.event,
    externalEventId: payload.event_id,
    payload,
  });

  logger.info("Processing Zid webhook", {
    event: payload.event,
    webhookEventId: webhookEvent.id,
  });

  if (payload.event !== "order.completed") {
    logger.info("Ignoring unsupported Zid webhook event", {
      event: payload.event,
      webhookEventId: webhookEvent.id,
    });

    await webhookRepository.markIgnored(webhookEvent.id);

    return {
      processed: false,
      reason: "unsupported_event",
    };
  }

  const parsedOrder = parseZidOrderCompletedWebhook(payload.data);
  const completedOrderResult = await handleCompletedOrder(parsedOrder);

  logger.info("Completed order handled", {
    webhookEventId: webhookEvent.id,
    zidOrderId: completedOrderResult.order.zidOrderId,
    zidCustomerId: completedOrderResult.customer.zidCustomerId,
    isFirstCompletedOrder: completedOrderResult.isFirstCompletedOrder,
    completedOrdersCount: completedOrderResult.completedOrdersCount,
  });

  await webhookRepository.markProcessed(webhookEvent.id);

  return {
    processed: true,
    reason: completedOrderResult.isFirstCompletedOrder
      ? "first_completed_order"
      : "not_first_completed_order",
  };
};