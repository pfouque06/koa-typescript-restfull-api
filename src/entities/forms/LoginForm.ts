import { IsDefined, IsEmail, IsString } from "class-validator"

export class LoginForm {
    @IsDefined({ always: true })
    @IsEmail()
    @IsString()
    email: string
    
    @IsDefined({ always: true })
    @IsString()
    password: string
}