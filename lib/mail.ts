import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outgoing email through Zoho Mail SMTP.
 *
 * Env vars:
 *   ZOHO_SMTP_USER      the Zoho mailbox, e.g. support@yourdomain.com
 *   ZOHO_SMTP_PASS      an app-specific password (Zoho > Account > Security > App passwords)
 *   ZOHO_SMTP_HOST      optional, default smtp.zoho.com (use smtp.zoho.eu / smtp.zoho.in /
 *                       smtppro.zoho.com to match your Zoho data centre / plan)
 *   MAIL_FROM           optional display sender, default "<APP_NAME> <ZOHO_SMTP_USER>"
 *   ADMIN_NOTIFY_EMAIL  where admin alerts (new deposits, withdrawals) are sent
 *
 * If SMTP isn't configured, emails are logged to the server console in development
 * and skipped in production, so the app keeps working without mail.
 */

let transporter: Transporter | null = null;

export function mailConfigured(): boolean {
  return Boolean(process.env.ZOHO_SMTP_USER && process.env.ZOHO_SMTP_PASS);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: { user: process.env.ZOHO_SMTP_USER, pass: process.env.ZOHO_SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

const appName = () => process.env.NEXT_PUBLIC_APP_NAME || "Meta Gold 5";
const appUrl = () => (process.env.APP_URL || "").replace(/\/$/, "");

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Simple, email-client-safe layout. `rows` render as a label/value table. */
function layout(title: string, intro: string, rows: [string, string][] = [], cta?: { label: string; url: string }) {
  const table = rows.length
    ? `<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;margin:16px 0;font-size:14px">${rows
        .map(
          ([k, v]) =>
            `<tr><td style="color:#666;border-bottom:1px solid #eee;width:40%">${escapeHtml(k)}</td><td style="border-bottom:1px solid #eee;font-weight:600">${escapeHtml(v)}</td></tr>`,
        )
        .join("")}</table>`
    : "";
  const button = cta
    ? `<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="background:#3861fb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#111">
<div style="max-width:560px;margin:0 auto;padding:24px">
<div style="background:#fff;border-radius:12px;padding:28px">
<h2 style="margin:0 0 12px;font-size:20px">${escapeHtml(title)}</h2>
<p style="margin:0;font-size:14px;line-height:1.6;color:#333">${intro}</p>
${table}${button}
</div>
<p style="font-size:12px;color:#999;text-align:center;margin-top:16px">${escapeHtml(appName())}</p>
</div></body></html>`;
}

/** Sends an email. Never throws: failures are logged so they can't break the request that triggered them. */
export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!mailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[mail:dev] To: ${to} | Subject: ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`);
    } else {
      console.warn("[mail] ZOHO_SMTP_USER / ZOHO_SMTP_PASS not set; email skipped:", subject);
    }
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM || `"${appName()}" <${process.env.ZOHO_SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("[mail] send failed:", subject, err);
    return false;
  }
}

function adminEmail(): string | null {
  return process.env.ADMIN_NOTIFY_EMAIL || process.env.ZOHO_SMTP_USER || null;
}

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export function notifyAdminDeposit(d: {
  userEmail: string;
  amount: number;
  currency: string;
  txHash?: string | null;
  hasReceipt: boolean;
  transactionId: string;
}) {
  const to = adminEmail();
  if (!to) return Promise.resolve(false);
  return sendMail(
    to,
    `New deposit pending review: ${usd(d.amount)} from ${d.userEmail}`,
    layout(
      "New deposit awaiting review",
      "A user submitted a deposit. Verify the payment on-chain before approving it.",
      [
        ["User", d.userEmail],
        ["Amount", usd(d.amount)],
        ["Currency", d.currency],
        ["Transaction hash", d.txHash || "—"],
        ["Payment proof", d.hasReceipt ? "Screenshot attached in admin panel" : "None"],
        ["Reference", d.transactionId],
      ],
      appUrl() ? { label: "Open admin panel", url: `${appUrl()}/admin` } : undefined,
    ),
  );
}

export function notifyAdminWithdrawal(w: {
  userEmail: string;
  amount: number;
  currency: string;
  address: string;
  transactionId: string;
}) {
  const to = adminEmail();
  if (!to) return Promise.resolve(false);
  return sendMail(
    to,
    `New withdrawal request: ${usd(w.amount)} from ${w.userEmail}`,
    layout(
      "New withdrawal request",
      "A user requested a withdrawal. The funds are on hold until you approve or reject it.",
      [
        ["User", w.userEmail],
        ["Amount", usd(w.amount)],
        ["Asset", w.currency],
        ["Destination", w.address],
        ["Reference", w.transactionId],
      ],
      appUrl() ? { label: "Open admin panel", url: `${appUrl()}/admin` } : undefined,
    ),
  );
}

export function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendMail(
    to,
    `Reset your ${appName()} password`,
    layout(
      "Reset your password",
      "We received a request to reset your password. This link expires in 1 hour. If you didn't ask for this, you can ignore this email.",
      [],
      { label: "Reset password", url: resetUrl },
    ),
  );
}

export function sendWithdrawalCodeEmail(to: string, code: string, amountUsd: number | null) {
  return sendMail(
    to,
    `Your ${appName()} withdrawal confirmation code`,
    layout(
      "Confirm your withdrawal",
      `Use this code to confirm your withdrawal request${amountUsd ? ` of <b>${usd(amountUsd)}</b>` : ""}. It expires in 10 minutes. If you didn't request a withdrawal, change your password now.`,
      [["Confirmation code", code]],
    ),
  );
}

export function sendTransactionStatusEmail(
  to: string,
  t: { type: string; status: "APPROVED" | "REJECTED"; amount: number; currency: string },
) {
  const kind = t.type === "DEPOSIT" ? "deposit" : "withdrawal";
  const verb = t.status === "APPROVED" ? "approved" : "rejected";
  return sendMail(
    to,
    `Your ${kind} of ${usd(t.amount)} was ${verb}`,
    layout(
      `${kind[0].toUpperCase()}${kind.slice(1)} ${verb}`,
      t.status === "APPROVED"
        ? `Your ${kind} has been approved.`
        : `Your ${kind} was not approved.${kind === "withdrawal" ? " The held funds have been returned to your balance." : ""} Contact support if you have questions.`,
      [
        ["Amount", usd(t.amount)],
        ["Asset", t.currency],
      ],
    ),
  );
}
