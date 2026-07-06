import axios from "axios";
import { Router } from "express";
import { env } from "../../config/env.js";
import { prisma } from "../../shared/database/prisma.js";
import { apiKeyMiddleware } from "../../shared/middleware/api-key.middleware.js";
import { zidCustomerClient } from "../zid/zid-customer.client.js";

export const internalRoutes = Router();

internalRoutes.use(apiKeyMiddleware);

internalRoutes.post("/test-zid-auth", async (req, res) => {
  const customerId = String(req.body.customerId ?? "");
  const storeId = env.ZID_STORE_ID;

  if (!customerId) {
    return res.status(400).json({ message: "customerId is required" });
  }

  if (!storeId) {
    return res.status(500).json({ message: "ZID_STORE_ID is not configured" });
  }

  const token = await prisma.zidStoreToken.findUnique({
    where: { storeId },
  });

  if (!token) {
    return res.status(500).json({
      message: "No Zid token saved for this store",
      storeId,
    });
  }

  const url = `${env.ZID_API_BASE_URL}/v1/managers/store/customers/${customerId}/profile`;

  const authorizationBearer = token.authorizationToken.startsWith("Bearer ")
    ? token.authorizationToken
    : `Bearer ${token.authorizationToken}`;

  const tests = [
    {
      name: "authorization_bearer_with_x_manager",
      headers: {
        Authorization: authorizationBearer,
        "X-Manager-Token": token.managerToken,
        Accept: "application/json",
        "Accept-Language": "ar",
      },
    },
    {
      name: "authorization_raw_with_x_manager",
      headers: {
        Authorization: token.authorizationToken,
        "X-Manager-Token": token.managerToken,
        Accept: "application/json",
        "Accept-Language": "ar",
      },
    },
    {
      name: "manager_bearer_with_x_manager",
      headers: {
        Authorization: token.managerToken.startsWith("Bearer ")
          ? token.managerToken
          : `Bearer ${token.managerToken}`,
        "X-Manager-Token": token.managerToken,
        Accept: "application/json",
        "Accept-Language": "ar",
      },
    },
    {
      name: "authorization_bearer_with_access_token",
      headers: {
        Authorization: authorizationBearer,
        "Access-Token": token.managerToken,
        Accept: "application/json",
        "Accept-Language": "ar",
      },
    },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const response = await axios.get(url, {
        headers: test.headers,
        timeout: 15000,
      });

      results.push({
        name: test.name,
        ok: true,
        status: response.status,
        data: response.data,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        results.push({
          name: test.name,
          ok: false,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        results.push({
          name: test.name,
          ok: false,
          error: "Unknown error",
        });
      }
    }
  }

  return res.status(200).json({
    storeId,
    customerId,
    hasAuthorizationToken: Boolean(token.authorizationToken),
    hasManagerToken: Boolean(token.managerToken),
    results,
  });
});

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
      return res.status(502).json({
        message: "Zid API request failed",
        zidStatus: error.response?.status,
        zidResponse: error.response?.data,
      });
    }

    return next(error);
  }
});