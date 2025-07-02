const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //create transporter

  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "93830a429b503a",
          pass: "10c530f2c9fbc9"
        }
  });

  //define email options
  const mailOptions = {
    from: 'custom@support.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
