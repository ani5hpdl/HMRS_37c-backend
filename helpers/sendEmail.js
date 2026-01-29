const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
    try {
        //Creating Transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html
        });

        console.log("Email Sent Sucessfully");
        return true;
    } catch (error) {
        console.log("Email error: ", error.message);
        return false;
    }
}

const verificationEmailTemplate = (name, verificationLink) => {
    return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" style="padding:40px 10px;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:30px;">
                        <tr>
                            <td align="center">
                                <h2 style="color:#333333; margin-bottom:20px;">
                                    Verify Your Email Address
                                </h2>
                            </td>
                        </tr>

                        <tr>
                            <td style="color:#555555; font-size:16px; line-height:24px; text-align:center;">
                                Hello ${name || "there"},<br><br>
                                Thank you for registering. Please confirm your email address by clicking the button below.
                            </td>
                        </tr>

                        <tr>
                            <td align="center" style="padding:30px 0;">
                                <a href="${verificationLink}"
                                   style="
                                       background-color:#007BFF;
                                       color:#ffffff;
                                       text-decoration:none;
                                       padding:14px 30px;
                                       border-radius:6px;
                                       font-size:16px;
                                       font-weight:bold;
                                       display:inline-block;
                                   ">
                                    Verify Email
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td style="color:#888888; font-size:13px; line-height:20px; text-align:center;">
                                If you did not create an account, you can safely ignore this email.
                            </td>
                        </tr>

                        <tr>
                            <td style="padding-top:30px; text-align:center; font-size:12px; color:#aaaaaa;">
                                © ${new Date().getFullYear()} Your App Name. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

const forgetPasswordTemplate = (name, verificationLink) => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Reset Your Password</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:6px; padding:30px;">
            <tr>
              <td style="text-align:center; padding-bottom:20px;">
                <h2 style="margin:0; color:#333333;">Reset Your Password</h2>
              </td>
            </tr>

            <tr>
              <td style="color:#555555; font-size:14px; line-height:22px;">
                <p>Hello ${name},</p>

                <p>
                  We received a request to reset the password for your
                  <strong>Luxe Stay</strong> account.
                </p>

                <p style="text-align:center; margin:30px 0;">
                  <a href="${verificationLink}"
                     style="background-color:#007bff; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:4px; display:inline-block; font-weight:bold;">
                    Reset Password
                  </a>
                </p>

                <p>
                  This link will expire in <strong>1 hour</strong>.
                </p>

                <p>
                  If you didn’t request a password reset, you can safely ignore
                  this email.
                </p>

                <p>
                  Need help? Contact us at
                  <a href="mailto:anishpoudel635@gmail.com" style="color:#007bff; text-decoration:none;">
                    anishpoudel635@gmail.com
                  </a>
                </p>

                <p style="margin-top:30px;">
                  Thanks,<br />
                  The Luxe Stay Team
                </p>
              </td>
            </tr>
          </table>

          <p style="font-size:12px; color:#999999; margin-top:15px;">
            © 2025 Luxe Stay. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
};


module.exports = { sendEmail, verificationEmailTemplate, forgetPasswordTemplate }