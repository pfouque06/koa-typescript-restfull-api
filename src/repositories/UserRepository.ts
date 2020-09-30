import { config } from "dotenv";
import { getConnection } from "typeorm";
import { userEntityNames } from "../entities/models";
import { User } from "../entities/models/User";
import { BaseRepository } from './BaseRepository';

// load .env data
config(); const {db_schema} = process.env;

export class UserRepository extends BaseRepository<User> {

    constructor() {
        console.log('Start UserRepository'.underline);
        super(getConnection().getRepository(User), new User());
    }

        
    // repositor flush function
    async flush(): Promise<boolean> {
        console.log(`-> UserRepository.flush()`.bold);
        
        console.log(`dropping all tables`.underline);
        // await DBsynchronize(true);

        const db = getConnection();
        await db.query(`SET FOREIGN_KEY_CHECKS=0;`); 
        for await (const entity of userEntityNames) {
            const rawData = await db.query(`TRUNCATE TABLE ${db_schema}.${entity};`); 
        }
        await db.query(`SET FOREIGN_KEY_CHECKS=1;`); 

        return true;
    }
}