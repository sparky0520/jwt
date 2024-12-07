const nodemailer = require("nodemailer");

function sendResetEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "svno863@gmail.com",
      pass: "Sparky@2005",
    },
  });

  const resetLink = `https://localhost:${process.env.SERVER_PORT}/reset-password?token=${token}`;

  const mailOptions = {
    from: "svno863@gmail.com",
    to: email,
    subject: "Password Reset Request",
    text: `Click on the following link to reset your password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

module.exports = sendResetEmail;
