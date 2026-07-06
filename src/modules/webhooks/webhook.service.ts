import { createCouponForRewardIfNeeded } from "../coupons/coupon.service.js";
import { queueCouponNotification } from "../notifications/notification.service.js";
import { handleCompletedOrder } from "../orders/order.service.js";
import { parseZidOrderCompletedWebhook } from "../orders/order-webhook.parser.js";
import { createFirstOrderRewardIfNeeded } from "../rewards/reward.service.js";
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

  if (!completedOrderResult.isFirstCompletedOrder) {
    await webhookRepository.markProcessed(webhookEvent.id);

    return {
      processed: true,
      reason: "not_first_completed_order",
    };
  }

  const rewardResult = await createFirstOrderRewardIfNeeded({
    customerId: completedOrderResult.customer.id,
    orderId: completedOrderResult.order.id,
  });

  const couponResult = await createCouponForRewardIfNeeded({
    rewardId: rewardResult.reward.id,
    amount: Number(rewardResult.reward.amount),
    minimumOrderAmount: Number(rewardResult.reward.minimumOrderAmount),
    expiresAt: rewardResult.reward.expiresAt,
  });

  await queueCouponNotification({
    customerId: completedOrderResult.customer.id,
    rewardId: rewardResult.reward.id,
    couponCode: couponResult.coupon.code,
    amount: Number(couponResult.coupon.amount),
    minimumOrderAmount: Number(couponResult.coupon.minimumOrderAmount),
    expiresAt: couponResult.coupon.expiresAt,
  });

  logger.info("Coupon prepared for first order reward", {
    rewardId: rewardResult.reward.id,
    couponId: couponResult.coupon.id,
    couponCode: couponResult.coupon.code,
    created: couponResult.created,
  });

  await webhookRepository.markProcessed(webhookEvent.id);

  return {
    processed: true,
    reason: couponResult.created
      ? "first_order_coupon_created"
      : "first_order_coupon_already_exists",
  };
};