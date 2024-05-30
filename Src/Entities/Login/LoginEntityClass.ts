import { Entity, PrimaryGeneratedColumn, OneToOne, Column, JoinColumn } from "typeorm";
import { User } from "../User/UserEntityClass";

@Entity()
class Login {

    @PrimaryGeneratedColumn()
    id!: number

    @OneToOne(()=> User, user=> user.id, { onDelete: "CASCADE" })
    @JoinColumn({name: "userId", referencedColumnName: "id"})
    user!: number

    @Column({ type: "varchar" })
    token: string| undefined

    @Column({ type: "varchar" })
    userAgent: string | undefined

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    loginAT!: Date
}

export { Login }