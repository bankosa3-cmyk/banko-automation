import { logger } from "../../shared/logger/logger.js";
import { notificationRepository } from "./notification.repository.js";

type QueueCouponNotificationInput = {
  customerId: string;
  rewardId: string;
  couponCode: string;
  amount: number;
  minimumOrderAmount: number;
  expiresAt: Date;
};

export const queueCouponNotification = async (
  input: QueueCouponNotificationInput,
) => {
  const message = [
    `مبروك! حصلت على رصيد مكافأة ${input.amount} ريال من Banko.`,
    `استخدم الكود ${input.couponCode} في طلبك القادم.`,
    `الحد الأدنى للطلب ${input.minimumOrderAmount} ريال.`,
    `صالح حتى ${input.expiresAt.toISOString().slice(0, 10)}.`,
  ].join(" ");

  const notification = await notificationRepository.createPending({
    customerId: input.customerId,
    rewardId: input.rewardId,
    channel: "pending_provider",
    message,
  });

  logger.info("Coupon notification queued", {
    notificationId: notification.id,
    customerId: input.customerId,
    rewardId: input.rewardId,
  });

  return notification;
};