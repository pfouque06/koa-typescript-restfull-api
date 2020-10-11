import { Body, Get,  Post, JsonController,  Authorized, CurrentUser } from "routing-controllers";
import { DeepPartial } from "typeorm";
import { LoginForm } from "../entities/forms/LoginForm";
import { User } from "../entities/models/User";
import { AuthService } from "../services/AuthService";
import { LogMiddleware } from "../middleware";

// @Controller()
@JsonController() // to ensure server deals only with json body types and uri starts with /users
export class AuthController {

    constructor(private readonly authService: AuthService) {
        console.log("Start AuthController".underline);
    }
    
        
    @Get("/ping")
    ping() : Promise<Boolean> {
        // console.log(`${LogMiddleware.isoDate()} GET /test`.bgCyan);
        return this.authService.ping();
    }

    @Post('/register')
    register(@Body() userCredentials: LoginForm): Promise<User> {
        // console.log(`${LogMiddleware.isoDate()} POST /users/register`.bgCyan); //Date.parse("YYYY-MM-DDTHH:mm:ss")
        return this.authService.register(userCredentials);
    }
    
    @Post('/login')
    login(@Body({ validate: true }) userCredentials: LoginForm): Promise<User> {
        // console.log(`${LogMiddleware.isoDate()} POST /users/login`.bgCyan);
        return this.authService.login(userCredentials);
    }
    
    @Post('/logout')
    @Authorized()
    logout(@CurrentUser() currentUser: DeepPartial<User>): Promise<boolean> {
        // console.log(`${LogMiddleware.isoDate()} POST /users/logout`.bgCyan);
        return this.authService.logout(currentUser);
    }
    
    @Get("/test")
    @Authorized(["admin", "user"])
    test(@CurrentUser() currentUser: DeepPartial<User>): Promise<String> {
        // console.log(`-> AuthController.test()`.bgCyan);
        return this.authService.test(currentUser);
    }

    @Post('/reset')
    @Authorized("admin")
    resetData(): Promise<boolean> {
        // console.log(`${LogMiddleware.isoDate()} POST /reset`.bgCyan);
        return this.authService.resetData();
    }
}