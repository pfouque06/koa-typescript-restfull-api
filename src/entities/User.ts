import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { Post } from './Post';
import { BaseEntity } from './BaseEntity';

export type UserType = 'admin' | 'user'

// @Entity()
@Entity({name: 'users'})
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    // @Column({name: 'first_name'})
    @Column({nullable: false})
    firstName: string
    @Column({nullable: false})
    lastName: string
    @Column({nullable: true, type: 'date'})
    dateOfBirth: Date
    @Column({unique: true, nullable: true})
    mobile: string
    @Column({unique: true, nullable: true})
    email: string
    @Column({default: 'user'})
    type: UserType
    @Column({nullable: true})
    password: string
    @Column({nullable: true})
    salt: string

    accessToken?: string

    @OneToMany(() => Post, (post: Post) => post.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    posts: Post[] // Array<Post>

}