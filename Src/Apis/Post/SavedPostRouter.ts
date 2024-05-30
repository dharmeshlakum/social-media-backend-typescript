import express from "express";
import { Request, Response } from "express";
import { getManager } from "typeorm";
import { User } from "../../Entities/User/UserEntityClass";
import { Post } from "../../Entities/Post/PostEntityClass";
import { tokenValidationMW } from "../../Middlewares/TokenValidationMiddleware";
import { collectionNameValidationMW, postIDvalidation } from "../../Middlewares/IDvalidationMiddleware";
import { JwtPayload } from "jsonwebtoken";
import { Collection } from "../../Entities/SavedPost/SavedPostEntityClass";

const savePostRouter = express.Router();
const entityManager = getManager();

//Custom Request Interface
interface CustomRequest extends Request {
    user?: User;
    post?: Post;
    token?: JwtPayload;
    collection?: Collection;
}

//Save Post 
savePostRouter.post("/save-post/:postId", tokenValidationMW, postIDvalidation, async (req: CustomRequest, res: Response) => {

    try {
        const { token, post } = req;

        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userCollection = await entityManager.createQueryBuilder(Collection, "collection")
            .leftJoinAndSelect("collection.posts", "post")
            .loadAllRelationIds({
                relations: ["user"]
            })
            .where("collection.id = :userId", { userId: token.id })
            .andWhere("collection.name = :name", { name: "All Posts" })
            .getOne();
        // console.log(userCollection);

        if (userCollection) {
            const index = userCollection.posts.findIndex(value => value.id === post.id);
            if (index >= 0) {
                userCollection.posts.splice(index, 1)
                await entityManager.save(userCollection);

                res.status(200).json({
                    status: "Success",
                    message: "Post removed successfully"
                });

            } else {
                userCollection.posts.push(post);
                await entityManager.save(userCollection);

                res.status(200).json({
                    status: "Success",
                    message: "Post added successfully"
                })
            }

        } else {
            const newCollection = new Collection();

            newCollection.user = token.id;
            newCollection.name = "All Posts";
            newCollection.posts = [post];
            await entityManager.save(newCollection);

            res.status(200).json({
                status: "Success",
                message: "Post added successfully inside the collection"
            });
        }

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Create Collection
savePostRouter.post("/save-post/collection/new", tokenValidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { token } = req;
        const { name } = req.body;

        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (!name) return res.status(400).json({ error: "Collection name is required" });

        const newCollection = new Collection();

        newCollection.name = name;
        newCollection.user = token.id;
        await entityManager.save(newCollection);

        res.status(200).json({
            status: "Success",
            message: `${name} collection created successfully`
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Delete Collection
savePostRouter.delete("/save-post/:collectionName/delete", tokenValidationMW, collectionNameValidationMW, async (req: CustomRequest, res: Response) => {

    try {
        const { collection } = req;
        if (!collection) return res.status(404).json({ error: "Collection not found" });

        await entityManager.remove(collection);
        res.status(200).json({
            status: "Success",
            message: "Collection is deleted successfully"
        });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Add Post Inside The Collection
savePostRouter.post("/save-post/:collectionName/:postId", tokenValidationMW, collectionNameValidationMW, postIDvalidation, async (req: CustomRequest, res: Response) => {

    try {
        const { token, collection, post } = req;

        if (!token) return res.status(401).json({ error: "Token is missing" });
        if (!post) return res.status(404).json({ error: "Post not found" });
        if (!collection) return res.status(404).json({ error: "Collection Not Found" });
        // console.log(collection.posts);

        const index = collection.posts.findIndex(value => value.id === post.id);
        console.log(index)
        if (index >= 0) {
            collection.posts.splice(index, 1)
            await entityManager.save(collection);

            res.status(200).json({
                status: "Success",
                message: "Post removed successfully"
            });

        } else {
            collection.posts.push(post);
            await entityManager.save(collection);

            res.status(200).json({
                status: "Success",
                message: `Post added successfully in the collection ${collection.name}`
            });
        }

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

export { savePostRouter }