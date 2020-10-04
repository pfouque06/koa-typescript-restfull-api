import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { Post } from './Post';
import { BaseEntity } from './BaseEntity';
import { Exclude } from 'class-transformer';
import { IsDefined, IsEmail, IsEmpty, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';
import { CREATE, UPDATE, ToLowerCaseCustom, IsDateStringCustom, IsUniqueCustom } from '../customDecorators';

export type UserProfile = 'admin' | 'user'

@Entity({name: 'users'})
export class User extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    @IsEmpty({ always: true, message: 'please, do not provide ID value' })
    id!: number;
    
    // @Column({name: 'first_name'})
    // @Column({name: 'first_name'})

    @Column({ nullable: true, default: 'none' })
    @IsOptional({ always: true })
    @IsString()
    @Length(2, 25)
    @ToLowerCaseCustom()
    firstName!: string;
    
    @Column({ nullable: true, default: 'none' })
    @IsOptional({ always: true })
    @IsString()
    @Length(2, 25)
    @ToLowerCaseCustom()
    lastName!: string;
    
    @Column({ type: 'date', nullable: true })
    @IsOptional({ always: true })
    @IsDateStringCustom({ always: true }) // @IsDateString() --> replaced with custom validation decorator
    birthDate!: Date;
    
    @Column({ nullable: true })
    @IsOptional()
    @IsPhoneNumber('zz')
    mobile!: string;
    
    @Column({ unique: true, nullable: false })
    @IsDefined({ groups: [CREATE] })
    @IsOptional({ groups: [UPDATE] })
    @IsEmail({}, { always: true }) // @IsEmail()
    @IsUniqueCustom(User, { always: true })
    email!: string;
    
    // @Column({nullable: true, select: false}) //-> remove prop from find*** repository methods

    @Column({ nullable: false })
    @Exclude() // -> exclude prop from json on ouput
    @IsDefined({ groups: [CREATE] })
    @IsOptional({ groups: [UPDATE] })
    @IsString()
    @Length(5, 25)
    password!: string;
    
    // @Column({nullable: true, select: false}) //-> remove prop from find*** repository methods
    // @Column({nullable: true, select: false}) //-> remove prop from find*** repository methods

    @Column({ nullable: true })
    @Exclude() // -> exclude prop from json  on ouput
    @IsEmpty({ always: true, message: 'unknown prop!' })
    salt!: string;
    
    @Column({ nullable: true, default: 'user' })
    @IsOptional({ always: true })
    profile!: UserProfile;
    
    accessToken?: string
    
    @OneToMany(() => Post, (post: Post) => post.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    posts!: Post[]; // Array<Post>
 // Array<Post>
    
}