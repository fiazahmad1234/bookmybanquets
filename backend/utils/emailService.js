const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #8B5E3C 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; letter-spacing: 2px; }
    .header p { color: #D4A76A; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px 30px; }
    .body h2 { color: #1a1a2e; margin-top: 0; }
    .body p { color: #555; line-height: 1.7; }
    .btn { display: inline-block; background: linear-gradient(135deg, #8B5E3C, #D4A76A); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .booking-details { background: #f9f5f0; border-left: 4px solid #8B5E3C; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .booking-details table { width: 100%; border-collapse: collapse; }
    .booking-details td { padding: 8px 0; color: #555; }
    .booking-details td:first-child { font-weight: bold; color: #333; width: 40%; }
    .footer { background: #1a1a2e; padding: 20px; text-align: center; color: #888; font-size: 12px; }
    .footer a { color: #D4A76A; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ BookMyBanquets</h1>
      <p>Premium Event Venue Booking Platform</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© 2025 BookMyBanquets. All rights reserved.</p>
      <p><a href="#">Visit Website</a> | <a href="#">Support</a> | <a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

exports.sendWelcomeEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🎉 Welcome to BookMyBanquets!',
    html: emailTemplate(`
      <h2>Welcome, ${name}! 🎊</h2>
      <p>Thank you for joining BookMyBanquets — Pakistan's premier banquet hall booking platform.</p>
      <p>Please verify your email address to get started:</p>
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      <p style="color: #999; font-size: 13px;">If you didn't create an account, please ignore this email.</p>
    `)
  });
};

exports.sendBookingConfirmationEmail = async (email, name, booking, hall) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `📋 Booking Request Submitted - ${hall.name}`,
    html: emailTemplate(`
      <h2>Booking Request Submitted! 📋</h2>
      <p>Hi ${name}, your booking request has been submitted and is awaiting confirmation.</p>
      <div class="booking-details">
        <table>
          <tr><td>Hall:</td><td>${hall.name}</td></tr>
          <tr><td>Event Type:</td><td>${booking.event_type}</td></tr>
          <tr><td>Event Date:</td><td>${new Date(booking.event_date).toDateString()}</td></tr>
          <tr><td>Time:</td><td>${booking.start_time} - ${booking.end_time}</td></tr>
          <tr><td>Guests:</td><td>${booking.guest_count}</td></tr>
          <tr><td>Total Amount:</td><td>PKR ${Number(booking.total_amount).toLocaleString()}</td></tr>
          <tr><td>Advance Payment:</td><td>PKR ${Number(booking.advance_payment).toLocaleString()}</td></tr>
        </table>
      </div>
      <p>You'll receive another email once the hall manager confirms your booking.</p>
    `)
  });
};

exports.sendPasswordResetEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🔐 Password Reset Request',
    html: emailTemplate(`
      <h2>Password Reset Request 🔐</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="color: #999; font-size: 13px;">This link expires in 10 minutes. If you didn't request this, please ignore this email.</p>
    `)
  });
};
