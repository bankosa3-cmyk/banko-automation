import axios from "axios";
import { Router } from "express";
import { env } from "../../config/env.js";
import { apiKeyMiddleware } from "../../shared/middleware/api-key.middleware.js";
import { logger } from "../../shared/logger/logger.js";
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
    if (axios.isAxiosError(error)) {
      logger.error("Zid customer tag test failed", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      return res.status(502).json({
        message: "Zid API request failed",
        zidStatus: error.response?.status,
        zidResponse: error.response?.data,
      });
    }

    return next(error);
  }
});