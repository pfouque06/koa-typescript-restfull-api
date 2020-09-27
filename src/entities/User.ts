import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { Post } from './Post';
import { BaseEntity } from './BaseEntity';
import { Exclude } from 'class-transformer';
import { IsDefined, IsEmail, IsEmpty, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';
import { CREATE, IsDateStringCustom, IsUniqueCustom, UPDATE } from './customValidators';

export type UserProfile = 'admin' | 'user'

// @Entity()
@Entity({name: 'users'})
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    @IsEmpty({always: true, message: 'please, do not provide ID value'})
    id: number;
    
    // @Column({name: 'first_name'})
    @Column({nullable: false})
    @IsDefined({ groups: [CREATE] })
    @IsOptional({ groups: [UPDATE] })
    @IsString()
    @Length(2, 25)
    firstName: string

    @Column({nullable: false})
    @IsDefined({ groups: [CREATE] })
    @IsOptional({ groups: [UPDATE] })
    @IsString() 
    @Length(2, 25)
    lastName: string
    
    @Column({type: 'date', nullable: true})
    @IsOptional({ always: true })
    @IsDateStringCustom({ always: true }) // @IsDateString() --> replaced with custom validation decorator
    birthDate: Date
    // dateOfBirth: Date

    @Column({unique: true, nullable: true})
    @IsOptional()
    @IsPhoneNumber(null)
    mobile: string

    @Column({default: 'user'})
    @Exclude() // -> exclude prop from json on ouput
    @IsEmpty({always: true, message: 'unknown prop!'})
    profile: UserProfile

    @Column({unique: true, nullable: false})
    @IsDefined({ groups: [CREATE] })
    @IsOptional({ groups: [UPDATE] })
    @IsEmail()
    // @IsUniqueCustom(UserService) --> to fix
    email: string

    // @Column({nullable: true, select: false}) //-> remove prop from find*** repository methods
    @Column({nullable: true})
    @Exclude() // -> exclude prop from json on ouput
    @IsDefined({ groups: [CREATE] })
    @IsOptional({ groups: [UPDATE] })
    @IsString()
    @Length(8, 25)
    password: string

    // @Column({nullable: true, select: false}) //-> remove prop from find*** repository methods
    @Column({nullable: true})
    @Exclude() // -> exclude prop from json  on ouput
    @IsEmpty({always: true, message: 'unknown prop!'})
    salt: string

    accessToken?: string

    @OneToMany(() => Post, (post: Post) => post.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    posts: Post[] // Array<Post>

}