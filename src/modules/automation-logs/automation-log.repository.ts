import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/database/prisma.js";

type CreateAutomationLogInput = {
  type: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
};

export const automationLogRepository = {
  create: async (input: CreateAutomationLogInput) => {
    return prisma.automationLog.create({
      data: {
        type: input.type,
        message: input.message,
        metadata: input.metadata ?? Prisma.JsonNull,
      },
    });
  },
};