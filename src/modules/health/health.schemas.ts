import { z } from "@hono/zod-openapi";

export const HealthDataSchema = z
  .object({
    service: z.literal("store-check-backend"),
    status: z.literal("ok"),
    database: z.object({
      status: z.literal("ok"),
    }),
    timestamp: z.iso.datetime().openapi({
      description: "Current service time in ISO 8601 format.",
      example: "2026-06-07T05:00:00.000Z",
    }),
  })
  .openapi("HealthData");
