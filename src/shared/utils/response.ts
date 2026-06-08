import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import type { AppBindings } from '../types/context'

export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

interface SuccessResponseOptions {
  pagination?: PaginationMeta
}

type SnakeCase<Key extends string> =
  Key extends `${infer Character}${infer Rest}`
    ? Character extends Lowercase<Character>
      ? `${Character}${SnakeCase<Rest>}`
      : `_${Lowercase<Character>}${SnakeCase<Rest>}`
    : Key

export type SnakeCaseKeys<Value> =
  Value extends readonly (infer Item)[]
    ? SnakeCaseKeys<Item>[]
    : Value extends object
      ? {
          [Key in keyof Value as Key extends string
            ? SnakeCase<Key>
            : Key]: SnakeCaseKeys<Value[Key]>
        }
      : Value

export interface ApiSuccess<T> {
  success: true
  data: SnakeCaseKeys<T>
  meta: {
    pagination?: PaginationMeta
    request_id: string
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
    request_id: string
  }
}

function toSnakeCase(value: string): string {
  return value.replace(/[A-Z]/gu, (character) => `_${character.toLowerCase()}`)
}

function snakeCaseKeys<Value>(value: Value): SnakeCaseKeys<Value> {
  if (Array.isArray(value)) {
    const items = value as unknown[]
    return items.map((item) => snakeCaseKeys(item)) as SnakeCaseKeys<Value>
  }

  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(record).map(([key, item]) => [
        toSnakeCase(key),
        snakeCaseKeys(item),
      ]),
    ) as SnakeCaseKeys<Value>
  }

  return value as SnakeCaseKeys<Value>
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
      data: snakeCaseKeys(data),
      meta: {
        request_id: c.get('requestId'),
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
        ...(details === undefined
          ? {}
          : { details: snakeCaseKeys(details) }),
      },
      meta: { request_id: c.get('requestId') },
    },
    status,
  )
}
