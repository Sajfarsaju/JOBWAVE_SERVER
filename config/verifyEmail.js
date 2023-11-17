const nodeMailer = require ("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendVerifyMail = async (companyName , companyEmail , interviewTime , userEmail ,userFirstName , userLastName ,id, path) => {
    console.log('email verify', companyName , companyEmail , interviewTime , userEmail )
    try {
      const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.USER_MAIL,
          pass: process.env.PASS,
        },
      });
      const mailOptions = {
        from: "Yummi",
        to: userEmail,
        subject: "For verification",
        // html: `<p>Hello ${userName}, Please click <a href="https://www.yummi.website/${path}/${id}">here</a> to verify your email.</p>`,
      };
      const info = await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error.message);
    }
  }

module.exports = sendVerifyMail