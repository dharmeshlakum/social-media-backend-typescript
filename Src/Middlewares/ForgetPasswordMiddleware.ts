import { Request, Response, NextFunction } from "express";
import { getManager } from "typeorm";
import { User } from "../Entities/User/UserEntityClass";
import { OTP } from "../Entities/OTP/OtpEntityClass";
import { otpVerification } from "../Services/OTP/OtpServices";

//CustomRequest Interface
interface CustomRequest extends Request {
    email?: string;
    user?: User;
}

const entityManager = getManager();

//Email Validation
const emailValidationMW = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const { emailAddress } = req.body;
        const regix = /@gmail.com/;
        if (!emailAddress || !regix.test(emailAddress)) return res.status(400).json({ error: "Enter Valid Email Address to get OTP" });

        const user = await entityManager.findOne(User, {
            where: { emailAddress, isDeleted: false }
        });
        if (!user) return res.status(400).json({ error: "email address is not registred !" });
        if (user.emailSubscription === false) return res.status(400).json({ error: "Email Subscription is OFF" });

        req.user = user;
        next();

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Reset Password
const passwordResetMW = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const email = req.cookies["email"]
        const { password, confirmPassword, otp } = req.body;
        const userAgent = req.headers["user-agent"]

        if (!email) return res.status(401).json({ error: "Email token is missing" });
        if (!password || !confirmPassword || !otp) return res.status(400).send({ error: "all fields are required" });
        if (password !== confirmPassword) return res.status(400).send({ error: "password and confirm password are not matching" });

        const otpData = await entityManager.find(OTP, {
            where: { emailAddress: email, userAgent },
            order: { timestamp: "DESC" }
        });
        if (otpData.length == 0) return res.status(404).json({ error: "No OTP Awailable" });

        const Validation = await otpVerification(otp, otpData[0].otp);
        if (!Validation) return res.status(401).json({ error: "Wrong OTP !" });
        await entityManager.remove(otpData);

        req.email = email;
        next();

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
}

export { emailValidationMW, passwordResetMW }