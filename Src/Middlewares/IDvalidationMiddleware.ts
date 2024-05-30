import { Request, Response, NextFunction } from "express";
import { User } from "../Entities/User/UserEntityClass";
import { getManager } from "typeorm";
import { Post } from "../Entities/Post/PostEntityClass";
import { Comments } from "../Entities/Comments/CommentEntityClass";
import { Message } from "../Entities/Message/MessageEntity";
import { Collection } from "../Entities/SavedPost/SavedPostEntityClass";
import { JwtPayload } from "jsonwebtoken";

//Custom Request Interface
interface CustomRequest extends Request {
    user?: User;
    post?: Post;
    comment?: Comments;
    reply?: Message;
    token?: JwtPayload;
    collection?: Collection;
}

const entityManager = getManager();

//Username Validation
const usernameValidationMW = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const { username } = req.params;
        const user = await entityManager.findOne(User, {
            where: { username }
        });

        if (!user) return res.status(404).json({ error: "User not found !" });
        req.user = user;
        next();

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

//Post ID Validation
const postIDvalidation = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        let { postId } = req.params;
        const postNumber = Number(postId)
        const post = await entityManager.findOne(Post, {
            where: { id: postNumber },
            loadRelationIds: {
                relations: ["user"]
            }
        })

        if (!post) return res.status(404).json({ error: "Post not found" });
        req.post = post;
        next()

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

//Comment ID Validation
const commentIDvalidationMW = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const { commentId } = req.params;
        const id = Number(commentId);
        const comment = await entityManager.createQueryBuilder(Comments, "comment")
            .loadAllRelationIds({
                relations: ["post", "user"]
            })
            .where("comment.id = :commentId", { commentId: id })
            .getOne();
        // console.log(comment)
        if (!comment) return res.status(404).json({ error: "Comment Not found" });
        req.comment = comment;
        next();

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

//Reply ID validation
const replyIDvalidationMW = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const { replyId } = req.params;
        const id = Number(replyId);
        const reply = await entityManager.findOne(Message, {
            where: { id },
            loadRelationIds: {
                relations: ["user"]
            }
        });

        if (!reply) return res.status(404).json({ error: "reply not found" });
        req.reply = reply;
        next();

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

//Collection Name Validation
const collectionNameValidationMW = async(req:CustomRequest, res:Response, next:NextFunction)=>{

    try {
        const { collectionName } = req.params;
        const { token } = req;

        if(!token) return res.status(401).json({error: "Token is missing"});
        const collection = await entityManager.createQueryBuilder(Collection, "collection")
                                              .leftJoinAndSelect("collection.posts", "posts")
                                              .loadAllRelationIds({
                                                relations: ["user"]
                                              }) 
                                              .where("collection.user = :user", { user: token.id}) 
                                              .andWhere("collection.name = :name", { name: collectionName})
                                              .getOne();

        if(!collection) return res.status(404).json({error: "Collection not found"});
        req.collection = collection;
        next();
    

    } catch (error:any) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

export { usernameValidationMW, postIDvalidation, commentIDvalidationMW, replyIDvalidationMW, collectionNameValidationMW }