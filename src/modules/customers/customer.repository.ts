import { prisma } from "../../shared/database/prisma.js";

type UpsertCustomerInput = {
  zidCustomerId: string;
  name?: string;
  email?: string;
  phone?: string;
};

export const customerRepository = {
  upsertByZidCustomerId: async (input: UpsertCustomerInput) => {
    return prisma.customer.upsert({
      where: {
        zidCustomerId: input.zidCustomerId,
      },
      update: {
        name: input.name ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
      },
      create: {
        zidCustomerId: input.zidCustomerId,
        name: input.name ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
      },
    });
  },
};