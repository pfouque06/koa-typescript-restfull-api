import { config } from 'dotenv';
import { BaseFactory } from './BaseFactory';
import { createConnection, getConnection } from 'typeorm';
import 'reflect-metadata';
import { entities } from '../entities/models'
import { LogMiddleware } from '../middleware';

//////////////////////////////////////////////////////
// DB Factory

// load .env data
config(); const {db_type, db_host, db_port, db_user, db_pwd, db_schema} = process.env;
// console.log(db_host, db_port, db_user, db_pwd, db_schema);

export class DataBaseFactory extends BaseFactory {

    constructor() { super(); }

    // connect to DB
    // public static async synchronize(flush: boolean) {
    async synchronize(flush: boolean):  Promise<void> {
        console.log(`${LogMiddleware.isoDate()} DataBaseFactory.synchronize()`.bgBlack.white);

        await getConnection().synchronize(flush) // true will drop tables after initial connection
        .then(() => console.log(`Synchronize with DB: jdbc:${db_type}//${db_schema }`.bgGreen.bold))
        .catch(() => console.log('Failed to sync with DB!'.bgRed.bold));
    }

    // DB connection & entities init with typeorm module
    // public static async init() : Promise<void> {
    async init() : Promise<void> {
        console.log(`${LogMiddleware.isoDate()} DataBaseFactory.init()`.bgBlack.white);

        switch (db_type) {
            case "mysql": {
                await createConnection({
                    type: "mysql",
                    host: db_host, // default: localhost
                    port: Number(db_port), // default: 3306
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
                    database: String(db_schema), // default: ./koa.db
                    entities: entities,
                    logging: ["schema", "info", "warn", "error", "log"],
                });
                break;
            }
        }
        
        // connect to DB
        await this.synchronize(true);
        
        // app.context.db = connection;
    }
}