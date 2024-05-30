import express from "express";
import { Request, Response } from "express";
import { getManager } from "typeorm";
import { User } from "../../Entities/User/UserEntityClass";
import { tokenValidationMW } from "../../Middlewares/TokenValidationMiddleware";
import { usernameValidationMW } from "../../Middlewares/IDvalidationMiddleware";
import { JwtPayload } from "jsonwebtoken";
import { Follow } from "../../Entities/Follow/FollowEntityClass";

const userConnectionRouter = express.Router();
const entityManager = getManager();

//Custom Request Interface
interface CustomRequest extends Request {
    user?: User;
    token?: JwtPayload;
}

userConnectionRouter.post("/user/:username/follow", tokenValidationMW, usernameValidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { user, token } = req;

        if (!user) return res.status(404).json({ error: "User not found" });
        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (user.id === token.id) return res.status(400).json({ error: "BAD REQUEST !" });

        const followData = await entityManager.createQueryBuilder(Follow, "follow")
            .loadAllRelationIds()
            .where("follow.follower = :userID", { userID: token.id })
            .andWhere("follow.following = :id", { id: user.id })
            .getOne();

        if (followData) {
            await entityManager.remove(followData);

            res.status(200).json({
                status: "Success",
                message: `unfollowing ${user.username} successfully`
            });

        } else {
            const newFollow = new Follow();

            newFollow.follower = token.id;
            newFollow.following = user.id;
            await entityManager.save(newFollow);

            res.status(200).json({
                status: "Success",
                message: `following ${user.username} successfully`
            });
        }

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

export { userConnectionRouter } 