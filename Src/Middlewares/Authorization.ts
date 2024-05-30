import { Request, Response, NextFunction } from "express";
import { User } from "../Entities/User/UserEntityClass";
import { JwtPayload } from "jsonwebtoken";
import { Post } from "../Entities/Post/PostEntityClass";
import { Comments } from "../Entities/Comments/CommentEntityClass";
import { getManager } from "typeorm";
import { Message } from "../Entities/Message/MessageEntity";

//Custom Request Interface
interface CustomRequest extends Request {
    user?: User;
    token?: JwtPayload;
    post?: Post;
    comment?: Comments;
    reply?: Message;
}

//User Profile Authorization
const userProfileAuthorizationMW = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const { user, token } = req;

        if (!user) return res.status(404).json({ error: "User not found" });
        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (user.id !== token.id) return res.status(401).json({ error: "Unauthorized" });
        next();

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

//Post Authorization
const postAuthorizationMW = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const { post, token } = req;

        if (!post) return res.status(404).json({ error: "Post not found" });
        if (!token) return res.status(401).json({ error: "token is missing" });
        if (post.user !== token.id) return res.status(401).json({ error: "Unauthorized" });
        next();

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

//Comment Authorization
const commentUpdateAuthMW = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const { comment, token } = req;

        if (!comment) return res.status(404).json({ error: "Comment not found" });
        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (comment.user !== token.id) return res.status(401).json({ error: "Unauthorized" });
        next();

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

//Comment Delete Authorization
const commentDeleteAuthMW = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const { comment, token } = req;

        if (!comment) return res.status(404).json({ error: "Comment not found" });
        if (!token) return res.status(401).json({ error: "Token is missing" });

        const post = await getManager().findOne(Post, { where: { id: comment.post } });
        if (!post) return res.status(404).json({ error: " Post not found" });

        if (token.id == post?.user || comment.user == token.id) {
            next();

        } else return res.status(401).json({ error: "Unauthorized" })

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

//Reply Delete Validation
const replyDeleteAuthMW = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const { reply, token } = req;

        if (!reply) return res.status(404).json({ error: "Reply not found" });
        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (reply.sender == token.id || reply.receiver == token.id) {
            next();

        } else return res.status(401).json({ error: "Unauthorized" });

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

export { userProfileAuthorizationMW, postAuthorizationMW, commentUpdateAuthMW, commentDeleteAuthMW, replyDeleteAuthMW }