import { trackAutomationEvent } from "../automation-logs/automation-log.service.js";
import { createCouponForRewardIfNeeded } from "../coupons/coupon.service.js";
import { queueCouponNotification } from "../notifications/notification.service.js";
import { handleCompletedOrder } from "../orders/order.service.js";
import { parseZidOrderCompletedWebhook } from "../orders/order-webhook.parser.js";
import { createFirstOrderRewardIfNeeded } from "../rewards/reward.service.js";
import { logger } from "../../shared/logger/logger.js";
import { webhookRepository } from "./webhook.repository.js";
import type { ZidWebhookPayload } from "./webhook.validation.js";

export const processZidWebhook = async (payload: ZidWebhookPayload) => {
  if (payload.event_id) {
    const existingWebhookEvent = await webhookRepository.findByExternalEventId(
      payload.event_id,
    );

    if (existingWebhookEvent) {
      logger.info("Duplicate Zid webhook ignored", {
        event: payload.event,
        externalEventId: payload.event_id,
        webhookEventId: existingWebhookEvent.id,
        status: existingWebhookEvent.status,
      });

      await trackAutomationEvent({
        type: "webhook.duplicate",
        message: "Duplicate Zid webhook ignored",
        metadata: {
          event: payload.event,
          externalEventId: payload.event_id,
          webhookEventId: existingWebhookEvent.id,
          status: existingWebhookEvent.status,
        },
      });

      return {
        processed: false,
        reason: "duplicate_webhook_event",
      };
    }
  }

  const webhookEvent = await webhookRepository.createReceivedEvent({
    provider: "zid",
    eventType: payload.event,
    externalEventId: payload.event_id,
    payload,
  });

  await trackAutomationEvent({
    type: "webhook.received",
    message: "Zid webhook received",
    metadata: {
      event: payload.event,
      externalEventId: payload.event_id ?? null,
      webhookEventId: webhookEvent.id,
    },
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

    await trackAutomationEvent({
      type: "webhook.ignored",
      message: "Unsupported Zid webhook event ignored",
      metadata: {
        event: payload.event,
        webhookEventId: webhookEvent.id,
      },
    });

    return {
      processed: false,
      reason: "unsupported_event",
    };
  }

  const parsedOrder = parseZidOrderCompletedWebhook(payload.data);
  const completedOrderResult = await handleCompletedOrder(parsedOrder);

  await trackAutomationEvent({
    type: "order.completed.handled",
    message: "Completed order saved and checked",
    metadata: {
      webhookEventId: webhookEvent.id,
      zidOrderId: completedOrderResult.order.zidOrderId,
      zidCustomerId: completedOrderResult.customer.zidCustomerId,
      isFirstCompletedOrder: completedOrderResult.isFirstCompletedOrder,
      completedOrdersCount: completedOrderResult.completedOrdersCount,
    },
  });

  logger.info("Completed order handled", {
    webhookEventId: webhookEvent.id,
    zidOrderId: completedOrderResult.order.zidOrderId,
    zidCustomerId: completedOrderResult.customer.zidCustomerId,
    isFirstCompletedOrder: completedOrderResult.isFirstCompletedOrder,
    completedOrdersCount: completedOrderResult.completedOrdersCount,
  });

  if (!completedOrderResult.isFirstCompletedOrder) {
    await webhookRepository.markProcessed(webhookEvent.id);

    await trackAutomationEvent({
      type: "reward.skipped",
      message: "Reward skipped because order is not first completed order",
      metadata: {
        webhookEventId: webhookEvent.id,
        customerId: completedOrderResult.customer.id,
        orderId: completedOrderResult.order.id,
        completedOrdersCount: completedOrderResult.completedOrdersCount,
      },
    });

    return {
      processed: true,
      reason: "not_first_completed_order",
    };
  }

  const rewardResult = await createFirstOrderRewardIfNeeded({
    customerId: completedOrderResult.customer.id,
    orderId: completedOrderResult.order.id,
  });

  await trackAutomationEvent({
    type: rewardResult.created ? "reward.created" : "reward.exists",
    message: rewardResult.created
      ? "First order reward created"
      : "First order reward already exists",
    metadata: {
      rewardId: rewardResult.reward.id,
      customerId: completedOrderResult.customer.id,
      orderId: completedOrderResult.order.id,
    },
  });

  const couponResult = await createCouponForRewardIfNeeded({
    rewardId: rewardResult.reward.id,
    amount: Number(rewardResult.reward.amount),
    minimumOrderAmount: Number(rewardResult.reward.minimumOrderAmount),
    expiresAt: rewardResult.reward.expiresAt,
  });

  await trackAutomationEvent({
    type: couponResult.created ? "coupon.created" : "coupon.exists",
    message: couponResult.created
      ? "First order coupon created"
      : "First order coupon already exists",
    metadata: {
      rewardId: rewardResult.reward.id,
      couponId: couponResult.coupon.id,
      couponCode: couponResult.coupon.code,
    },
  });

  await queueCouponNotification({
    customerId: completedOrderResult.customer.id,
    rewardId: rewardResult.reward.id,
    couponCode: couponResult.coupon.code,
    amount: Number(couponResult.coupon.amount),
    minimumOrderAmount: Number(couponResult.coupon.minimumOrderAmount),
    expiresAt: couponResult.coupon.expiresAt,
  });

  await trackAutomationEvent({
    type: "notification.queued",
    message: "Coupon notification queued",
    metadata: {
      rewardId: rewardResult.reward.id,
      couponId: couponResult.coupon.id,
      couponCode: couponResult.coupon.code,
      customerId: completedOrderResult.customer.id,
    },
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