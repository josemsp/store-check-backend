import type { ContentfulStatusCode } from 'hono/utils/http-status'

import type { ErrorCode } from './error-codes'

interface AppErrorOptions {
  code: ErrorCode
  message: string
  status: ContentfulStatusCode
  details?: unknown
  cause?: unknown
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: ContentfulStatusCode
  readonly details?: unknown

  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause })
    this.name = 'AppError'
    this.code = options.code
    this.status = options.status
    this.details = options.details
  }
}
