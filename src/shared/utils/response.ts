import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import type { AppBindings } from '../types/context'

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

interface SuccessResponseOptions {
  pagination?: PaginationMeta
}

export interface ApiSuccess<T> {
  success: true
  data: T
  meta: {
    pagination?: PaginationMeta
    requestId: string
  }
}

export interface ApiFailure {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  meta: {
    requestId: string
  }
}

export function successResponse<
  T,
  Status extends ContentfulStatusCode,
>(
  c: Context<AppBindings>,
  data: T,
  status: Status,
  options: SuccessResponseOptions = {},
) {
  return c.json<ApiSuccess<T>, Status>(
    {
      success: true,
      data,
      meta: {
        requestId: c.get('requestId'),
        ...(options.pagination
          ? { pagination: options.pagination }
          : {}),
      },
    },
    status,
  )
}

export function errorResponse<Status extends ContentfulStatusCode>(
  c: Context<AppBindings>,
  code: string,
  message: string,
  status: Status,
  details?: unknown,
) {
  return c.json<ApiFailure, Status>(
    {
      success: false,
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
      },
      meta: { requestId: c.get('requestId') },
    },
    status,
  )
}
