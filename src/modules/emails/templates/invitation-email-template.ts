import { formatExpirationDate } from "../utils";

export function invitationEmailTemplate(input: {
  actionLink: string;
  organizationName?: string;
  expiresAt: string;
}) {
  const organizationText = input.organizationName
    ? ` para ${escapeHtml(input.organizationName)}`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2>Has sido invitado a Store Check</h2>

      <p>
        Recibiste una invitación${organizationText}.
      </p>

      <p>
        <a href="${escapeHtml(input.actionLink)}"
           style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
          Aceptar invitación
        </a>
      </p>

      <p style="color:#666;font-size:14px;">
        Este enlace vence el ${formatExpirationDate(input.expiresAt)}.
      </p>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
