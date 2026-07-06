import { describe, expect, it } from "vitest";
import { parseZidOrderCompletedWebhook } from "./order-webhook.parser.js";

describe("parseZidOrderCompletedWebhook", () => {
  it("parses a completed order webhook payload", () => {
    const parsed = parseZidOrderCompletedWebhook({
      id: "order-1",
      status: "completed",
      total_amount: 245,
      completed_at: "2026-07-06T00:00:00.000Z",
      customer: {
        id: "customer-1",
        name: "Ismael",
        email: "ismael@example.com",
        mobile: "0500000000",
      },
    });

    expect(parsed).toEqual({
      zidOrderId: "order-1",
      status: "completed",
      totalAmount: 245,
      completedAt: new Date("2026-07-06T00:00:00.000Z"),
      customer: {
        zidCustomerId: "customer-1",
        name: "Ismael",
        email: "ismael@example.com",
        phone: "0500000000",
      },
    });
  });

  it("throws when customer is missing", () => {
    expect(() =>
      parseZidOrderCompletedWebhook({
        id: "order-1",
        status: "completed",
        total_amount: 245,
      }),
    ).toThrow("Invalid Zid order webhook data");
  });
});