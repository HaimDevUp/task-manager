export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface EmailLayoutOptions {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  taskTitle: string;
  metaRows?: { label: string; value: string }[];
  ctaLabel: string;
  ctaUrl: string;
  accent: string;
  accentSoft: string;
  emoji: string;
  footerNote?: string;
  /** יישור מרכזי לכותרת (אימוג׳י, eyebrow, title), כפתור, הערת פוטר ושורת המותג */
  footerCentered?: boolean;
}

export function buildEmailFromLayout(options: EmailLayoutOptions): {
  html: string;
  text: string;
} {
  const metaHtml =
    options.metaRows
      ?.map(
        (row) => `
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:13px;width:96px;vertical-align:top;text-align:right;direction:rtl;">${escapeHtml(row.label)}</td>
          <td style="padding:6px 0 6px 12px;color:#0f172a;font-size:14px;font-weight:600;text-align:right;direction:rtl;">${escapeHtml(row.value)}</td>
        </tr>`
      )
      .join("") ?? "";

  const footerAlign = options.footerCentered ? "center" : "right";
  const footerTextAlign = options.footerCentered ? "center" : "right";
  const headerTextAlign = options.footerCentered ? "center" : "right";

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body dir="rtl" style="margin:0;padding:0;background:transparent;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;text-align:right;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preheader)}</div>
  <table role="presentation" dir="rtl" width="100%" cellspacing="0" cellpadding="0" style="background:transparent;padding:16px 0;">
    <tr>
      <td align="right" style="direction:rtl;text-align:right;">
        <table role="presentation" dir="rtl" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;direction:rtl;">
          <tr>
            <td dir="rtl" style="padding:24px 24px 20px;background:linear-gradient(135deg, ${options.accent} 0%, ${options.accentSoft} 100%);text-align:${headerTextAlign};direction:rtl;">
              <div style="font-size:32px;line-height:1;margin-bottom:10px;text-align:${headerTextAlign};">${options.emoji}</div>
              <div style="font-size:12px;letter-spacing:0.04em;color:rgba(255,255,255,0.9);font-weight:700;margin-bottom:6px;text-align:${headerTextAlign};">${escapeHtml(options.eyebrow)}</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.4;font-weight:800;text-align:${headerTextAlign};direction:rtl;">${escapeHtml(options.title)}</h1>
            </td>
          </tr>
          <tr>
            <td dir="rtl" style="padding:22px 24px 8px;text-align:right;direction:rtl;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.7;text-align:right;direction:rtl;">${escapeHtml(options.intro)}</p>
              <table role="presentation" dir="rtl" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;direction:rtl;">
                <tr>
                  <td dir="rtl" style="padding:16px 18px;text-align:right;direction:rtl;">
                    <div style="font-size:12px;color:#64748b;margin-bottom:6px;text-align:right;">כותרת המשימה</div>
                    <div style="font-size:18px;line-height:1.4;color:#0f172a;font-weight:800;text-align:right;direction:rtl;">${escapeHtml(options.taskTitle)}</div>
                    ${metaHtml ? `<table role="presentation" dir="rtl" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;direction:rtl;">${metaHtml}</table>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td dir="rtl" align="${footerAlign}" style="padding:8px 24px 16px;text-align:${footerTextAlign};direction:rtl;">
              <a href="${escapeHtml(options.ctaUrl)}" style="display:inline-block;background:${options.accent};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:12px 24px;border-radius:10px;direction:rtl;">${escapeHtml(options.ctaLabel)}</a>
              ${options.footerNote ? `<p style="margin:16px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:${footerTextAlign};direction:rtl;">${escapeHtml(options.footerNote)}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td dir="rtl" align="${footerAlign}" style="padding:0 24px 20px;text-align:${footerTextAlign};direction:rtl;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:${footerTextAlign};">UpNext Manager · ניהול משימות</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const metaText =
    options.metaRows?.map((row) => `${row.label}: ${row.value}`).join("\n") ??
    "";

  const text = [
    options.title,
    "",
    options.intro,
    "",
    `משימה: ${options.taskTitle}`,
    metaText,
    "",
    `${options.ctaLabel}: ${options.ctaUrl}`,
    options.footerNote ?? "",
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}
