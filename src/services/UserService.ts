import 'colors';
import { Service } from "typedi/decorators/Service";
import { Connection, Repository } from "typeorm";
import { User } from "../entities/User";
import { BaseService } from "./BaseService";

@Service()
export class UserService extends BaseService<User> {

    // public repo: Repository<User>  --> migrated to BaseService

    // constructor(db: Connection) { 
    //     this.repo = db.getRepository(User); --> migrated to BaseService
    // }

    constructor(db: Connection) {
        super(db.getRepository(User));
        console.log('Start UserService'.underline);
    }
}