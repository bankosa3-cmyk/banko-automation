import express from "express";
import { webhookRoutes } from "../modules/webhooks/webhook.routes.js";
import { notFoundMiddleware } from "../shared/middleware/not-found.middleware.js";
import { requestLoggerMiddleware } from "../shared/middleware/request-logger.middleware.js";

export const createExpressApp = () => {
  const app = express();

  app.use(express.json());
  app.use(requestLoggerMiddleware);

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "banko-automation",
    });
  });

  app.use("/webhooks", webhookRoutes);

  app.use(notFoundMiddleware);

  return app;
};