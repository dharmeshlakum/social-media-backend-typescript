import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../User/UserEntityClass";
import { Post } from "../Post/PostEntityClass";
import { Likes } from "../Likes/LikeEntityClass";
import { Message } from "../Message/MessageEntity";


@Entity()
class Comments {

    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, user => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: number | undefined

    @ManyToOne(() => Post, post => post.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "postId" })
    post: number | undefined

    @Column({ type: "boolean", default: false })
    isSubComment: boolean | undefined

    @Column({ type: "varchar", length: 250 })
    message: string | undefined

    @ManyToOne(() => Comments, comment => comment.id, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "parentCommentId" })
    parentComment: number | undefined

    @OneToMany(() => Likes, like => like.id)
    @JoinColumn()
    likes: number[] | undefined

    @OneToMany(() => Message, message => message.id)
    @JoinColumn()
    replies: number[] | undefined

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    timestamp: Date | undefined
}

export { Comments }