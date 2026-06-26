import { createMiddleware } from "hono/factory";

import { AppError } from "../errors/app-error";
import { ErrorCode } from "../errors/error-codes";
import type { AppBindings } from "../types/context";

export const loadCurrentUser = createMiddleware<AppBindings>(
  async (c, next) => {
    const supabase = c.get("userSupabase");

    const { data, error } = await supabase.rpc("get_current_user").single();

    if (error || !data) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        message: "User profile was not found or is inactive.",
        status: 403,
        cause: error,
      });
    }

    c.set("currentUser", data);

    await next();
  },
);
