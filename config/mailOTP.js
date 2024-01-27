const nodeMailer = require("nodemailer");
const dotenv = require('dotenv')
dotenv.config()

const sendMailOTP = async ( userEmail, userFirstName, userLastName , otp) => {

  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.APP_PASS
      },
    });
    const mailOptions = {
      from: "JobWave",
      to: userEmail,
      subject: "Otp verification for singin",
      html: `
      <p>Hello ${userFirstName} ${userLastName},</p>
      <p>Your OTP for sign-in verification is: <strong>${otp}</strong></p>
      <p>Please use this code to complete the sign-in process.</p>
      <p>If you didn't request this OTP or have any concerns, please ignore this message.</p>
    `,
    };
    const info = await transporter.sendMail(mailOptions);
    if(info){
        return { success: true };
    }else{
        return { success: false };
    }
  } catch (error) {
    console.error('Error sending mail:', error);
    return { success: false };
  }
}

module.exports = sendMailOTP