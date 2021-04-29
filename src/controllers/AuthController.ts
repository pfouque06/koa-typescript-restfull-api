import { Body, Get,  Post, JsonController,  Authorized, CurrentUser, Put, Param } from "routing-controllers";
import { DeepPartial } from "typeorm";
import { LoginForm } from "../entities/forms/LoginForm";
import { User } from "../entities/models/User";
import { AuthService } from "../services/AuthService";
import { LogMiddleware } from "../middleware";
import { PasswordForm } from "../entities/forms/PasswordForrm";

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
    
    @Get("/myself")
    @Authorized()
    myself(@CurrentUser() currentUser: DeepPartial<User>): Promise<User> {
        // console.log(`-> AuthController.test()`.bgCyan);
        return this.authService.myself(currentUser);
    }
    
    @Get("/mailCheck/:mail")
    mailCheck(@Param("mail") mail: string): Promise<boolean> {
        // console.log(`-> AuthController.test()`.bgCyan);
        return this.authService.mailCheck(mail);
    }
    
    @Put("/changePassword")
    @Authorized()
    changePassword(
        @CurrentUser() currentUser: DeepPartial<User>,
        @Body({ validate: true }) passwordForm: PasswordForm ): Promise<boolean> {
        // console.log(`-> AuthController.changePassword()`.bgCyan);
        return this.authService.changePassword(currentUser, passwordForm);
    }

    @Get("/test")
    @Authorized()
    test(@CurrentUser() currentUser: DeepPartial<User>): Promise<String> {
        // console.log(`-> AuthController.test()`.bgCyan);
        return this.authService.test(currentUser);
    }
    
    @Get("/sessions")
    // @Authorized(["admin"])
    async getSessions(): Promise<Array<string>> {
        // console.log(`-> AuthController.test()`.bgCyan);
        return this.authService.getSessions();
    }

    @Post('/reset')
    @Authorized("admin")
    resetData(): Promise<boolean> {
        // console.log(`${LogMiddleware.isoDate()} POST /reset`.bgCyan);
        return this.authService.resetData();
    }
}