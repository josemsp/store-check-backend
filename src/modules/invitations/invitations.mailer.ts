import { AppError } from '../../shared/errors/app-error'
import { ErrorCode } from '../../shared/errors/error-codes'
import type { Env } from '../../shared/types/env'
import type { InvitationMailer } from './invitations.ports'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export class ResendInvitationMailer implements InvitationMailer {
  constructor(private readonly env: Env) {}

  async sendInvitation(
    input: Parameters<InvitationMailer['sendInvitation']>[0],
  ): Promise<void> {
    const invitationUrl = new URL('/invitations/accept', this.env.FRONTEND_URL)
    invitationUrl.searchParams.set('token', input.token)
    const organization = input.organizationName
      ? ` para ${escapeHtml(input.organizationName)}`
      : ''

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.env.EMAIL_FROM,
        to: [input.email],
        subject: 'Invitacion a Store Check',
        html: [
          '<h1>Te invitaron a Store Check</h1>',
          `<p>Recibiste una invitacion${organization}.</p>`,
          `<p><a href="${escapeHtml(invitationUrl.toString())}">Aceptar invitacion</a></p>`,
          `<p>Este enlace vence el ${escapeHtml(input.expiresAt)}.</p>`,
        ].join(''),
      }),
    })

    if (!response.ok) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        message: 'The invitation was created but the email could not be sent.',
        status: 502,
      })
    }
  }
}
