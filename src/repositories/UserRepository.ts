import { config } from "dotenv";
import { getConnection } from "typeorm";
import { userEntityNames } from "../entities/models";
import { User } from "../entities/models/User";
import { BaseRepository } from './BaseRepository';

// load .env data
config(); const {db_type, db_schema} = process.env;

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
        console.log(`db type: `,db_type);
        switch (db_type) {
            case "mysql": {
                console.log(`db query: SET FOREIGN_KEY_CHECKS=0;`);
                await db.query(`SET FOREIGN_KEY_CHECKS=0;`);

                for await (const entity of userEntityNames) {
                    console.log(`db query: TRUNCATE TABLE ${db_schema}.${entity};`);
                    const rawData = await db.query(`TRUNCATE TABLE ${db_schema}.${entity};`); 
                }

                console.log(`db query: SET FOREIGN_KEY_CHECKS=1;`);
                await db.query(`SET FOREIGN_KEY_CHECKS=1;`); 
                break;
            }
            case "sqlite": {
                for await (const entity of userEntityNames) {
                    // delete from your_table;    
                    // delete from sqlite_sequence where name='your_table';
                    const rawData1 = await db.query(`DELETE FROM ${entity};`); 
                    const rawData2 = await db.query(`DELETE FROM SQLITE_SEQUENCE WHERE NAME='${entity}';`); 
                }
                await db.query(`VACUUM;`); 
                break;
            }
        }

        return true;
    }
}