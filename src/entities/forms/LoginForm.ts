import { IsDefined, IsEmail, IsOptional, IsString } from "class-validator"
import { UserProfile } from "../models/User"

export class LoginForm {
    @IsDefined({ always: true })
    @IsEmail()
    @IsString()
    email: string
    
    @IsDefined({ always: true })
    @IsString()
    password: string

    @IsOptional({ always: true})
    profile: UserProfile
}