import crypto from "node:crypto";
import { couponRepository } from "./coupon.repository.js";

const COUPON_PREFIX = "BANKO45";
const COUPON_USAGE_LIMIT = 1;

type CreateCouponForRewardInput = {
  rewardId: string;
  amount: number;
  minimumOrderAmount: number;
  expiresAt: Date;
};

const generateCouponCode = () => {
  const randomPart = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `${COUPON_PREFIX}-${randomPart}`;
};

export const createCouponForRewardIfNeeded = async (
  input: CreateCouponForRewardInput,
) => {
  const existingCoupon = await couponRepository.findByRewardId(input.rewardId);

  if (existingCoupon) {
    return {
      coupon: existingCoupon,
      created: false,
    };
  }

  const coupon = await couponRepository.create({
    rewardId: input.rewardId,
    code: generateCouponCode(),
    amount: input.amount,
    minimumOrderAmount: input.minimumOrderAmount,
    expiresAt: input.expiresAt,
    usageLimit: COUPON_USAGE_LIMIT,
  });

  return {
    coupon,
    created: true,
  };
};