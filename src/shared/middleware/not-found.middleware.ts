import type { Request, Response } from "express";

export const notFoundMiddleware = (req: Request, res: Response) => {
  return res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
};