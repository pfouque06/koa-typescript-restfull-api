import { createConnection, getConnection } from 'typeorm';
import { config } from 'dotenv';
import 'reflect-metadata';
import { entities } from '../entities/models'

//////////////////////////////////////////////////////
// DB Factory

// load .env data
config(); const {db_host, db_port, db_user, db_pwd, db_schema} = process.env;
// console.log(db_host, db_port, db_user, db_pwd, db_schema);

// connect to DB
export const DBsynchronize = async (flush: boolean) => {
    await getConnection().synchronize(flush) // true will drop tables after initial connection
    .then(() => console.log(`synchronized with DB: jdbc:mysql//${db_user}@${db_host}:${db_port}/${db_schema}`.bgGreen.bold))
    .catch(() => console.log('Failed to sync with DB!'.bgRed.bold));
}

// DB connection & entities init with typeorm module
export const DBconnection = async () : Promise<void> => {


    const connection = await createConnection({
        type: "mysql", 
        host: db_host,
        port: +db_port,
        username: db_user,
        password: db_pwd,
        database: db_schema,
        entities: entities,  
        logging: ["schema", "info", "warn", "error", "log"],
    })

    // connect to DB
    await DBsynchronize(true);

    // app.context.db = connection;
}