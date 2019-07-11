import { EMAIL, PASSWORD } from 'babel-dotenv'
const nodemailer = require("nodemailer");


async function notifyByEmail(){

try {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: EMAIL,
            pass: PASSWORD
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"Fred Foo 👻" <${EMAIL}>`, // sender address
        to: "manan1995patel@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>" // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@gmail.com>

    } catch (error) {
        console.error(error.message);
    }
}

module.exports = {
    notifyByEmail
}