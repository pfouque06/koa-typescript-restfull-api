import { Connection } from "typeorm";
import { User } from "../entities/models/User";
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {

    constructor(db: Connection) {
        console.log('Start UserRepository'.underline);
        super(db, db.getRepository(User), new User());
    }
}