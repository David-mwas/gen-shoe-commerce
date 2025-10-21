const nodemailer = require("nodemailer");
let mjml2html = null;
try {
  mjml2html = require("mjml");
} catch (e) {
  // mjml optional; if not installed we'll fall back to basic HTML
  mjml2html = null;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const fromObj = {
    name: "ShoeStore",
    address: from,
  };
  return transporter.sendMail({ from: fromObj, to, subject, text, html });
}

function compileResetPasswordHtml({ name, resetUrl }) {
  if (mjml2html) {
    const mjml = `
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-text font-size="20px" font-weight="bold">Reset your password</mj-text>
              <mj-text>Hello ${name || "there"},</mj-text>
              <mj-text>You recently requested to reset your password. Click the button below to create a new password.</mj-text>
              <mj-button href="${resetUrl}" background-color="#111827">Reset password</mj-button>
              <mj-text font-size="12px" color="#555">If you didn't request this, ignore this email. The link expires in 1 hour.</mj-text>
              <mj-text font-size="20px" font-weight="bold">Best regards, ShoeStore</mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
    const { html } = mjml2html(mjml);
    return html;
  }

  // fallback plain HTML
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111;">
      <h2>Reset your password</h2>
      <p>Hello ${name || "there"},</p>
      <p>You recently requested to reset your password. Click the link below to create a new password (expires in 1 hour):</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;border-radius:6px;text-decoration:none;">Reset password</a></p>
      <p>If you didn't request this, ignore this email.</p>
      <h2>Best regards, ShoeStore</h2>
    </div>
  `;
}

function compileContactHtml({ name, email, message }) {
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111;">
      <h3>Contact message from ${name} &lt;${email}&gt;</h3>
      <div>${String(message).replace(/\n/g, "<br/>")}</div>
    </div>
  `;
}

module.exports = {
  sendMail,
  compileResetPasswordHtml,
  compileContactHtml,
};
