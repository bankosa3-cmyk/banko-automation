import express from "express";

export const createExpressApp = () => {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "banko-automation",
    });
  });

  return app;
};