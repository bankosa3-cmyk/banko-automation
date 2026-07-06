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

  ZID_API_BASE_URL: z.string().url().default("https://api.zid.sa"),
  ZID_ACCESS_TOKEN: z.string().optional(),
  ZID_MANAGER_TOKEN: z.string().optional(),
ZID_STORE_ID: z.string().optional(),
ZID_FIRST_ORDER_REWARD_TAG: z
  .string()
  .default("first_order_reward_eligible"),
  ZID_OAUTH_CLIENT_ID: z.string().optional(),
  ZID_OAUTH_CLIENT_SECRET: z.string().optional(),
  ZID_OAUTH_REDIRECT_URI: z.string().url().optional(),
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