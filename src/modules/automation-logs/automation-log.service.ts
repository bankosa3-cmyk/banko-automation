import type { Prisma } from "@prisma/client";
import { logger } from "../../shared/logger/logger.js";
import { automationLogRepository } from "./automation-log.repository.js";

type TrackAutomationEventInput = {
  type: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
};

export const trackAutomationEvent = async (
  input: TrackAutomationEventInput,
) => {
  try {
    return await automationLogRepository.create(input);
  } catch (error) {
    logger.error("Failed to create automation log", {
      type: input.type,
      message: input.message,
      error,
    });

    return null;
  }
};
