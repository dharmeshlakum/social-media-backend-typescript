import jwt, { Secret } from "jsonwebtoken";

async function generateToken(payload: Object) {
    const token = await jwt.sign(payload, process.env.TOKEN_SECRET as Secret, { expiresIn: "7d" });
    return token;
}

async function tokenVerification(token: string) {
    const validation = await jwt.verify(token, process.env.TOKEN_SECRET as Secret);
    return validation;
}

export { generateToken, tokenVerification }