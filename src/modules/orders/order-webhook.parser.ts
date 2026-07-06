import { z } from "zod";
import { AppError } from "../../shared/errors/AppError.js";

const zidOrderWebhookDataSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  status: z.string().optional(),
  total: z.union([z.string(), z.number()]).transform(Number).optional(),
  total_amount: z.union([z.string(), z.number()]).transform(Number).optional(),
  completed_at: z.string().optional(),
  customer: z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    name: z.string().optional(),
    email: z.string().optional(),
    mobile: z.string().optional(),
    phone: z.string().optional(),
  }),
});

export type ParsedZidOrder = {
  zidOrderId: string;
  status: string;
  totalAmount: number;
  completedAt: Date;
  customer: {
    zidCustomerId: string;
    name?: string;
    email?: string;
    phone?: string;
  };
};

export const parseZidOrderCompletedWebhook = (data: unknown): ParsedZidOrder => {
  const result = zidOrderWebhookDataSchema.safeParse(data);

  if (!result.success) {
    throw new AppError("Invalid Zid order webhook data", 400);
  }

  const parsed = result.data;
  const totalAmount = parsed.total_amount ?? parsed.total ?? 0;
  const phone = parsed.customer.mobile ?? parsed.customer.phone;

  return {
    zidOrderId: parsed.id,
    status: parsed.status ?? "completed",
    totalAmount,
    completedAt: parsed.completed_at ? new Date(parsed.completed_at) : new Date(),
    customer: {
      zidCustomerId: parsed.customer.id,
      ...(parsed.customer.name ? { name: parsed.customer.name } : {}),
      ...(parsed.customer.email ? { email: parsed.customer.email } : {}),
      ...(phone ? { phone } : {}),
    },
  };
};