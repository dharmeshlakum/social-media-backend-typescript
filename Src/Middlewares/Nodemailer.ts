import { createTransport } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const trasporter = createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function mailSenderFN(email: string, subject: string, message: string) {
    const mailOption = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject,
        text: message
    }

    await trasporter.sendMail(mailOption, function (err, info) {
        if (err) {
            console.log("Mail Sending Error :::>", err);

        } else {
            console.log("Mail sended successfully :::>", info.response)
        }
    })

}

export { mailSenderFN }