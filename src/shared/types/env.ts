export type Environment = 'development' | 'preview' | 'production' | 'test'

export interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  FRONTEND_URL: string
  RESEND_API_KEY: string
  EMAIL_FROM: string
  ENVIRONMENT: Environment
  CORS_ORIGINS?: string
}
