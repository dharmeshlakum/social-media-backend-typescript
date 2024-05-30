import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { join } from "path";

const path = join(__dirname, "../Assets/Profile");
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, path);
    },

    filename: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, Date.now() + file.originalname)
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
    const types = /jpg|png|jpeg/;
    const validation = types.test(file.originalname.toLowerCase());

    if (validation) {
        cb(null, true);

    } else {
        cb(new Error("Invalid file type.... Only JPG || PNG || JPEG files are allow"))
    }
}

const uploader = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const profileUploadingMW = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profilePicture = uploader.single("image");
        profilePicture(req, res, (err: any) => {

            if (err instanceof multer.MulterError) {
                  return res.status(413).send({ error: err.message });

            } else if (err) {
                return res.status(415).send({ error: err.messaage });

            } else {
                next();
            }
        })

    } catch (error: any) {
        console.log(error);
        res.status(500).send({ error: error.message })
    }
}

export { profileUploadingMW };