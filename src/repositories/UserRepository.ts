import { Connection } from "typeorm";
import { User } from "../entities/User";
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {

    constructor(db: Connection) {
        super(db.getRepository(User));
        console.log('Start UserRepository'.underline);
    }
}