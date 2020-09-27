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
import { hash, genSalt } from "bcrypt";
import { validate, ValidationError } from "class-validator";

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
    getOne(@Param("id") id: number) {
        console.log(`GET /users/${id}`.bgCyan);
        return this.userService.getById(id);
    }
    
    @Post()
    async post(@Body() user: DeepPartial<User>) {
        console.log(`POST /users`.bgCyan);
        console.log(`Body: `, user);
        
        // create new User instance
        const instance: DeepPartial<User> = this.userService.getInstance(user);
        
        // validattion steps
        const validationResult: Array<ValidationError> = await validate(instance);
        if (validationResult.length > 0) throw validationResult;

        // generate salt & hash password with salt
        instance.salt = await genSalt();
        instance.password = await hash(user.password || "", instance.salt);
        console.log(`Instance: `, instance);
        return this.userService.create(user, instance);
    }
    
    @Put("/:id")
    async put(@Param("id") id: number, @Body({ validate: true }) user: DeepPartial<User>) {
        console.log(`PUT /users/${id}`.bgCyan);
        // handle password change request if any
        if (user.password) {
            // generate salt & hash password with salt
            user.salt = await genSalt();
            user.password = await hash(user.password || "", user.salt);
        }
        console.log(`Body: `, user);
        return this.userService.update(id, user);
    }
    
    @Delete("/:id")
    remove(@Param("id") id: number) {
        console.log(`DEL /users/${id}`.bgCyan);
        return this.userService.del(id);
    }
}
