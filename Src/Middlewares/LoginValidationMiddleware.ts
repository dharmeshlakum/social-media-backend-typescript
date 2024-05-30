import { Request, Response, NextFunction } from "express";
import { User } from "../Entities/User/UserEntityClass";
import { getManager } from "typeorm";
import { Login } from "../Entities/Login/LoginEntityClass";
import { passwordVerification } from "../Services/Password/PasswordServices";

//Custom Request Interface
interface CustomRequet extends Request {
    user?: User
}

const entityManager = getManager();
const loginValidationMW = async (req: CustomRequet, res: Response, next: NextFunction) => {

    try {
        const { userInput, password } = req.body;
        if (!userInput || !password) return res.status(400).json({ error: "all fields are required !" });

        const user = await entityManager.findOne(User, {
            where: [
                { username: userInput, isDeleted: false },
                { emailAddress: userInput, isDeleted: false }
            ]
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        const login = await entityManager.createQueryBuilder(Login, "login")
            .loadAllRelationIds()
            .where("login.user = :userId", { userId: user.id })
            .getOne();
        // console.log("Login Data :::>", login);

        if (login) {
            if (login.userAgent === req.headers["user-agent"]) return res.status(409).json({ error: "User is already login on this device" });
            return res.status(409).json({ error: "User is already login on other device" });

        } else {
            const validation = await passwordVerification(password, user.password);
            if (!validation) return res.status(401).json({ error: "Wrong password" });
            req.user = user;
            next();
        }

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export { loginValidationMW }