import { rateLimit } from "express-rate-limit";

const requestLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 100,
    legacyHeaders: false,
    standardHeaders: "draft-7",
    message: "Too many requst from this IP address.... try again later after sometime"
});

const otpLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    legacyHeaders: false,
    standardHeaders: "draft-7",
    message: "Too many requst for OTP from this IP address.... try again later after sometime"
});

export { requestLimit, otpLimit }