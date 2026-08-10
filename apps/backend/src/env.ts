import "dotenv/config";
import { z } from "zod";

/**
 * Every var from Section 7 of the build brief. Phase 1 only strictly needs
 * DATABASE_URL + GEMINI_API_KEY — the AWS/GitHub vars are validated as
 * optional-but-typed here so Phase 2/3 code can rely on them without
 * re-parsing, and so a missing var fails fast with a clear message instead
 * of an undefined deep in a request handler.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (RDS/local Postgres connection string)"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),

  // Frontend origin(s) allowed to call this API from the browser. Comma-separated for more than one.
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Phase 1 local sandbox
  SANDBOX_IMAGE: z.string().default("clouddev/sandbox-agent:local"),
  SANDBOX_MAX_RUNTIME_MS: z.coerce.number().int().positive().default(45 * 60 * 1000),
  SANDBOX_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(10 * 60 * 1000),

  // Phase 2 — GitHub OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Phase 3 — AWS
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  REDIS_URL: z.string().optional(),
  S3_BUCKET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();
