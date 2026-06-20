import { Resend } from "resend";
import { AppError } from "../../shared/errors/app-error";
import { ErrorCode } from "../../shared/errors/error-codes";
import type { Env } from "../../shared/types/env";
import { invitationEmailTemplate } from "../emails/templates/invitation-email-template";

export interface InvitationMailer {
  sendInvitation(input: {
    email: string;
    actionLink: string;
    expiresAt: string;
    type: string;
    organizationName: string;
  }): Promise<void>;
}

export class ResendInvitationMailer implements InvitationMailer {
  constructor(private readonly env: Env) {}

  async sendInvitation(
    input: Parameters<InvitationMailer["sendInvitation"]>[0],
  ): Promise<void> {
    const { actionLink, expiresAt, organizationName, email } = input;
    const resend = new Resend(this.env.RESEND_API_KEY);

    const response = await resend.emails.send({
      from: "STORE-CHECK <onboarding@resend.dev>",
      to: [email],
      subject: "Invitación para unirse a Store Check",
      html: invitationEmailTemplate({
        actionLink,
        expiresAt,
        organizationName,
      }),
    });
    if (response.error) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        message: response.error.message,
        status: 502,
      });
    }
  }
}
