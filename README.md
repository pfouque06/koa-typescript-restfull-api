### koa-typescript-restfull-api

This is a technical Demo for a restfull API server on node.js with typescript and Koa server.
additional modul plugin used for this application are :
- mysql, sqlite3, typeorm, reflect-metadata, class-validator, class-transformer for DB relations, definitions and usage in repository
- typedi for dependancy injection in services
- routing-controllers, koa-bodyparser for controllers
- bcrypt for pasword hash and salt
- jsonwebtoken for JWT handling
- colors for console log coloring
- dotenv for hiding env properties
- moment for better date type handling

The application rely on a local mysql or sqlite (for easier deployment) database.

Create .env file for static properties like this: 

- mysql configuration :
> db_type=mysql  
> db_host=localhost  
> db_port=3306  
> db_user=root  
> db_pwd=<tbd>  
> db_schema=koatypescript  
> server_port=8080  
> JWT_SECRET=<tbd>  

- mysql configuration :
> db_type=sqlite  
> db_schema=./koa.db  
> server_port=8080  
> JWT_SECRET=<tbd>  

ts-node-dev is used in development lifecycle. Use "npm run dev" command to start the application.

it will soon be hosted and will run live as soon as possible with ts-node
