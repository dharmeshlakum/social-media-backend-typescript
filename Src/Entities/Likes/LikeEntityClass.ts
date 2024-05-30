import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../User/UserEntityClass";
import { Post } from "../Post/PostEntityClass";
import { Comments } from "../Comments/CommentEntityClass";
import { Message } from "../Message/MessageEntity";


@Entity()
class Likes {

    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, user => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: number | undefined

    @ManyToOne(() => Post, post => post.id, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "postId" })
    post: number | undefined

    @ManyToOne(() => Comments, comment => comment.id, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "commentId" })
    comment: number | undefined

    @ManyToOne(() => Message, message => message.id, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "replyId" })
    reply: number | undefined

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    timestamp: Date | undefined
}

export { Likes }