import express from "express";
import { webhookRoutes } from "../modules/webhooks/webhook.routes.js";

export const createExpressApp = () => {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "banko-automation",
    });
  });

  app.use("/webhooks", webhookRoutes);

  return app;
};