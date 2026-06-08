import { z } from '@hono/zod-openapi'

export const PaginationMetaSchema = z
  .object({
    page: z.number().int().positive().openapi({
      description: 'Current page number.',
      example: 1,
    }),
    page_size: z.number().int().positive().openapi({
      description: 'Maximum number of items per page.',
      example: 20,
    }),
    total_items: z.number().int().nonnegative().openapi({
      description: 'Total number of matching items.',
      example: 42,
    }),
    total_pages: z.number().int().nonnegative().openapi({
      description: 'Total number of available pages.',
      example: 3,
    }),
  })
  .openapi('PaginationMeta')

export const ResponseMetaSchema = z
  .object({
    request_id: z.string().openapi({
      description: 'Request correlation identifier.',
      example: '7ed8c8a8-e6f4-46dc-9d7a-3599bcf858d4',
    }),
    pagination: PaginationMetaSchema.optional().openapi({
      description: 'Pagination details for collection responses.',
    }),
  })
  .openapi('ResponseMeta')

export const ApiErrorSchema = z
  .object({
    code: z.string().openapi({
      description: 'Stable machine-readable error code.',
      example: 'VALIDATION_ERROR',
    }),
    message: z.string().openapi({
      description: 'Human-readable error message.',
      example: 'The request data is invalid.',
    }),
    details: z.unknown().optional().openapi({
      description: 'Optional structured context about the error.',
    }),
  })
  .openapi('ApiError')

export const ApiFailureSchema = z
  .object({
    success: z.literal(false),
    error: ApiErrorSchema,
    meta: ResponseMetaSchema,
  })
  .openapi('ApiFailure')

export function createSuccessSchema<T extends z.ZodType>(
  name: string,
  dataSchema: T,
) {
  return z
    .object({
      success: z.literal(true),
      data: dataSchema,
      meta: ResponseMetaSchema,
    })
    .openapi(name)
}

export function jsonResponse<T extends z.ZodType>(
  schema: T,
  description: string,
) {
  return {
    content: {
      'application/json': {
        schema,
      },
    },
    description,
  }
}
