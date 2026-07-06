import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/database/prisma.js";

type CreateRewardInput = {
  customerId: string;
  sourceOrderId: string;
  amount: number;
  minimumOrderAmount: number;
  expiresAt: Date;
};

export const rewardRepository = {
  createFirstOrderReward: async (input: CreateRewardInput) => {
    return prisma.customerReward.create({
      data: {
        customerId: input.customerId,
        sourceOrderId: input.sourceOrderId,
        amount: new Prisma.Decimal(input.amount),
        minimumOrderAmount: new Prisma.Decimal(input.minimumOrderAmount),
        expiresAt: input.expiresAt,
        status: "active",
        fulfillmentType: "coupon",
      },
    });
  },

  findBySourceOrderId: async (sourceOrderId: string) => {
    return prisma.customerReward.findFirst({
      where: {
        sourceOrderId,
      },
    });
  },
};