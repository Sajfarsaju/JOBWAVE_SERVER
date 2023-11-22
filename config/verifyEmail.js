const nodeMailer = require("nodemailer");
const dotenv = require('dotenv')
dotenv.config()

const sendVerifyMail = async (companyName, companyEmail, InterviewTime, jobTitle, userEmail, userFirstName, userLastName, companyPhone) => {

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
      subject: "Interview Invitation",
      html: `
        <p>Hello ${userFirstName} ${userLastName},</p>
        <p>Congratulations! You have been shortlisted for an interview for the position of ${jobTitle} at ${companyName}.</p>
        <p>Your interview is scheduled for:</p>
        <p>Interview Time: ${InterviewTime}</p>
        <p>Please make sure to be prepared and arrive on time. If you have any questions or need assistance, you can reach us at ${companyPhone}.</p>
        <p>Good luck!</p>
        <p>Best regards,</p>
        <p>${companyName}</p>
    `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Mail sented');
    return { success: true };
  } catch (error) {
    console.error('Error sending mail:', error);
    return { success: false };
  }
}

module.exports = sendVerifyMail