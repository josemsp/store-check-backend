import { z } from "@hono/zod-openapi";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { loadCurrentUser } from "../../shared/middlewares/load-current-user";
import {
  createSuccessSchema,
  ApiFailureSchema,
  jsonResponse,
} from "../../shared/openapi/schemas";
import type { AppBindings } from "../../shared/types/context";
import { successResponse } from "../../shared/utils/response";
import { SupabaseUserRepository } from "./users.repository";
import {
  SearchUsersQuerySchema,
  SearchUsersResponseSchema,
  ProfileUpdateResponseSchema,
  UpdateProfileSchema,
  UserIdParamSchema,
  ProfileResponseSchema,
} from "./users.schemas";
import { UsersService } from "./users.service";

const errorResponse = (description: string) =>
  jsonResponse(ApiFailureSchema, description);

const getMyProfileRoute = createRoute({
  method: "get",
  path: "/me",
  operationId: "getMyProfile",
  tags: ["Users"],
  summary: "Get current user profile.",
  security: [{ BearerAuth: [] }],
  middleware: [requireAuth, loadCurrentUser] as const,
  responses: {
    200: jsonResponse(ProfileResponseSchema, "Current user profile."),
    401: errorResponse("Unauthorized."),
    403: errorResponse("Forbidden."),
  },
});

const listUsersRoute = createRoute({
  method: "get",
  path: "/",
  operationId: "listUsers",
  tags: ["Users"],
  summary: "Search and list users.",
  description:
    "Platform admins see all platform users. Organization members see their organization users.",
  security: [{ BearerAuth: [] }],
  middleware: [requireAuth, loadCurrentUser] as const,
  request: { query: SearchUsersQuerySchema },
  responses: {
    200: jsonResponse(SearchUsersResponseSchema, "List of users."),
    401: errorResponse("Unauthorized."),
    403: errorResponse("Forbidden."),
  },
});

const updateProfileRoute = createRoute({
  method: "patch",
  path: "/me",
  operationId: "updateProfile",
  tags: ["Users"],
  summary: "Update current user profile.",
  security: [{ BearerAuth: [] }],
  middleware: [requireAuth, loadCurrentUser] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateProfileSchema,
        },
      },
    },
  },
  responses: {
    200: jsonResponse(ProfileUpdateResponseSchema, "Updated profile."),
    401: errorResponse("Unauthorized."),
    403: errorResponse("Forbidden."),
    422: errorResponse("Validation error."),
  },
});

const deleteUserRoute = createRoute({
  method: "delete",
  path: "/{user_id}",
  operationId: "deleteUser",
  tags: ["Users"],
  summary: "Delete a user (platform admin only).",
  security: [{ BearerAuth: [] }],
  middleware: [requireAuth, loadCurrentUser] as const,
  request: {
    params: UserIdParamSchema,
  },
  responses: {
    200: jsonResponse(
      createSuccessSchema("DeleteUserResponse", z.object({})),
      "User deleted.",
    ),
    401: errorResponse("Unauthorized."),
    403: errorResponse("Forbidden."),
  },
});

function createService(c: {
  env: AppBindings["Bindings"];
  get: <Key extends keyof AppBindings["Variables"]>(
    key: Key,
  ) => AppBindings["Variables"][Key];
}): UsersService {
  return new UsersService(
    new SupabaseUserRepository(c.get("userSupabase"), c.get("adminSupabase")),
  );
}

export const usersRoutes = new OpenAPIHono<AppBindings>();

usersRoutes.openapi(getMyProfileRoute, (c) => {
  const currentUser = c.get("currentUser");
  return successResponse(c, currentUser, 200);
});

usersRoutes.openapi(listUsersRoute, async (c) => {
  const currentUser = c.get("currentUser");
  const query = c.req.valid("query");
  const args = {
    ...(query.p_limit !== undefined ? { p_limit: query.p_limit } : {}),
    ...(query.p_offset !== undefined ? { p_offset: query.p_offset } : {}),
    ...(query.p_search !== undefined ? { p_search: query.p_search } : {}),
    ...(query.p_status !== undefined ? { p_status: query.p_status } : {}),
  };
  const result = await createService(c).listUsers(currentUser, args);
  return successResponse(c, result, 200);
});

usersRoutes.openapi(updateProfileRoute, async (c) => {
  const currentUser = c.get("currentUser");
  const input = c.req.valid("json");
  const result = await createService(c).updateProfile(currentUser, input);
  return successResponse(c, result, 200);
});

usersRoutes.openapi(deleteUserRoute, async (c) => {
  const currentUser = c.get("currentUser");
  const { user_id } = c.req.valid("param");
  await createService(c).deleteUser(currentUser, user_id);
  return successResponse(c, {}, 200);
});
