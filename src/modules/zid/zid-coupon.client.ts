import { zidHttpClient } from "./zid.client.js";

type CreateZidCouponInput = {
  code: string;
  amount: number;
  minimumOrderAmount: number;
  expiresAt: Date;
  usageLimit: number;
};

export const zidCouponClient = {
  createCoupon: async (input: CreateZidCouponInput) => {
    // TODO: Confirm exact Zid coupon endpoint and payload from Zid documentation.
    const response = await zidHttpClient.post("/v1/coupons", {
      code: input.code,
      discount_type: "fixed",
      discount_amount: input.amount,
      minimum_order_amount: input.minimumOrderAmount,
      expires_at: input.expiresAt.toISOString(),
      usage_limit: input.usageLimit,
    });

    return response.data as unknown;
  },
};