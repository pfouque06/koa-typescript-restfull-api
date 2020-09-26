import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { Post } from './post';
import { BaseEntity } from './baseEntity';

export type UserType = 'admin' | 'user'

// @Entity()
@Entity({name: 'users'})
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    // @Column({name: 'first_name', nullable: false})
    @Column({nullable: false})
    firstName: string
    @Column({nullable: false})
    lastName: string
    @Column({nullable: true, type: 'date'})
    dateOfBirth: Date
    @Column({unique: true, nullable: false})
    mobile: string
    @Column({unique: true, nullable: false})
    email: string
    @Column({default: 'user'})
    type: UserType
    @Column({nullable: false})
    password: string
    @Column({nullable: false})
    salt: string

    accessToken?: string

    @OneToMany(() => Post, (post: Post) => post.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    // posts: Array<Post>
    posts: Post[]

}