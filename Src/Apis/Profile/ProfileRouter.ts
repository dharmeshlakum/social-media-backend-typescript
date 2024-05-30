import express from "express";
import { Request, Response } from "express";
import { getManager } from "typeorm";
import { User } from "../../Entities/User/UserEntityClass";
import { usernameValidationMW } from "../../Middlewares/IDvalidationMiddleware";
import { Post } from "../../Entities/Post/PostEntityClass";
import { Follow } from "../../Entities/Follow/FollowEntityClass";
import { tokenValidationMW } from "../../Middlewares/TokenValidationMiddleware";
import { profileUploadingMW } from "../../Middlewares/ProfilePictureUploadingMiddleware";
import { userProfileAuthorizationMW } from "../../Middlewares/Authorization";
import { join } from "path";
import { passwordVerification } from "../../Services/Password/PasswordServices";
import { Login } from "../../Entities/Login/LoginEntityClass";

const profileRouter = express.Router();
const entityManager = getManager();

//Custom Request Interface
interface CustomRequest extends Request {
    user?: User
}

//Get Profile
profileRouter.get("/user/:username", usernameValidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { user } = req;
        if (!user) return res.status(404).json({ error: "User not found" });

        const posts = await entityManager.createQueryBuilder(Post, "post")
            .loadAllRelationIds()
            .where("post.user = :userId", { userId: user.id })
            .getMany();
        const follower = await entityManager.createQueryBuilder(Follow, "follow")
            .loadAllRelationIds()
            .where("follow.following = :id", { id: user.id })
            .getCount();
        const following = await entityManager.createQueryBuilder(Follow, "follow")
            .loadAllRelationIds()
            .where("follow.follower = :id", { id: user.id })
            .getCount();

        const response = {
            userID: user.id,
            username: user.username,
            fullName: user.fullName,
            follower,
            following,
            posts
        }

        res.status(200).json({
            status: "success",
            data: response
        });

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

//Update Profile Pictuer
profileRouter.put("/user/:username/update-pic", tokenValidationMW, usernameValidationMW, profileUploadingMW, userProfileAuthorizationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { user } = req;
        if (!user) return res.status(404).json({ error: "User not found" });
        if (!req.file) return res.status(400).json({ Error: "Please select file to update" });

        user.profilePicture = req.file.filename;
        await entityManager.save(user);

        res.status(200).json({
            status: "Success",
            message: "Profile picture is updated successfully"
        });

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

//Get Profile Picture
profileRouter.get("/user/:username/profile-pic", usernameValidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { user } = req;
        if (!user) return res.status(404).json({ error: "User not found" });

        const path = join(__dirname, `../../Assets/Profile/${user.profilePicture}`);
        res.status(200).sendFile(path);

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

//Download Profile Picture
profileRouter.get("/user/:username/download-pic", usernameValidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { user } = req;
        if (!user) return res.status(404).json({ error: "User not found" });

        const path = join(__dirname, `../../Assets/Profile/${user.profilePicture}`);
        res.status(200).download(path);

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

//Update Profile
profileRouter.put("/user/:username/update", tokenValidationMW, usernameValidationMW, profileUploadingMW, userProfileAuthorizationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { user } = req;
        const { fullName, username, emailAddress, bio } = req.body;
        let profilePic = "";

        if (!user) return res.status(404).json({ error: "User not found" });
        if (req.file) {
            profilePic = req.file.filename
        }

        if (emailAddress) {
            const emailData = await entityManager.findOne(User, {
                where: { emailAddress, isDeleted: false }
            });
            if (emailData) return res.status(409).json({ error: "Email address is alread registred !" });
        }
        if (username) {
            const usernameDataData = await entityManager.findOne(User, {
                where: { username }
            });
            if (usernameDataData) return res.status(409).json({ error: "Email address is alread registred !" });
        }

        user.fullName = fullName ? fullName : user.fullName;
        user.emailAddress = emailAddress ? emailAddress : user.emailAddress;
        user.username = username ? username : user.username;
        user.profilePicture = profilePic == "" ? user.profilePicture : profilePic;
        user.bio = bio ? bio : user.bio;
        await entityManager.save(user);

        res.status(200).json({
            status: "Success",
            message: "Profile is updated successfully"
        })

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

//update Password
profileRouter.put("/user/:username/update-password", tokenValidationMW, usernameValidationMW, userProfileAuthorizationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { password, newPassword, confirmPassword } = req.body;
        const { user } = req;

        if (!user) return res.status(404).json({ error: "User not found" })
        if (!password || !newPassword || !confirmPassword) return res.status(400).json({ error: "All fields are required" });
        if (newPassword.length < 8) return res.status(400).json({ error: "Password length shuold be greated then 8" });
        if (newPassword !== confirmPassword) return res.status(400).json({ error: "New Password and confirm password is not matching" });

        const validation = await passwordVerification(password, user.password);
        if (!validation) return res.status(401).json({ error: "Wrong password" });

        user.password = newPassword;
        await entityManager.save(user);

        res.status(200).json({
            status: "Succes",
            message: "Password updated successfully"
        })


    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

//Delete Profile
profileRouter.delete("/user/:username/delete", tokenValidationMW, usernameValidationMW, userProfileAuthorizationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { user } = req;
        if (!user) return res.status(404).json({ error: "User not found" });

        const login = await entityManager.createQueryBuilder(Login, "login")
            .loadAllRelationIds()
            .where("login.user = :userId", { userId: user.id })
            .getOne();
        console.log(login);
        if (!login) return res.status(404).json({ error: "Login data is not awailable" });

        user.isDeleted = true;
        await entityManager.save(user);
        await entityManager.remove(login);

        res.clearCookie("login");
        res.status(200).json({
            status: "Success",
            message: "Your profile is deleted successfully"
        });

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

export { profileRouter }