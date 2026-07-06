import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/database/prisma.js";

type CreateCouponInput = {
  rewardId: string;
  code: string;
  amount: number;
  minimumOrderAmount: number;
  expiresAt: Date;
  usageLimit: number;
  zidCouponId?: string;
};

export const couponRepository = {
  create: async (input: CreateCouponInput) => {
    return prisma.coupon.create({
      data: {
        rewardId: input.rewardId,
        code: input.code,
        zidCouponId: input.zidCouponId ?? null,
        amount: new Prisma.Decimal(input.amount),
        minimumOrderAmount: new Prisma.Decimal(input.minimumOrderAmount),
        expiresAt: input.expiresAt,
        usageLimit: input.usageLimit,
        status: "active",
      },
    });
  },

  findByRewardId: async (rewardId: string) => {
    return prisma.coupon.findUnique({
      where: {
        rewardId,
      },
    });
  },
};