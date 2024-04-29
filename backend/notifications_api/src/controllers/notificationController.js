const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587,
  auth: {
    user: process.env.MAILGUN_SMTP_LOGIN,
    pass: process.env.MAILGUN_SMTP_PASSWORD,
  },
});

exports.sendNotification = async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    const mailOptions = {
      from: "Excited User <mailgun@sandbox-123.mailgun.org>",
      to: to,
      subject: subject,
      text: text,
      html: "<h1>Testing some Mailgun awesomeness!</h1>",
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error sending notification" });
  }
};
