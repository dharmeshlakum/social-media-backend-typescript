import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from "typeorm";
import { User } from "../User/UserEntityClass";

@Entity()
class Follow {

    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, user => user.followers, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "followerId" })
    follower: number | undefined

    @ManyToOne(() => User, user => user.followings, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "followingId" })
    following: number | undefined

    @Column({ type: "varchar", default: () => "CURRENT_TIMESTAMP" })
    timestamp!: Date
}

export { Follow }