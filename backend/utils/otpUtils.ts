import nodemailer from 'nodemailer';

export const generateOTP = (): string => {
  // Generates a random 4 digit number
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const sendOTP = async (email: string, otp: string) => {
  // 1. Configure the email transporter
  // For production, you can use Gmail, SendGrid, or any SMTP service.
  // Make sure to put these credentials in your .env file!
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-email-password', // Note: use Gmail App Passwords
    },
  });

  // 2. Define the email content
  const mailOptions = {
    from: '"AhbizPay Support" <support@ahbizpay.com>',
    to: email,
    subject: 'Your Account Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verify Your Email</h2>
        <p>Thank you for registering on AhbizPay.</p>
        <p>Your One-Time Password (OTP) for verification is:</p>
        <h1 style="color: #6366FF; letter-spacing: 2px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    // 3. Send the email
    // In production, uncomment the line below to actually send real emails!
    // await transporter.sendMail(mailOptions); 
    
    // For development, we simulate the email by printing it to the console
    console.log(`[SIMULATED EMAIL] Sending OTP ${otp} to email address ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};
