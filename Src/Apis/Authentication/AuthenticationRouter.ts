import express from "express";
import { Request, Response } from "express";
import { getManager } from "typeorm";
import { User } from "../../Entities/User/UserEntityClass";
import { signupValidationMW } from "../../Middlewares/SignupValidationMiddleware";
import { loginValidationMW } from "../../Middlewares/LoginValidationMiddleware";
import { generateToken } from "../../Services/Token/TokenServices";
import { Login } from "../../Entities/Login/LoginEntityClass";
import { emailValidationMW, passwordResetMW } from "../../Middlewares/ForgetPasswordMiddleware";
import { otpLimit } from "../../Middlewares/RequestLimit";
import { OTP } from "../../Entities/OTP/OtpEntityClass";
import { mailSenderFN } from "../../Middlewares/Nodemailer";
import { JwtPayload } from "jsonwebtoken";
import { tokenValidationMW } from "../../Middlewares/TokenValidationMiddleware";

const authenticationRouter = express.Router();
const entityManager = getManager();

//Custom Request Interface
interface CustomRequet extends Request {
    user?: User;
    email?: string;
    token?: JwtPayload
}

//Signup
authenticationRouter.post("/signup", signupValidationMW, async (req: Request, res: Response) => {

    try {
        const { fullName, username, password, emailAddress } = req.body;
        const user = new User();

        user.fullName = fullName;
        user.emailAddress = emailAddress;
        user.username = username;
        user.password = password;

        const userSavedata = await entityManager.save(user);

        res.status(201).json({
            status: "User created successfully",
            user: userSavedata
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Login
authenticationRouter.post("/login", loginValidationMW, async (req: CustomRequet, res: Response) => {

    try {
        const { user } = req;
        if (!user) return res.status(404).json({ error: "User not found" });

        const userAgent = req.headers["user-agent"];
        const token = await generateToken({ id: user?.id });
        const login = new Login();

        login.user = user.id;
        login.userAgent = userAgent;
        login.token = token;
        await entityManager.save(login)

        res.cookie("login", token, {
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            status: "Success",
            message: `${user.username} is login successfully`
        })

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Forget Password ::::> Get OTP
authenticationRouter.post("/forget-password", emailValidationMW, otpLimit, async (req: CustomRequet, res: Response) => {

    try {
        const { user } = req;
        if (!user) return res.status(404).json({ error: "User not found !" });

        const otp = Math.floor(Math.random() * (9999 - 1000) + 1000).toString();
        const userAgent = req.headers["user-agent"];
        const otpsender = new OTP;

        otpsender.otp = otp;
        otpsender.userAgent = userAgent;
        otpsender.emailAddress = user.emailAddress;
        await entityManager.save(otpsender);

        const email = user.emailAddress;
        let subject = "Node Js [Password Reset]"
        let message = `Hello\n${user.username}\n\nYou requested for password reset..... Here is an OTP to reset password\nOTP :: ${otp}\n\n if you did't requested safely ignore it.`
        await mailSenderFN(email, subject, message);

        //Warnig Mail
        const existData = await entityManager.count(OTP, {
            where: { emailAddress: user.emailAddress }
        });

        if (existData >= 3) {
            subject = "Node Js [Warning]";
            message = "We have recive multiple request for reset password....";
            await mailSenderFN(email, subject, message)
        }

        res.cookie("email", user.emailAddress, {
            maxAge: 5 * 60 * 1000
        });
        res.status(200).json({
            status: "Success",
            message: "OTP sended successfully"
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Foregt Password ::> Reset
authenticationRouter.post("/reset-password", passwordResetMW, async (req: CustomRequet, res: Response) => {

    try {
        const { email } = req;
        const { password } = req.body;
        if (!email) return res.status(404).json({ error: "Email token is missing" });

        const user = await entityManager.findOne(User, {
            where: { emailAddress: email, isDeleted: false }
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        user.password = password;
        await entityManager.save(user);

        let subject = "Password Reset Successfully !";
        let message = "Your password has beend reseted successfully...\nif it's not done by you your account is on risk... Secure it with reseting password";
        await mailSenderFN(email, subject, message);

        res.clearCookie("email");
        res.status(200).json({
            status: "Success",
            message: "Password updated successfully"
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Logout
authenticationRouter.post("/logout", tokenValidationMW, async(req:CustomRequet, res:Response)=>{

    try {
        const {token} = req;
        if(!token) return res.status(401).json({error: "Token is missing"});

        const login = await entityManager.createQueryBuilder(Login, "login")
                                         .loadAllRelationIds()
                                         .where("login.user = :userId", {userId: token.id})
                                         .getOne();
        if(!login) return res.status(404).json({error: "Login Data Is Not Awailable"});
        await entityManager.remove(login);

        res.clearCookie("login")
        res.status(200).json({
            status: "Success",
            message: "User logout successfully"
        });
        
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

export { authenticationRouter }