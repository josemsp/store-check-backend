import type { Env } from '../../src/shared/types/env'

export const testEnv: Env = {
  CORS_ORIGINS: 'http://localhost:5173',
  EMAIL_FROM: 'Store Check <invitations@example.com>',
  ENVIRONMENT: 'test',
  FRONTEND_URL: 'http://localhost:5173',
  RESEND_API_KEY: 'test-resend-key',
  SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  SUPABASE_URL: 'https://example.supabase.co',
}
