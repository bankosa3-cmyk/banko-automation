import request from "supertest";
import { describe, expect, it } from "vitest";
import { createExpressApp } from "./express.js";

describe("createExpressApp", () => {
  it("returns health status", async () => {
    const app = createExpressApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "banko-automation",
    });
  });

  it("returns 404 for unknown routes", async () => {
    const app = createExpressApp();

    const response = await request(app).get("/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Route not found",
      path: "/unknown-route",
    });
  });
});