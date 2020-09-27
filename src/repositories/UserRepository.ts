import { Connection } from "typeorm";
import { User } from "../entities/User";
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {

    // public repo: Repository<User>  --> migrated to BaseService

    // constructor(db: Connection) { 
    //     this.repo = db.getRepository(User); --> migrated to BaseService
    // }

    constructor(db: Connection) {
        super(db.getRepository(User));
        console.log('Start UserRepository'.underline);
    }
}