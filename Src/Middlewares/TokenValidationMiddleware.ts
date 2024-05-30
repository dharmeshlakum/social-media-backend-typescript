import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { tokenVerification } from "../Services/Token/TokenServices";

//Custom Request Interface
interface CustomRequet extends Request {
    token?: JwtPayload;
}

const tokenValidationMW = async (req: CustomRequet, res: Response, next: NextFunction) => {

    try {
        const token = req.cookies["login"] || null;
        if (!token) return res.status(401).json({ error: "Token is missing" });

        const validation = await tokenVerification(token) as JwtPayload;
        if (validation.exp && validation.exp * 1000 > Date.now()) {
            req.token = validation;
            next();
        }

    } catch (error: any) {
        console.log(error);
        if (error.name == "TokenExpiredError") {
            return res.status(401).send({ error: "Token is expired.... Relogin is required !" });

        } else if (error.name == "UnauthorizedError") {
            return res.status(401).send({ error: "Unauthorized token !" });

        } else {
            res.status(500).send({ error: error.message });
        }
    }
}

export { tokenValidationMW }