const nodemailer = require("nodemailer");
const sendEmail = async (email, subject, url) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "supphakorn.praisakuldecha@mail.kmutt.ac.th",
          pass: "Kuroba__1412",
        },
      });
      await transporter.sendMail({
        from: "supphakorn.praisakuldecha@mail.kmutt.ac.th",
        to: email,
        subject: subject,
        text: url,
      });
      console.log("email sent sucessfully");
    } catch (error) {
      console.log("email not sent");
      console.log(error);
    }
  };
  module.exports = sendEmail;


