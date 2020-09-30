import { config } from "dotenv";
import { Param, Body, Get,  Post, Put, Delete, JsonController,  Authorized, CurrentUser } from "routing-controllers";
import { DeepPartial } from "typeorm";
import { LoginForm } from "../entities/forms/LoginForm";
import { User } from "../entities/models/User";
import { UserService } from "../services/UserService";

// config()

// @Controller()
@JsonController("/users") // to ensure server deals only with json body types and uri starts with /users
export class UserController {

    constructor(private readonly userService: UserService) {
        console.log("Start UserController".underline);
    }
    
    @Post('/login')
    login(@Body() userCredentials: LoginForm): Promise<User> {
        console.log(`GET /users/login`.bgCyan);
        return this.userService.login(userCredentials);
    }
    
    @Post('/logout')
    @Authorized()
    logout(@CurrentUser() currentUser: DeepPartial<User>): Promise<boolean> {
        console.log(`GET /users/login`.bgCyan);
        return this.userService.logout(currentUser);
    }
    
    @Post('/register')
    register(@Body() userCredentials: LoginForm): Promise<User> {
        console.log(`GET /users/register`.bgCyan);
        return this.userService.register(userCredentials);
    }
    
    @Get("/access")
    @Authorized()
    access(@CurrentUser() user: DeepPartial<User>) {
        console.log(`GET /users/access`.bgCyan);
        return `TEST: access validated for ${user.email}`;
    }
    
    @Get("/access/user")
    @Authorized("user")
    userAccess(@CurrentUser() user: DeepPartial<User>) {
        console.log(`GET /users/access/user`.bgCyan);
        return `TEST: user access validated for ${user.email}`;
    }
    
    @Get("/access/admin")
    @Authorized("admin")
    adminAccess(@CurrentUser() user: DeepPartial<User>) {
        console.log(`GET /users/access/admin`.bgCyan);
        return `TEST: admin access validated for ${user.email}`;
    }
    
    @Get("/access/all")
    @Authorized(["admin", "user"])
    allAccess(@CurrentUser() currentUser: DeepPartial<User>) {
        console.log(`GET /users/access`.bgCyan);
        return `TEST: access validated for ${currentUser.email} as ${currentUser.profile} `;
    }
    
    @Get()
    @Authorized()
    getAll() {
        console.log(`GET /users`.bgCyan);
        return this.userService.getAll();
    }
    
    @Get("/:id")
    @Authorized()
    getById(@Param("id") id: number) {
        console.log(`GET /users/${id}`.bgCyan);
        return this.userService.getById(id);
    }
    
    @Post()
    @Authorized("admin")
    post(@Body() user: DeepPartial<User>) {
        console.log(`POST /users`.bgCyan);
        return this.userService.create(user);
    }
    
    @Put("/:id")
    @Authorized(["admin", "user"])
    put(@Param("id") id: number, @Body({ validate: true }) user: DeepPartial<User>, @CurrentUser() currentUser: DeepPartial<User>) {
        console.log(`PUT /users/${id}`.bgCyan);
        return this.userService.update(id, user, currentUser);
    }
    
    @Delete("/:id")
    @Authorized("admin")
    remove(@Param("id") id: number) {
        console.log(`DEL /users/${id}`.bgCyan);
        return this.userService.del(id);
    }
        
    @Post('/reset')
    @Authorized("admin")
    resetData() {
        console.log(`POST /reset`.bgCyan);
        if (!this.userService.resetData()) return 'KO';
        return 'OK'
    }
}
