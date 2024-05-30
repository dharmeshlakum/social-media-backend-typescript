import bcrypt from "bcrypt";

async function otpHashing(otp: string) {
    const salt = await bcrypt.genSalt(10);
    const hashCode = await bcrypt.hash(otp, salt);
    return hashCode;
}

async function otpVerification(otp: string, hashCode: string) {
    const validation = await bcrypt.compare(otp, hashCode)
    return validation;
}

export { otpHashing, otpVerification }