import {
    Param,
    Body,
    Get,
    Post,
    Put,
    Delete,
    JsonController,
} from "routing-controllers";
import { DeepPartial } from "typeorm";
import { User } from "../entities/User";
import { UserService } from "../services/UserService";

// @Controller()
@JsonController("/users") // to ensure server deals only with json body types and uri starts with /users
export class UserController {
    constructor(private readonly userService: UserService) {
        console.log("Start UserController".underline);
    }
    
    @Get()
    getAll() {
        console.log(`GET /users`.bgCyan);
        return this.userService.getData();
    }
    
    @Get("/:id")
    getById(@Param("id") id: number) {
        console.log(`GET /users/${id}`.bgCyan);
        return this.userService.getById(id);
    }
    
    @Post()
    async post(@Body() user: DeepPartial<User>) {
        console.log(`POST /users`.bgCyan);
        return this.userService.create(user);
    }
    
    @Put("/:id")
    async put(@Param("id") id: number, @Body({ validate: true }) user: DeepPartial<User>) {
        console.log(`PUT /users/${id}`.bgCyan);
        return this.userService.update(id, user);
    }
    
    @Delete("/:id")
    remove(@Param("id") id: number) {
        console.log(`DEL /users/${id}`.bgCyan);
        return this.userService.del(id);
    }
}
