import { prisma } from "../../shared/database/prisma.js";

type CreateNotificationLogInput = {
  customerId: string;
  rewardId?: string;
  channel: string;
  message: string;
};

export const notificationRepository = {
  createPending: async (input: CreateNotificationLogInput) => {
    return prisma.notificationLog.create({
      data: {
        customerId: input.customerId,
        rewardId: input.rewardId ?? null,
        channel: input.channel,
        status: "pending",
        message: input.message,
      },
    });
  },
};