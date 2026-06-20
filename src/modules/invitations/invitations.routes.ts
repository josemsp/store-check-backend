import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { ApiFailureSchema, jsonResponse } from "../../shared/openapi/schemas";
import type { AppBindings } from "../../shared/types/context";
import { readBearerToken } from "../../shared/utils/auth-token";
import { successResponse } from "../../shared/utils/response";
import { SupabaseAuthUserGateway } from "./invitations.auth";
import { ResendInvitationMailer } from "./invitations.mailer";
import { SupabaseInvitationRepository } from "./invitations.repository";
import {
  AcceptInvitationResponseSchema,
  AcceptInvitationSchema,
  CancelInvitationResponseSchema,
  CreateInvitationResponseSchema,
  CreateInvitationSchema,
  InvitationIdParamsSchema,
  ResendInvitationSchema,
  SearchInvitationsQuerySchema,
  SearchInvitationsResponseSchema,
  ValidateInvitationQuerySchema,
  ValidateInvitationResponseSchema,
} from "./invitations.schemas";
import { InvitationsService } from "./invitations.service";
import type { SearchPlatformInvitations } from "./invitations.types";
import { loadCurrentUser } from "../../shared/middlewares/load-current-user";

const errorResponse = (description: string) =>
  jsonResponse(ApiFailureSchema, description);

const validateRoute = createRoute({
  method: "get",
  path: "/validate",
  operationId: "validateInvitation",
  tags: ["Invitations"],
  summary: "Validate an invitation token",
  request: { query: ValidateInvitationQuerySchema },
  responses: {
    200: jsonResponse(
      ValidateInvitationResponseSchema,
      "The invitation is valid.",
    ),
    404: errorResponse("The invitation is invalid or unavailable."),
  },
});

const createInvitationRoute = createRoute({
  method: "post",
  path: "/",
  operationId: "createInvitation",
  tags: ["Invitations"],
  summary: "Create and deliver an invitation",
  security: [{ BearerAuth: [] }],
  middleware: [requireAuth] as const,
  request: {
    body: {
      required: true,
      content: {
        "application/json": { schema: CreateInvitationSchema },
      },
    },
  },
  responses: {
    201: jsonResponse(
      CreateInvitationResponseSchema,
      "The invitation was created.",
    ),
    401: errorResponse("Authentication is required."),
    403: errorResponse("The actor cannot create this invitation."),
    409: errorResponse("A pending invitation already exists."),
    422: errorResponse("The request is invalid."),
  },
});

const acceptRoute = createRoute({
  method: "post",
  path: "/accept",
  operationId: "acceptInvitation",
  tags: ["Invitations"],
  summary: "Accept an invitation and create the user account",
  description:
    "Uses an existing Bearer session when present. Otherwise password and fullName are required to create a new account.",
  security: [{ BearerAuth: [] }, {}],
  request: {
    body: {
      required: true,
      content: {
        "application/json": { schema: AcceptInvitationSchema },
      },
    },
  },
  responses: {
    200: jsonResponse(
      AcceptInvitationResponseSchema,
      "The invitation was accepted.",
    ),
    404: errorResponse("The invitation is invalid or unavailable."),
    403: errorResponse("The authenticated user email does not match."),
    409: errorResponse("The invitation or account cannot be accepted."),
    410: errorResponse("The invitation has expired."),
    422: errorResponse("The request is invalid."),
  },
});

const cancelRoute = createRoute({
  method: "post",
  path: "/{id}/cancel",
  operationId: "cancelInvitation",
  tags: ["Invitations"],
  summary: "Cancel a pending invitation",
  security: [{ BearerAuth: [] }],
  middleware: [requireAuth] as const,
  request: { params: InvitationIdParamsSchema },
  responses: {
    200: jsonResponse(
      CancelInvitationResponseSchema,
      "The invitation was cancelled.",
    ),
    401: errorResponse("Authentication is required."),
    403: errorResponse("The actor cannot cancel this invitation."),
    404: errorResponse("The invitation was not found."),
    409: errorResponse("The invitation is no longer pending."),
  },
});

const resendRoute = createRoute({
  method: "post",
  path: "/{id}/resend",
  operationId: "resendInvitation",
  tags: ["Invitations"],
  summary: "Rotate and resend a pending invitation token",
  security: [{ BearerAuth: [] }],
  middleware: [requireAuth] as const,
  request: {
    params: InvitationIdParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": { schema: ResendInvitationSchema },
      },
    },
  },
  responses: {
    200: jsonResponse(
      CreateInvitationResponseSchema,
      "The invitation was resent.",
    ),
    401: errorResponse("Authentication is required."),
    403: errorResponse("The actor cannot resend this invitation."),
    404: errorResponse("The invitation was not found."),
    409: errorResponse("The invitation is no longer pending."),
  },
});

const searchRoute = createRoute({
  method: "get",
  path: "/",
  operationId: "searchInvitations",
  tags: ["Invitations"],
  summary: "Search invitations",
  security: [{ BearerAuth: [] }],
  middleware: [requireAuth, loadCurrentUser] as const,
  request: { query: SearchInvitationsQuerySchema },
  responses: {
    200: jsonResponse(
      SearchInvitationsResponseSchema,
      "The invitations were found.",
    ),
    401: errorResponse("Authentication is required."),
  },
});

function createService(c: {
  env: AppBindings["Bindings"];
  get: <Key extends keyof AppBindings["Variables"]>(
    key: Key,
  ) => AppBindings["Variables"][Key];
}): InvitationsService {
  return new InvitationsService({
    auth: new SupabaseAuthUserGateway(c.env, c.get("userSupabase")),
    mailer: new ResendInvitationMailer(c.env),
    repository: new SupabaseInvitationRepository(
      c.get("userSupabase"),
      c.get("adminSupabase"),
    ),
    env: c.env,
  });
}

export const invitationsRoutes = new OpenAPIHono<AppBindings>();

invitationsRoutes.openapi(validateRoute, async (c) => {
  const result = await createService(c).validate(c.req.valid("query").token);
  return successResponse(c, result, 200);
});

invitationsRoutes.openapi(createInvitationRoute, async (c) => {
  const payload = c.req.valid("json");
  const result = await createService(c).create({
    email: payload.email,
    type: payload.type,
    role_ids: payload.role_ids,
    location_ids: payload.location_ids,
    expires_in_days: payload.expires_in_days,
    ...(payload.platform_role ? { platform_role: payload.platform_role } : {}),
    ...(payload.organization_id
      ? { organization_id: payload.organization_id }
      : {}),
    new_organization_name: payload.new_organization_name,
    new_organization_slug: payload.new_organization_slug,
  });
  return successResponse(c, result, 201);
});

invitationsRoutes.openapi(acceptRoute, async (c) => {
  const payload = c.req.valid("json");
  const result = await createService(c).accept(
    {
      token: payload.token,
      ...(payload.password ? { password: payload.password } : {}),
      ...(payload.fullName ? { fullName: payload.fullName } : {}),
    },
    readBearerToken(c.req.header("authorization")),
  );
  return successResponse(c, result, 200);
});

invitationsRoutes.openapi(cancelRoute, async (c) => {
  await createService(c).cancel(c.req.valid("param").id);
  return successResponse(c, { cancelled: true as const }, 200);
});

invitationsRoutes.openapi(resendRoute, async (c) => {
  const result = await createService(c).resend(
    c.get("user").id,
    c.req.valid("param").id,
    c.req.valid("json").expires_in_days,
  );
  return successResponse(c, result, 200);
});

invitationsRoutes.openapi(searchRoute, async (c) => {
  const query = c.req.valid("query");
  const args: SearchPlatformInvitations = {
    ...(query.p_limit !== undefined ? { p_limit: query.p_limit } : {}),
    ...(query.p_offset !== undefined ? { p_offset: query.p_offset } : {}),
    ...(query.p_scope !== undefined ? { p_scope: query.p_scope } : {}),
    ...(query.p_search !== undefined ? { p_search: query.p_search } : {}),
    ...(query.p_status !== undefined ? { p_status: query.p_status } : {}),
  };

  const is_platform_admin = c.get("currentUser").is_platform_admin;
  const is_root = c.get("currentUser").platform_role === "ROOT";
  console.log("is_root", is_root, is_platform_admin);

  if (is_root && is_platform_admin) {
    const result = await createService(c).searchByPlatform(args);
    console.log("result", result);
    return successResponse(c, result, 200);
  }

  const result = await createService(c).searchByOrganization({
    ...args,
    p_organization_id: c.get("currentUser").organization_id,
  });
  return successResponse(c, result, 200);
});
