import { createConnection, getConnection } from 'typeorm';
import { config } from 'dotenv';
import 'reflect-metadata';
import { entities } from '../entities/models'

//////////////////////////////////////////////////////
// DB Factory

// load .env data
config(); const {db_type, db_host, db_port, db_user, db_pwd, db_schema} = process.env;
// console.log(db_host, db_port, db_user, db_pwd, db_schema);

// connect to DB
export const DBsynchronize = async (flush: boolean) => {
    await getConnection().synchronize(flush) // true will drop tables after initial connection
    .then(() => console.log(`Synchronize with DB: jdbc:${db_type}//${db_schema }`.bgGreen.bold))
    .catch(() => console.log('Failed to sync with DB!'.bgRed.bold));
}

// DB connection & entities init with typeorm module
export const DBconnection = async () : Promise<void> => {

    switch (db_type) {
        case "mysql": {
            await createConnection({
                type: "mysql",
                host: db_host, // default: localhost
                port: +db_port, // default: 3306
                username: db_user,
                password: db_pwd,
                database: db_schema, // default: koatypescript
                entities: entities,  
                logging: ["schema", "info", "warn", "error", "log"],
            });
            break;
        }
        case "sqlite": {
            await createConnection({
                type: "sqlite",
                database: db_schema, // default: ./koa.db
                entities: entities,
                logging: ["schema", "info", "warn", "error", "log"],
            });
            break;
        }
    }

    // connect to DB
    await DBsynchronize(true);

    // app.context.db = connection;
}