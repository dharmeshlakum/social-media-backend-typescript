import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { requestLimit } from "./Middlewares/RequestLimit";
import cookieParser from "cookie-parser";
import { authenticationRouter } from "./Apis/Authentication/AuthenticationRouter";
import { profileRouter } from "./Apis/Profile/ProfileRouter";
import { userConnectionRouter } from "./Apis/Profile/UserConnectionRouter";
import { postRouter } from "./Apis/Post/PostRouter";
import { postInteractionRouter } from "./Apis/Post/PostInteractionRouter";
import { savePostRouter } from "./Apis/Post/SavedPostRouter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: `http://localhost:${PORT}`,
    methods: ["put", "post"]
}));
app.use(requestLimit);
app.use(cookieParser());

app.use(authenticationRouter);
app.use(profileRouter);
app.use(userConnectionRouter);
app.use(postRouter);
app.use(postInteractionRouter);
app.use(savePostRouter);

app.listen(PORT, ()=> console.log("Server is running at ::>", PORT))