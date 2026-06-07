import { AppError } from '../../shared/errors/app-error'
import { ErrorCode } from '../../shared/errors/error-codes'
import type { createAdminSupabaseClient } from '../../shared/supabase/admin'
import { createUserSupabaseClient } from '../../shared/supabase/client'
import type { Env } from '../../shared/types/env'
import type { AuthUserGateway } from './invitations.ports'

export class SupabaseAuthUserGateway implements AuthUserGateway {
  constructor(
    private readonly env: Env,
    private readonly adminSupabase: ReturnType<
      typeof createAdminSupabaseClient
    >,
  ) {}

  async getUser(accessToken: string) {
    const { data, error } = await createUserSupabaseClient(
      this.env,
      accessToken,
    ).auth.getUser(accessToken)

    if (error || !data.user.email) return null

    const metadataName: unknown = data.user.user_metadata.full_name

    return {
      id: data.user.id,
      email: data.user.email,
      fullName:
        typeof metadataName === 'string' && metadataName.trim()
          ? metadataName.trim()
          : (data.user.email.split('@')[0] ?? data.user.email),
    }
  }

  async createUser(input: {
    email: string
    password: string
    fullName: string
  }): Promise<{ id: string }> {
    const { data, error } = await this.adminSupabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
      },
    })

    if (error) {
      throw new AppError({
        code: ErrorCode.INVALID_REQUEST,
        message: 'The user account could not be created.',
        status: 409,
        cause: error,
      })
    }

    return { id: data.user.id }
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.adminSupabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Failed to compensate Auth user creation', {
        error,
        userId,
      })
    }
  }
}
