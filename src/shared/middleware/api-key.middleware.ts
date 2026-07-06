import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z
    .string()
    .default("3000")
    .transform((value) => Number(value)),

  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .default("info"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  ZID_WEBHOOK_SECRET: z.string().optional(),

  INTERNAL_API_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables",
    parsedEnv.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsedEnv.data;