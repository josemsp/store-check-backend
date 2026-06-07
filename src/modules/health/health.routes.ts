import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import {
  ApiFailureSchema,
  createSuccessSchema,
  jsonResponse,
} from "../../shared/openapi/schemas";
import { AppError } from "../../shared/errors/app-error";
import { ErrorCode } from "../../shared/errors/error-codes";
import type { AppBindings } from "../../shared/types/context";
import { successResponse } from "../../shared/utils/response";
import { HealthDataSchema } from "./health.schemas";

const HealthResponseSchema = createSuccessSchema(
  "HealthResponse",
  HealthDataSchema,
);

const getHealthRoute = createRoute({
  method: "get",
  path: "/",
  operationId: "getHealth",
  tags: ["System"],
  summary: "Check service health",
  description:
    "Checks API availability and verifies connectivity with the database.",
  responses: {
    200: jsonResponse(
      HealthResponseSchema,
      "The API and database are available.",
    ),
    503: jsonResponse(ApiFailureSchema, "The database is unavailable."),
  },
});

export const healthRoutes = new OpenAPIHono<AppBindings>();

healthRoutes.openapi(getHealthRoute, async (c) => {
  try {
    const { error } = await c
      .get("adminSupabase")
      .from("healthcheck")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }
  } catch (cause) {
    throw new AppError({
      code: ErrorCode.INTERNAL_ERROR,
      message: "The database is unavailable.",
      status: 503,
      cause,
    });
  }

  return successResponse(
    c,
    {
      database: { status: "ok" as const },
      service: "store-check-backend" as const,
      status: "ok" as const,
      timestamp: new Date().toISOString(),
    },
    200,
  );
});
