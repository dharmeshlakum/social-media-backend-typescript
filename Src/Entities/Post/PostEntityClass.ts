import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany } from "typeorm";
import { User } from "../User/UserEntityClass";
import {Likes} from "../Likes/LikeEntityClass";
import {Comments} from "../Comments/CommentEntityClass"
import { Collection } from "../SavedPost/SavedPostEntityClass";

@Entity()
class Post{

    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(()=> User, user=> user.id, { onDelete: "CASCADE" })
    @JoinColumn({name: "userId"})
    user!: User

    @Column({type: "varchar"})
    caption!: string

    @Column({type: "simple-array"})
    media!: string[]

    @OneToMany(()=> Comments, comment=> comment.id)
    @JoinColumn()
    comments!: number[]

    @OneToMany(()=> Likes, likes=> likes.id)
    @JoinColumn()
    likes!: number[]

    @ManyToMany(()=> Collection, collection=> collection.posts)
    collection!: Collection[]

    @Column({type: "timestamp", nullable: true, default: null})
    lastUpdate!: Date

    @Column({type: "timestamp",default: ()=> "CURRENT_TIMESTAMP"})
    createdAT!: Date
}
export {Post}