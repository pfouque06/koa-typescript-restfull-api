import { IsDefined, IsEmail, IsOptional, IsString } from "class-validator"
import { UserProfile } from "../models/User"

export class LoginForm {
    @IsDefined()
    @IsEmail()
    // @IsString()
    // @IsUniqueCustom(User)
    email!: string
    
    @IsDefined()
    @IsString()
    // @Length(5, 25)
    // @Exclude() // -> exclude prop from json on ouput
    password!: string

    @IsOptional()
    profile!: UserProfile
}