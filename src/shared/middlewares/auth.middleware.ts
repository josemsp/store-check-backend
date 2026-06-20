import { createMiddleware } from "hono/factory";

import { AppError } from "../errors/app-error";
import { ErrorCode } from "../errors/error-codes";
import { createUserSupabaseClient } from "../supabase/client";
import type { AppBindings } from "../types/context";
import { readBearerToken } from "../utils/auth-token";

export const requireAuth = createMiddleware<AppBindings>(async (c, next) => {
  const accessToken = readBearerToken(c.req.header("authorization"));

  if (!accessToken) {
    throw new AppError({
      code: ErrorCode.AUTHENTICATION_REQUIRED,
      message: "Authentication is required.",
      status: 401,
    });
  }

  const supabase = createUserSupabaseClient(c.env, accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error) {
    throw new AppError({
      code: ErrorCode.AUTHENTICATION_REQUIRED,
      message: "The access token is invalid or expired.",
      status: 401,
      cause: error,
    });
  }

  c.set("user", data.user);
  c.set("userSupabase", supabase);
  await next();
});
