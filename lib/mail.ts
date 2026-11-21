import nodemailer, { type Transporter } from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

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

const appName = () => process.env.NEXT_PUBLIC_APP_NAME || "Meta5VIP";
const appUrl = () => (process.env.APP_URL || "").replace(/\/$/, "");
const supportEmail = () => process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@meta5vip.com";

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

export interface MailAttachment {
  filename: string;
  path?: string;
  content?: Buffer | string;
  cid?: string;
  contentType?: string;
}

export interface SendMailOptions {
  attachments?: MailAttachment[];
  from?: string;
}

/** Sends an email. Never throws: failures are logged so they can't break the request that triggered them. */
export async function sendMail(
  to: string | string[],
  subject: string,
  html: string,
  options?: SendMailOptions,
): Promise<boolean> {
  if (!mailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[mail:dev] To: ${Array.isArray(to) ? to.join(", ") : to} | Subject: ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`);
    } else {
      console.warn("[mail] ZOHO_SMTP_USER / ZOHO_SMTP_PASS not set; email skipped:", subject);
    }
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: options?.from || process.env.MAIL_FROM || `"${appName()}" <${process.env.ZOHO_SMTP_USER}>`,
      to,
      subject,
      html,
      attachments: options?.attachments,
    });
    return true;
  } catch (err) {
    console.error("[mail] send failed:", subject, err);
    return false;
  }
}

async function adminEmails(): Promise<string[]> {
  const configured = (process.env.ADMIN_NOTIFY_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", status: "ACTIVE" },
      select: { email: true },
    });
    const zohoMailbox = process.env.ZOHO_SMTP_USER?.trim().toLowerCase();
    return [...new Set([
      ...configured,
      ...admins.map((admin) => admin.email.trim().toLowerCase()),
      ...(zohoMailbox ? [zohoMailbox] : []),
    ])];
  } catch (error) {
    console.error("[mail] Could not load administrator recipients:", error);
    const zohoMailbox = process.env.ZOHO_SMTP_USER?.trim().toLowerCase();
    return [...new Set([...configured, ...(zohoMailbox ? [zohoMailbox] : [])])];
  }
}

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export async function notifyAdminDeposit(d: {
  userEmail: string;
  amount: number;
  currency: string;
  txHash?: string | null;
  hasReceipt: boolean;
  transactionId: string;
}) {
  const to = await adminEmails();
  if (to.length === 0) {
    console.error("[mail] Deposit alert has no administrator recipient configured");
    return false;
  }
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

export async function notifyAdminWithdrawal(w: {
  userEmail: string;
  amount: number;
  currency: string;
  address: string;
  transactionId: string;
}) {
  const to = await adminEmails();
  if (to.length === 0) {
    console.error("[mail] Withdrawal alert has no administrator recipient configured");
    return false;
  }
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

/** Welcome message sent once a newly registered account has been committed. */
export function sendWelcomeEmail(to: string, firstName: string) {
  const safeName = escapeHtml(firstName.trim() || "Trader");
  const currentAppName = process.env.WELCOME_EMAIL_APP_NAME || "Meta Gold 5";
  const safeAppName = escapeHtml(currentAppName);
  const safeSupportEmail = escapeHtml(supportEmail());
  const dashboardUrl = appUrl() ? `${appUrl()}/dashboard` : "";
  const dashboardButton = dashboardUrl
    ? `<tr><td style="padding:6px 0 28px">
        <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#f59e0b;color:#111418;text-decoration:none;font-size:15px;font-weight:700;line-height:20px;padding:12px 24px;border-radius:8px">Open your dashboard</a>
      </td></tr>`
    : "";

  const logoFile = path.join(process.cwd(), "public", "images", "logo-gold.png");
  const hasLocalLogo = fs.existsSync(logoFile);
  const logoHtml = hasLocalLogo
    ? `<img src="cid:metagold-logo" alt="${safeAppName}" width="44" height="52" style="display:block;width:44px;height:52px;max-width:44px;border:0;outline:none;text-decoration:none" />`
    : `<div style="font-size:26px;font-weight:800;color:#f59e0b;letter-spacing:1px">${safeAppName}</div>`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Welcome to ${safeAppName}</title>
  </head>
  <body style="margin:0;padding:0;background:#111318;color:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#111318;border-collapse:collapse">
      <tr>
        <td align="center" style="padding:32px 14px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:580px;background:#1d2026;border:1px solid #2e323b;border-collapse:separate;border-spacing:0;border-radius:14px">
            <tr>
              <td style="padding:40px 42px 16px">
                <!-- Meta Gold 5 Emblem -->
                ${logoHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:4px 42px 36px">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
                  <tr><td style="padding:0 0 24px;font-size:22px;font-weight:700;line-height:1.35;color:#ffffff">Hello ${safeName},</td></tr>
                  <tr><td style="padding:0 0 26px;font-size:22px;font-weight:700;line-height:1.4;color:#ffffff">Thank you for signing up to<br>${safeAppName}</td></tr>
                  <tr><td style="padding:0 0 26px;font-size:16px;line-height:1.65;color:#d1d5db">Our platform helps you navigate the intricate world of trading with ease and confidence. Whether you're a seasoned trader or just starting out, our intuitive interface, real-time data analytics, and dedicated support ensure that you're always in the best position to make informed decisions and maximize your earnings.</td></tr>
                  <tr><td style="padding:0 0 26px;font-size:16px;line-height:1.65;color:#d1d5db">Dive in, and let us be your trusted partner in your trading journey.</td></tr>
                  ${dashboardButton}
                  <tr><td style="padding:0 0 26px;font-size:16px;line-height:1.65;color:#d1d5db">For enquiries, you can always reach us via email:<br><a href="mailto:${safeSupportEmail}" style="color:#60a5fa;text-decoration:underline">${safeSupportEmail}</a></td></tr>
                  <tr><td style="font-size:16px;line-height:1.6;color:#ffffff">Thank you,<br>The ${safeAppName} team</td></tr>
                </table>
              </td>
            </tr>
          </table>
          <div style="padding:16px 8px 0;color:#717682;font-size:12px;line-height:1.5">This message was sent because an account was registered using this email address. Ref: M5G-${Date.now().toString(36).toUpperCase()}</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const attachments: MailAttachment[] = hasLocalLogo
    ? [
        {
          filename: "logo-gold.png",
          path: logoFile,
          cid: "metagold-logo",
          contentType: "image/png",
        },
      ]
    : [];

  const senderName = process.env.MAIL_SENDER_NAME || currentAppName;
  const from = `"${senderName}" <${process.env.ZOHO_SMTP_USER || "support@meta5vip.com"}>`;

  return sendMail(to, `Welcome to ${currentAppName}`, html, { attachments, from });
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

/** Receipt sent to the investor as soon as a deposit is submitted. */
export function sendDepositReceivedEmail(
  to: string,
  d: { reference: string; units: number; symbol: string; network: string | null; usdAmount: number; txHash: string | null },
) {
  return sendMail(
    to,
    `We received your ${d.symbol} deposit (${d.reference})`,
    layout(
      "Deposit received",
      "Thanks, we've received your deposit details. Our team will confirm the payment and credit your balance. You'll get another email once it's approved.",
      [
        ["Reference", d.reference],
        ["Amount", `${Number(d.units.toFixed(8))} ${d.symbol}${d.network ? ` (${d.network})` : ""}`],
        ["Value at submission", usd(d.usdAmount)],
        ["Transaction hash", d.txHash || "Screenshot provided"],
        ["Status", "Pending review"],
      ],
      appUrl() ? { label: "View my deposits", url: `${appUrl()}/deposit` } : undefined,
    ),
  );
}

export function sendVerificationStatusEmail(
  to: string,
  approved: boolean,
  reason?: string,
) {
  const currentAppName = appName();
  const rows: [string, string][] = [["Status", approved ? "Verified" : "Rejected"]];
  if (reason && !approved) {
    rows.push(["Reason", reason]);
  }
  return sendMail(
    to,
    approved
      ? `Your ${currentAppName} account has been verified`
      : `Your ${currentAppName} verification update`,
    layout(
      approved ? "Account verified" : "Verification update",
      approved
        ? `Congratulations! Your identity documents have been approved and your account is now verified. You have unlocked higher withdrawal limits and all advanced trading features.`
        : `Your identity verification submission could not be approved${reason ? `: ${reason}` : "."} You can submit new verification documents at any time from your account settings.`,
      rows,
      appUrl() ? { label: "Go to Dashboard", url: `${appUrl()}/dashboard` } : undefined,
    ),
  );
}
