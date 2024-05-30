import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../User/UserEntityClass";


@Entity()
class Message {

    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar" })
    message: string | undefined

    @ManyToOne(() => User, user => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "senderId" })
    sender: number | undefined

    @ManyToOne(() => User, user => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "receiverId" })
    receiver: number | undefined

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    timestamp!: Date
}

export { Message }