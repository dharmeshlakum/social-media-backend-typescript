import { Entity, OneToMany, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, JoinColumn } from "typeorm";
import { passwordHashing } from "../../Services/Password/PasswordServices";
import {Follow} from "../Follow/FollowEntityClass"
import { Collection } from "../SavedPost/SavedPostEntityClass";

@Entity()
class User{

    @PrimaryGeneratedColumn()
    id!: number

    @Column({type: "varchar", unique: true, length: 30})
    username!: string

    @Column({type: "varchar", unique: true, length: 50})
    emailAddress!: string

    @Column({type: "varchar"})
    password!: string

    @Column({type: "varchar"})
    fullName!: string

    @Column({type: "varchar", default: "default-profile-pic.jpg"})
    profilePicture!: string

    @Column({type: "varchar", default: ""})
    bio!: string
    
    @Column({type: "boolean", default: false})
    isDeleted!: boolean

    @Column({type: "boolean", default: true})
    emailSubscription!: boolean

    @Column({type: "varchar", default: null, nullable: true})
    lastLogin!: Date

    @Column({type: "varchar", default:()=> "CURRENT_TIMESTAMP"})
    registredAT!: Date

    @OneToMany(()=> Follow, follow=> follow.follower)
    followers!: number[]

    @OneToMany(()=> Follow, follow=> follow.following)
    followings!: number[]

    @OneToMany(()=> Collection, collection=> collection.user)
    collection!: number[]

    @BeforeInsert()
    @BeforeUpdate()
    async hashcode(){
        this.password = await passwordHashing(this.password);
    }
}

export {User}