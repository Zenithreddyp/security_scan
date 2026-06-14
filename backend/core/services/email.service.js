import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendEmailOtp(email, otp) {
    await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your email",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>Email Verification</title>
            </head>
            <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:30px 0;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden;">
                                <tr>
                                    <td style="background-color:#111827; padding:25px; text-align:center;">
                                        <h1 style="margin:0; color:#ffffff; font-size:24px;">
                                            Verify Your Email
                                        </h1>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:30px; color:#333333;">
                                        <h2 style="margin-top:0; font-size:22px;">
                                            Hello,
                                        </h2>

                                        <p style="font-size:16px; line-height:1.6;">
                                            Thank you for registering. Please use the OTP below to verify your email address.
                                        </p>

                                        <div style="text-align:center; margin:30px 0;">
                                            <div style="display:inline-block; background-color:#f3f4f6; padding:18px 35px; border-radius:8px; letter-spacing:6px; font-size:32px; font-weight:bold; color:#111827;">
                                                ${otp}
                                            </div>
                                        </div>

                                        <p style="font-size:16px; line-height:1.6;">
                                            This OTP will expire in <strong>10 minutes</strong>.
                                        </p>

                                        <p style="font-size:14px; color:#666666; line-height:1.6;">
                                            If you did not create this account, you can safely ignore this email.
                                        </p>

                                        <p style="font-size:16px; margin-top:30px;">
                                            Regards,<br />
                                            <strong>Your App Team</strong>
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="background-color:#f9fafb; padding:18px; text-align:center; font-size:12px; color:#777777;">
                                        © ${new Date().getFullYear()} Your App. All rights reserved.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `,
    });
}
