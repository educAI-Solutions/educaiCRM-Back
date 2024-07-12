const nodemailer = require("nodemailer");
require("dotenv").config();
const Notification = require("../models/notificationModel");
const Account = require("../models/accountModel");

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
    const { id } = req.body;

    // Look up the notification in the mongo database
    const notification = await Notification.findById(id).populate("recipient");
    // Delete the password field from the user object
    notification.recipient.password = undefined;

    const to = notification.recipient.email;
    const subject = notification.subject;
    const text = notification.content;

    const mailOptions = {
      from: "EducAI CRM <notifications@educai.site>",
      to: to,
      subject: subject,
      text: text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <div style="background-color: #007BFF; color: white; padding: 10px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
          </div>
          <div style="padding: 20px;">
            <p style="color: #333; line-height: 1.5;">${text}</p>
            <div style="margin-top: 20px;">
              <a href="https://educai.site" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visita nuestro sitio web</a>
            </div>
          </div>
          <div style="padding: 10px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
            <p style="margin: 0;">EducAI CRM - Todos los derechos reservados</p>
            <p style="margin: 0;">Este es un correo electrónico automatizado, por favor no responda.</p>
          </div>
        </div>
      `,
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

exports.sendManualNotification = async (req, res) => {
  try {
    const { email, subject, content } = req.body;

    const account = await Account.findOne({
      email: email,
    });

    const to = account.email;
    const text = content;

    const mailOptions = {
      from: "EducAI CRM <notifications@educai.site>",
      to: to,
      subject: subject,
      text: text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <div style="background-color: #007BFF; color: white; padding: 10px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
          </div>
          <div style="padding: 20px;">
            <p style="color: #333; line-height: 1.5;">${text}</p>
            <div style="margin-top: 20px;">
              <a href="https://educai.site" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visita nuestro sitio web</a>
            </div>
          </div>
          <div style="padding: 10px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
            <p style="margin: 0;">EducAI CRM - Todos los derechos reservados</p>
            <p style="margin: 0;">Este es un correo electrónico automatizado, por favor no responda.</p>
          </div>
        </div>
      `,
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
