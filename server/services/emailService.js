const nodemailer = require('nodemailer');

const DEMO_MODE = process.env.DEMO_MODE === 'true';

const transporter = DEMO_MODE ? null : nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendInvite = async (user) => {
    if (DEMO_MODE) {
        console.log(`[Demo mode] Skipping real email — would have invited ${user.email}`);
        return;
    }

    await transporter.sendMail({
        from: `"StudentSafe" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "You've been invited to StudentSafe",
        html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #0f3e8c;">Welcome to StudentSafe</h2>
                <p>Hi ${user.name},</p>
                <p>You have been given access to <strong>StudentSafe</strong>, your school's student safeguarding system.</p>
                <p>To get started, click the link below and sign in using your school Google account:</p>
                <p style="margin: 24px 0;">
                    <a href="${process.env.APP_URL}" style="background-color: #0f3e8c; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">
                        Sign in to StudentSafe
                    </a>
                </p>
                <p style="color: #666; font-size: 0.9rem;">If you have any questions, please contact your school administrator.</p>
            </div>
        `,
    });
};

module.exports = { sendInvite };
