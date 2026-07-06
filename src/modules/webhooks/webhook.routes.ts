import { Router } from "express";
import { handleZidWebhook } from "./webhook.controller.js";
import { verifyZidWebhookSignature } from "./webhook.security.js";

export const webhookRoutes = Router();

webhookRoutes.post("/zid", verifyZidWebhookSignature, handleZidWebhook);