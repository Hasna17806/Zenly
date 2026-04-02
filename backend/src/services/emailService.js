import nodemailer from "nodemailer";

export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ Gmail transporter is ready");

    const mailOptions = {
      from: `"Zenly Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Zenly Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>Click the button below to reset your Zenly password:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#0f766e;color:white;text-decoration:none;border-radius:8px;">
            Reset Password
          </a>
          <p style="margin-top:20px;">This link will expire in 1 hour.</p>
          <p>If the button doesn't work, use this link:</p>
          <p>${resetUrl}</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.response);

  } catch (error) {
    console.error("❌ Error sending password reset email:", error.message);
    throw new Error("Failed to send reset email");
  }
};