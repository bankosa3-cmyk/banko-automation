import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/database/prisma.js";

type UpsertCompletedOrderInput = {
  zidOrderId: string;
  customerId: string;
  status: string;
  totalAmount: number;
  completedAt: Date;
};

export const orderRepository = {
  upsertCompletedOrder: async (input: UpsertCompletedOrderInput) => {
    return prisma.order.upsert({
      where: {
        zidOrderId: input.zidOrderId,
      },
      update: {
        status: input.status,
        totalAmount: new Prisma.Decimal(input.totalAmount),
        completedAt: input.completedAt,
      },
      create: {
        zidOrderId: input.zidOrderId,
        customerId: input.customerId,
        status: input.status,
        totalAmount: new Prisma.Decimal(input.totalAmount),
        completedAt: input.completedAt,
      },
    });
  },

  countCompletedOrdersByCustomerId: async (customerId: string) => {
    return prisma.order.count({
      where: {
        customerId,
        status: "completed",
      },
    });
  },
};