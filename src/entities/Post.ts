import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User'

@Entity({name: 'posts'})
export class Post extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({type: "text"})
    title: string
    @Column({type: "text"})
    body: string

    // @Column({ nullable: false, name: 'user_id' })
    // userId: number
    @ManyToOne(() => User, (user: User) => user.posts)
    // @JoinColumn({ name: 'user_id' })
    user: User
}