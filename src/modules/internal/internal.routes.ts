import { Router } from "express";
import { apiKeyMiddleware } from "../../shared/middleware/api-key.middleware.js";
import { env } from "../../config/env.js";
import { zidCustomerClient } from "../zid/zid-customer.client.js";

export const internalRoutes = Router();

internalRoutes.use(apiKeyMiddleware);

internalRoutes.post("/test-zid-customer-tag", async (req, res, next) => {
  try {
    const customerId = String(req.body.customerId ?? "");
    const tagName = env.ZID_FIRST_ORDER_REWARD_TAG;

    if (!customerId) {
      return res.status(400).json({
        message: "customerId is required",
      });
    }

    await zidCustomerClient.addTagToCustomer({
      customerId,
      tagName,
    });

    return res.status(200).json({
      success: true,
      customerId,
      tagName,
    });
  } catch (error) {
    next(error);
  }
});