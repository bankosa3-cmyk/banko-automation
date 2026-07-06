import type { Prisma } from "@prisma/client";
import { prisma } from "../../shared/database/prisma.js";

type CreateWebhookEventInput = {
  provider: string;
  eventType: string;
  externalEventId?: string | undefined;
  payload: unknown;
};

export const webhookRepository = {
  createReceivedEvent: async (input: CreateWebhookEventInput) => {
    return prisma.webhookEvent.create({
      data: {
        provider: input.provider,
        eventType: input.eventType,
externalEventId: input.externalEventId ?? null,
        payload: input.payload as Prisma.InputJsonValue,
        status: "received",
      },
    });
  },

  markProcessed: async (id: string) => {
    return prisma.webhookEvent.update({
      where: { id },
      data: {
        status: "processed",
        processedAt: new Date(),
      },
    });
  },

  markIgnored: async (id: string) => {
    return prisma.webhookEvent.update({
      where: { id },
      data: {
        status: "ignored",
        processedAt: new Date(),
      },
    });
  },

  markFailed: async (id: string, errorMessage: string) => {
    return prisma.webhookEvent.update({
      where: { id },
      data: {
        status: "failed",
        errorMessage,
        processedAt: new Date(),
      },
    });
  },
};