import { Exclude } from "class-transformer"
import { IsDefined, IsEmail, IsOptional, IsString, Length } from "class-validator"
import { IsUniqueCustom } from "../customDecorators"
import { User, UserProfile } from "../models/User"

export class LoginForm {
    @IsDefined()
    @IsEmail()
    // @IsString()
    // @IsUniqueCustom(User)
    email: string
    
    @IsDefined()
    @IsString()
    // @Length(5, 25)
    // @Exclude() // -> exclude prop from json on ouput
    password: string

    @IsOptional()
    profile: UserProfile
}