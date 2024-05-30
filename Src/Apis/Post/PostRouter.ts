import express from "express";
import { Request, Response } from "express";
import { User } from "../../Entities/User/UserEntityClass";
import { Post } from "../../Entities/Post/PostEntityClass";
import { getManager } from "typeorm";
import { tokenValidationMW } from "../../Middlewares/TokenValidationMiddleware";
import { postMediaUploadingMW } from "../../Middlewares/PostMediaUploadingMiddleware";
import { JwtPayload } from "jsonwebtoken";
import { postIDvalidation, usernameValidationMW } from "../../Middlewares/IDvalidationMiddleware";
import { Likes } from "../../Entities/Likes/LikeEntityClass";
import { Comments } from "../../Entities/Comments/CommentEntityClass";
import { postAuthorizationMW } from "../../Middlewares/Authorization";

const postRouter = express.Router();
const entityManager = getManager();

//Custom Request Interface
interface CustomRequest extends Request {
    user?: User;
    post?: Post;
    token?: JwtPayload
}

//Create Post
postRouter.post("/post", tokenValidationMW, postMediaUploadingMW, async (req: CustomRequest, res: Response) => {

    try {
        const { token } = req;
        const { caption } = req.body;
        let media = []

        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (!caption) return res.status(400).json({ error: "Caption is required" });
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            media = req.files.map(file => file.filename);

        } else return res.status(400).json({ error: "Select file first" });

        const post = new Post();
        post.user = token.id;
        post.media = media;
        post.caption = caption;
        const saveData = await entityManager.save(post);

        res.status(201).json({
            status: "Success",
            post: saveData
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Get All Post Of Any One User
postRouter.get("/post/user/:username", usernameValidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { user } = req;
        if (!user) return res.status(404).json({ error: "User not found" });

        const allPost = await entityManager.createQueryBuilder(Post, "post")
            .loadAllRelationIds({
                relations: ["user"]
            })
            .where("post.user = :userId", { userId: user.id })
            .getMany();

        res.status(200).json({
            status: "Success",
            posts: allPost
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Get Post By ID
postRouter.get("/post/:postId", postIDvalidation, async (req: CustomRequest, res: Response) => {

    try {
        const { post } = req;
        if (!post) return res.status(404).json({ error: "Post not found" });

        const likes = await entityManager.createQueryBuilder(Likes, "like")
            .loadAllRelationIds()
            .where("like.post = :postId", { postId: post.id })
            .getCount();

        const comments = await entityManager.createQueryBuilder(Comments, "comment")
            .loadAllRelationIds({
                relations: ["post", "user"]
            })
            .where("comment.post = :postId", { postId: post.id })
            .andWhere("comment.isSubComment = false")
            .getCount();

        const response = {
            postID: post.id,
            userID: post.user,
            caption: post.caption,
            media: post.caption,
            likes,
            comments,
            lastUpdate: post.lastUpdate,
            createdAT: post.createdAT
        }

        res.status(200).json({
            status: "Success",
            post: response
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Update Post
postRouter.put("/post/:postId/update", tokenValidationMW, postIDvalidation, postMediaUploadingMW, postAuthorizationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { post } = req;
        const { caption } = req.body;
        let media: string[] = []

        if (!post) return res.status(404).json({ error: "Post not found" });
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            media = req.files.map(file => file.filename);
        }

        post.caption = caption ? caption : post.caption;
        post.media = media.length !== 0 ? media : post.media;
        post.lastUpdate = new Date();
        await entityManager.save(post);

        res.status(200).json({
            status: "Success",
            message: "Post updated successfully"
        })

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Delete Post
postRouter.delete("/post/:postId/delete", tokenValidationMW, postIDvalidation, postAuthorizationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { post } = req;
        if (!post) return res.status(404).json({ error: "Post not found" });

        await entityManager.remove(post);
        res.status(200).json({
            status: "Success",
            message: "Post removed successfully"
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

export { postRouter }