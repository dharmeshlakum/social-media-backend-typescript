import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../User/UserEntityClass";
import { Post } from "../Post/PostEntityClass";


@Entity()
class Collection {

    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: "userId" })
    user: number | undefined

    @Column({ type: "varchar", default: "All Post" })
    name: string | undefined

    @ManyToMany(() => Post, post=> post,{ eager: true })
    @JoinTable({name: "saved_post"})
    posts!: Post[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    timestamp!: Date
}

export { Collection }