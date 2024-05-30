import { createConnection } from "typeorm";
import { User } from "../Entities/User/UserEntityClass";
import { Login } from "../Entities/Login/LoginEntityClass";
import { OTP } from "../Entities/OTP/OtpEntityClass";
import { Message } from "../Entities/Message/MessageEntity";
import { Likes } from "../Entities/Likes/LikeEntityClass";
import { Comments } from "../Entities/Comments/CommentEntityClass";
import { Follow } from "../Entities/Follow/FollowEntityClass";
import { Post } from "../Entities/Post/PostEntityClass";
import { Collection } from "../Entities/SavedPost/SavedPostEntityClass";

createConnection({
    type: "mysql",
    host: "localhost",
    username: "root",
    password: "",
    database: "instagram",
    entities: [
        User,
        Login,
        OTP,
        Message,
        Likes,
        Comments,
        Follow,
        Post,
        Collection
    ],
    synchronize: true
})
.then(connection => console.log("Database is connected successfully"))
.catch(err => console.log("Error :::>", err.stack));