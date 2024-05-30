import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../User/UserEntityClass";
import { otpHashing } from "../../Services/OTP/OtpServices";


@Entity()
class OTP {

    @PrimaryGeneratedColumn()
    id!: number

    @Column({type: "varchar"})
    emailAddress: string | undefined

    @Column({ type: "varchar" })
    otp!: string

    @Column({ type: "varchar" })
    userAgent: string | undefined

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    timestamp!: Date

    @BeforeInsert()
    async hashcode() {
        if (this.otp) {
            this.otp = await otpHashing(this.otp);
        }
    }
}

export { OTP };