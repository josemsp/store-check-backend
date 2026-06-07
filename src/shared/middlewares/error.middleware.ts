import type { Context } from 'hono'
import type { HTTPResponseError } from 'hono/types'
import { z, ZodError } from 'zod'

import { AppError } from '../errors/app-error'
import { ErrorCode } from '../errors/error-codes'
import type { AppBindings } from '../types/context'
import { errorResponse } from '../utils/response'

export function handleError(
  error: Error | HTTPResponseError,
  c: Context<AppBindings>,
): Response {
  const requestId = c.get('requestId')

  if (error instanceof AppError) {
    return errorResponse(
      c,
      error.code,
      error.message,
      error.status,
      error.details,
    )
  }

  if (error instanceof ZodError) {
    return errorResponse(
      c,
      ErrorCode.VALIDATION_ERROR,
      'The request data is invalid.',
      422,
      z.treeifyError(error),
    )
  }

  console.error('Unhandled request error', {
    error,
    requestId,
  })

  return errorResponse(
    c,
    ErrorCode.INTERNAL_ERROR,
    'An unexpected error occurred.',
    500,
  )
}
