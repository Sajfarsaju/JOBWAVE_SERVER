const nodemailer = require('nodemailer');

module.exports = {
    sendEmail : async(email,subject,text) => {
        
        try{
            console.log('email:',email , 'subject:',subject,'text:',text)
            const transporter = nodemailer.createTransport({
                host:process.env.HOST,
                service:process.env.SERVICE,
                port:Number(process.env.EMAIL_PORT),
                secure:Boolean(process.env.SECURE),
                auth:{
                    user:process.env.USER,
                    pass:process.env.PASS
                }
            });
            console.log('sendemail func:',transporter);
            await transporter.sendMail({
                from:process.env.USER,
                to:email,
                subject:subject,
                text:text
            });
            console.log("Email sent successfully");
        }catch(error){
            console.log(error);
            console.log('Email not sent');
        }
    }
}