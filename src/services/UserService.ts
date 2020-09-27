import 'colors';
import { Service } from "typedi/decorators/Service";
import { Connection } from "typeorm";
import { User } from "../entities/User";
import { BaseService } from "./BaseService";

@Service()
export class UserService extends BaseService<User> {
    constructor(db: Connection) {
        super(db.getRepository(User));
        console.log('Start UserService'.underline);
    }
}