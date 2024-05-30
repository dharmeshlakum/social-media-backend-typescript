import bcrypt from "bcrypt";

async function passwordHashing(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashCode = await bcrypt.hash(password, salt);
    return hashCode;
}

async function passwordVerification(password: string, hashCode: string) {
    const validation = await bcrypt.compare(password, hashCode)
    return validation;
}

export { passwordHashing, passwordVerification }