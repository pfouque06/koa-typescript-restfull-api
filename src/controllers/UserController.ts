import { Param, Body, Get,  Post, Put, Delete, JsonController,  Authorized, CurrentUser } from "routing-controllers";
import { DeepPartial } from "typeorm";
import { User } from "../entities/models/User";
import { Logger } from "../factories/Logger";
import { UserService } from "../services/UserService";

// @Controller()
@JsonController("/users") // to ensure server deals only with json body types and uri starts with /users
export class UserController {

    constructor(private readonly userService: UserService) {
        console.log("Start UserController".underline);
    }
    
    @Get()
    @Authorized()
    getAll() {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} GET /users`.bgCyan);
        return this.userService.getAll();
    }
    
    @Get("/:id")
    @Authorized()
    getById(@Param("id") id: number) {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} GET /users/${id}`.bgCyan);
        return this.userService.getById(id);
    }
    
    @Post()
    @Authorized("admin")
    post(@Body() user: DeepPartial<User>) {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} POST /users`.bgCyan);
        return this.userService.create(user);
    }
    
    @Put("/:id")
    @Authorized(["admin", "user"])
    put(@Param("id") id: number, @Body({ validate: true }) user: DeepPartial<User>, @CurrentUser() currentUser: DeepPartial<User>) {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} PUT /users/${id}`.bgCyan);
        return this.userService.update(id, user, currentUser);
    }
    
    @Delete("/:id")
    @Authorized("admin")
    remove(@Param("id") id: number) {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} DEL /users/${id}`.bgCyan);
        return this.userService.del(id);
    }
    
    @Post('/reset')
    @Authorized("admin")
    resetData() {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${Logger.isoDate()} POST /reset`.bgCyan);
        if (!this.userService.resetData()) return 'KO';
        return 'OK'
    }
}