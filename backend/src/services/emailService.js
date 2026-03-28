import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"Zenly Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Zenly Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0D9488 0%, #9333EA 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Zenly</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Your Wellness Companion</p>
        </div>
        
        <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #0D9488 0%, #9333EA 100%); 
                      color: white; 
                      padding: 14px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Or copy and paste this link into your browser:
            <br />
            <a href="${resetUrl}" style="color: #0D9488; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            If you didn't request this, please ignore this email or contact support.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 Zenly. All rights reserved.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};