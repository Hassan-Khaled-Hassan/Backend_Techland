// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require("nodemailer");

const SendEmail = async (options) => {
  try{
     console.log(process.env.EMAIL_PASSWORD);
     // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)
     const transporter = nodemailer.createTransport({
       host: process.env.EMAIL_HOST, // e.g., "smtp.gmail.com"
       port: process.env.EMAIL_PORT, // 465 for secure, 587 for non-secure
       secure: process.env.EMAIL_PORT === "465", // true for port 465, false for other ports
       auth: {
         user: process.env.EMAIL_USER, // Gmail user
         pass: process.env.EMAIL_PASSWORD, // Gmail App Password
       },
     });
     // 2) Define email options (like from, to, subject, email content)
     const mailOpts = {
       from: "Siwa Garden Support <SiwaGarden.SupportTeam@gmail.com>",
       to: options.email,
       subject: options.subject,
       html: options.htmlCode,
     };
     // 3) Send email
     await transporter.sendMail(mailOpts);
  }catch(err){
     console.error("Error sending email:", err);
     throw new Error("Failed to send email");
  }
};
module.exports = SendEmail;
