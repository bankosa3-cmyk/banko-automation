import { z } from "zod";

export const zidWebhookSchema = z.object({
  event: z.string().min(1),
  event_id: z.string().optional(),
  data: z.unknown(),
});

export type ZidWebhookPayload = z.infer<typeof zidWebhookSchema>;