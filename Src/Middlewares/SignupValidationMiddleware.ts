import { Request, Response, NextFunction } from "express";
import { getManager } from "typeorm";
import { User } from "../Entities/User/UserEntityClass";

const entityManager = getManager();
const signupValidationMW = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { fullName, username, emailAddress, password } = req.body;
        const regix = /@gmail\.com/;

        if (!fullName || !username || !emailAddress || !password) return res.status(400).json({ error: "All fields are required" });
        if (!regix.test(emailAddress)) return res.status(400).json({ error: "Invalid email address" });
        if (password.length < 6) return res.status(400).json({ error: "Password length should be greater then 6" });

        const usernameData = await entityManager.findOne(User, { where: { username } });
        const emailData = await entityManager.findOne(User, {
            where: { emailAddress, isDeleted: false },
        });

        if (usernameData) return res.status(400).json({ error: "Username is not awailbale" });
        if (emailData) return res.status(409).json({ error: "Email address is already registred" });

        next();

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export { signupValidationMW }