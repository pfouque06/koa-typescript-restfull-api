import { Body, Get,  Post, JsonController,  Authorized, CurrentUser } from "routing-controllers";
import { DeepPartial } from "typeorm";
import { LoginForm } from "../entities/forms/LoginForm";
import { User } from "../entities/models/User";
import { Logger } from "../factories/Logger";
import { AuthService } from "../services/AuthService";

// @Controller()
@JsonController() // to ensure server deals only with json body types and uri starts with /users
export class AuthController {

    constructor(private readonly authService: AuthService) {
        console.log("Start AuthController".underline);
    }
    
    @Post('/register')
    register(@Body() userCredentials: LoginForm): Promise<User> {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} POST /users/register`.bgCyan); //Date.parse("YYYY-MM-DDTHH:mm:ss")
        return this.authService.register(userCredentials);
    }
    
    @Post('/login')
    login(@Body({ validate: true }) userCredentials: LoginForm): Promise<User> {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} POST /users/login`.bgCyan);
        return this.authService.login(userCredentials);
    }
    
    @Post('/logout')
    @Authorized()
    logout(@CurrentUser() currentUser: DeepPartial<User>): Promise<boolean> {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} POST /users/logout`.bgCyan);
        return this.authService.logout(currentUser);
    }
    
    @Get("/test")
    @Authorized(["admin", "user"])
    allAccess(@CurrentUser() currentUser: DeepPartial<User>) {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} GET /test`.bgCyan);
        return `TEST: access validated for ${currentUser.email} as ${currentUser.profile} `;
    }

    @Post('/reset')
    @Authorized("admin")
    resetData() {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} POST /reset`.bgCyan);
        if (!this.authService.resetData()) return 'KO';
        return 'OK'
    }
}