import express from "express";
import { Request, Response } from "express";
import { getManager } from "typeorm";
import { Post } from "../../Entities/Post/PostEntityClass";
import { User } from "../../Entities/User/UserEntityClass";
import { tokenValidationMW } from "../../Middlewares/TokenValidationMiddleware";
import { commentIDvalidationMW, postIDvalidation, replyIDvalidationMW } from "../../Middlewares/IDvalidationMiddleware";
import { Likes } from "../../Entities/Likes/LikeEntityClass";
import { JwtPayload } from "jsonwebtoken";
import { Comments } from "../../Entities/Comments/CommentEntityClass";
import { commentDeleteAuthMW, commentUpdateAuthMW, replyDeleteAuthMW } from "../../Middlewares/Authorization";
import { Message } from "../../Entities/Message/MessageEntity";

const postInteractionRouter = express.Router();
const entityManager = getManager();

//Cutom Request Interface
interface CustomRequest extends Request {
    post?: Post;
    user?: User;
    token?: JwtPayload;
    comment?: Comments;
    reply?: Message;
}

//Like
postInteractionRouter.post("/post/:postId/like", tokenValidationMW, postIDvalidation, async (req: CustomRequest, res: Response) => {

    try {
        const { post, token } = req;
        if (!post) return res.status(404).json({ error: " Post not found " });
        if (!token) return res.status(401).json({ error: "Token is missing" });

        const like = await entityManager.createQueryBuilder(Likes, "like")
            .loadAllRelationIds({
                relations: ["user", "post"]
            })
            .where("like.post = :postId", { postId: post.id })
            .andWhere("like.user = :userId", { userId: token.id })
            .getOne();

        if (like) {
            await entityManager.remove(like);

            res.status(200).json({
                status: "Success",
                message: "Like removed successfully"
            });

        } else {
            const newLike = new Likes();
            newLike.user = token.id;
            newLike.post = post.id;
            await entityManager.save(newLike);

            res.status(200).json({
                status: "Success",
                message: "Like added successfully"
            });
        }


    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Comment On Post
postInteractionRouter.post("/post/:postId/comment", tokenValidationMW, postIDvalidation, async (req: CustomRequest, res: Response) => {

    try {
        const { post, token } = req;
        const { message } = req.body;

        if (!post) return res.status(404).json({ error: " Post not found " });
        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (!message) return res.status(400).json({ error: "Message field is required" });

        const comment = new Comments();

        comment.user = token.id;
        comment.post = post.id;
        comment.message = message;
        const saveData = await entityManager.save(comment);

        res.status(200).json({
            status: "Success",
            message: "Comment sended successfully",
            comment: saveData
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// Like On comment
postInteractionRouter.post("/comment/:commentId/like", tokenValidationMW, commentIDvalidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { comment, token } = req;

        if (!comment) return res.status(404).json({ error: "Comment not found" });
        if (!token) return res.status(404).json({ error: "Token is missing" });

        const like = await entityManager.createQueryBuilder(Likes, "like")
            .loadAllRelationIds({
                relations: ["user", "comment"]
            })
            .where("like.comment = :commentId", { commentId: comment.id })
            .andWhere("like.user = :userId", { userId: token.id })
            .getOne();
        // console.log(like)
        if (like) {
            await entityManager.remove(like);

            res.status(200).json({
                status: "Successfully",
                message: "like remove successfully"
            })

        } else {
            const newLike = new Likes();

            newLike.comment = comment.id;
            newLike.user = token.id;
            await entityManager.save(newLike);

            res.status(200).json({
                status: "Success",
                message: "like added successfully"
            });
        }

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Get Comment
postInteractionRouter.get("/comment/:commentId", commentIDvalidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { comment } = req;
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const like = await entityManager.createQueryBuilder(Likes, "like")
            .loadAllRelationIds({
                relations: ["user", "comment"]
            })
            .where("like.comment = :commentId", { commentId: comment.id })
            .getCount();
        const response = {
            commentID: comment.id,
            userID: comment.user,
            postID: comment.post,
            message: comment.message,
            like,
            timestamp: comment.timestamp
        }

        res.status(200).json({
            status: "success",
            comment: response
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Update Comment
postInteractionRouter.put("/comment/:commentId/update", tokenValidationMW, commentIDvalidationMW, commentUpdateAuthMW, async (req: CustomRequest, res: Response) => {

    try {
        const { comment, token } = req;
        const { message } = req.body;

        if (!comment) return res.status(404).json({ error: "Comment not found" });
        if (!token) return res.status(401).json({ error: "Token is missing" });

        comment.message = message;
        await entityManager.save(comment);

        res.status(200).json({
            status: "success",
            message: "Comment updated successfully"
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Delete Post
postInteractionRouter.delete("/comment/:commentId/delete", tokenValidationMW, commentIDvalidationMW, commentDeleteAuthMW, async (req: CustomRequest, res: Response) => {

    try {
        const { comment } = req;
        if (!comment) return res.status(404).json({ error: "Token is missing" });

        await entityManager.remove(comment);

        res.status(200).json({
            status: "Success",
            message: "Comment is deleted successfully"
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Comment On Comment
postInteractionRouter.post("/comment/:commentId/comment", tokenValidationMW, commentIDvalidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { comment, token } = req;
        const { message } = req.body;

        if (!comment) return res.status(404).json({ error: "Comment not found" });
        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (!message) return res.status(400).json({ error: "Message is required" });

        const subComment = new Comments();

        subComment.isSubComment = true;
        subComment.message = message;
        subComment.parentComment = comment.id;
        subComment.user = token.id;
        subComment.post = comment.post;
        await entityManager.save(subComment);

        res.status(200).json({
            status: "Success",
            message: "Comment sended successfully"
        })

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Reply On Comment
postInteractionRouter.post("/comment/:commentId/reply", tokenValidationMW, commentIDvalidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { comment, token } = req;
        const { message } = req.body;

        if (!comment) return res.status(404).json({ error: "Comment not found !" });
        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (!message) return res.status(400).json({ error: "Message not found" });

        const chat = new Message();

        chat.sender = token.id;
        chat.receiver = comment.user;
        chat.message = message;
        await entityManager.save(chat);

        res.status(200).json({
            status: "Success",
            message: "Reply sended successfully"
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Delete Reply
postInteractionRouter.delete("/reply/:replyId/delete", tokenValidationMW, replyIDvalidationMW, replyDeleteAuthMW, async (req: CustomRequest, res: Response) => {

    try {
        const { reply } = req;
        if (!reply) return res.status(404).json({ error: "Reply not found" });

        await entityManager.remove(reply);

        res.status(200).json({
            status: "Success",
            message: "Reply is deleted successfully"
        })

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

export { postInteractionRouter }