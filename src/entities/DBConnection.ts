import * as Koa from 'koa';
import { createConnection } from 'typeorm';
import { config } from 'dotenv';
import 'reflect-metadata';
import { User } from './User';
import { Post } from './Post';

// load .env data
config(); const {db_host, db_port, db_user, db_pwd, db_schema} = process.env;
// console.log(db_host, db_port, db_user, db_pwd, db_schema);

export const DBconnection = async (app: Koa) : Promise<void> => {

    const connection = await createConnection({
        type: "mysql", 
        host: db_host,
        port: +db_port,
        username: db_user,
        password: db_pwd,
        database: db_schema,
        entities: [User, Post],  
        logging: ["schema", "info", "warn", "error", "log"],
    })

    // connect to DB
    await connection.synchronize(false) // true will drop tables after initial connection
    .then(() => console.log('synchronized with DB!'.bgGreen.bold))
    .catch(() => console.log('Failed to sync with DB!'.bgRed.bold));

    app.context.db = connection;
}