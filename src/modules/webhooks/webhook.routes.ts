import { Router } from "express";
import { handleZidWebhook } from "./webhook.controller.js";

export const webhookRoutes = Router();

webhookRoutes.post("/zid", handleZidWebhook);