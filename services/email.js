const nodemailer = require('nodemailer');
require('dotenv').config();

const BASE_URL = 'http://hera-playalmi.switzerlandnorth.cloudapp.azure.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#080810;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080810;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:#0d0d1a;border-top:3px solid #7B2FBE;border-left:1px solid #1e1830;border-right:1px solid #1e1830;padding:32px 40px;text-align:center;">
            <img src="${BASE_URL}/img/logoJuego.png" alt="Age of The Dead" style="max-width:280px;height:auto;display:block;margin:0 auto 16px;"/>
            <div style="height:1px;background:linear-gradient(90deg,transparent,#7B2FBE,#1ABC9C,transparent);margin-top:16px;"></div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#12121e;border-left:1px solid #1e1830;border-right:1px solid #1e1830;padding:40px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0d0d1a;border:1px solid #1e1830;border-top:none;padding:24px 40px;text-align:center;">
            <img src="${BASE_URL}/img/LogoEmpresa.png" alt="HERA Studio" style="height:28px;opacity:0.6;margin-bottom:12px;display:block;margin:0 auto 12px;"/>
            <p style="color:#5a5070;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Georgia,serif;margin:0;">
              © 2026 HERA Studio — Age of The Dead
            </p>
            <p style="color:#3a3050;font-size:11px;margin:8px 0 0;">
              You received this email because you registered at Age of The Dead.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const sendWelcomeEmail = async (to, username) => {
  const content = `
    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#1ABC9C;margin:0 0 8px;letter-spacing:2px;">
      Welcome, ${username}!
    </h1>
    <p style="color:#5a5070;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px;">
      Your legend begins now
    </p>

    <div style="height:1px;background:#1e1830;margin:0 0 24px;"></div>

    <p style="color:#a89ec0;font-size:15px;line-height:1.8;margin:0 0 16px;">
      The realm of the dead awaits you. You have joined the ranks of warriors who dare to face the undead horde.
    </p>
    <p style="color:#a89ec0;font-size:15px;line-height:1.8;margin:0 0 32px;">
      Survive the onslaught, climb the rankings and carve your name into the <strong style="color:#f0ece8;">Hall of The Dead</strong>.
    </p>

    <!-- STATS BOX -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr>
        <td width="33%" style="background:#0d0d1a;border:1px solid #1e1830;border-right:none;padding:16px;text-align:center;">
          <div style="font-family:Georgia,serif;font-size:22px;color:#1ABC9C;font-weight:bold;">3</div>
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5a5070;margin-top:4px;">Difficulties</div>
        </td>
        <td width="33%" style="background:#0d0d1a;border:1px solid #1e1830;border-right:none;padding:16px;text-align:center;">
          <div style="font-family:Georgia,serif;font-size:22px;color:#7B2FBE;font-weight:bold;">∞</div>
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5a5070;margin-top:4px;">Enemies</div>
        </td>
        <td width="33%" style="background:#0d0d1a;border:1px solid #1e1830;padding:16px;text-align:center;">
          <div style="font-family:Georgia,serif;font-size:22px;color:#e74c3c;font-weight:bold;">1</div>
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5a5070;margin-top:4px;">Champion</div>
        </td>
      </tr>
    </table>

    <!-- CTA BUTTON -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${BASE_URL}" style="display:inline-block;background:linear-gradient(135deg,#7B2FBE,#5a1e8e);color:#ffffff;text-decoration:none;padding:16px 48px;font-family:Georgia,serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;border:1px solid #9b4fd4;">
            Enter the Battle
          </a>
        </td>
      </tr>
    </table>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: '⚔️ Welcome to Age of The Dead, ' + username + '!',
    html: emailWrapper(content)
  });
};

const sendPasswordResetEmail = async (to, username, resetToken) => {
  const resetUrl = `${BASE_URL}/reset-password.html?token=${resetToken}`;

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#e74c3c;margin:0 0 8px;letter-spacing:2px;">
      Password Reset
    </h1>
    <p style="color:#5a5070;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px;">
      Requested by ${username}
    </p>

    <div style="height:1px;background:#1e1830;margin:0 0 24px;"></div>

    <p style="color:#a89ec0;font-size:15px;line-height:1.8;margin:0 0 16px;">
      Hi <strong style="color:#f0ece8;">${username}</strong>, we received a request to reset your password.
    </p>
    <p style="color:#a89ec0;font-size:15px;line-height:1.8;margin:0 0 32px;">
      Click the button below to set a new password. This link will expire in <strong style="color:#e74c3c;">1 hour</strong>.
    </p>

    <!-- WARNING BOX -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr>
        <td style="background:#1a0808;border:1px solid #c0392b;border-left:3px solid #e74c3c;padding:16px 20px;">
          <p style="color:#e74c3c;font-size:12px;letter-spacing:1px;margin:0;">
            ⚠️ If you did not request this reset, ignore this email. Your password will remain unchanged.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA BUTTON -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#c0392b,#8e1e1e);color:#ffffff;text-decoration:none;padding:16px 48px;font-family:Georgia,serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;border:1px solid #e74c3c;">
            Reset My Password
          </a>
        </td>
      </tr>
    </table>

    <p style="color:#3a3050;font-size:12px;text-align:center;margin:0;">
      Or copy this link: <a href="${resetUrl}" style="color:#7B2FBE;word-break:break-all;">${resetUrl}</a>
    </p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: '🔑 Reset your Age of The Dead password',
    html: emailWrapper(content)
  });
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
