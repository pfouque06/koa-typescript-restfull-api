## koa-typescript-restfull-api

This is a technical Demo for a restfull API server on node.js with typescript and Koa server.
additional modul plugin used for this application are :
- mysql, sqlite3, typeorm, reflect-metadata, class-validator, class-transformer for DB relations, definitions and usage in repository
- typedi for dependancy injection in services
- routing-controllers, koa-bodyparser for controllers
- bcrypt for pasword hash and salt
- jsonwebtoken, jwt-redis, redis for JWT handling
- colors for console log coloring
- dotenv for hiding env properties
- moment for better date type handling

The application rely on a local mysql or sqlite (for easier deployment) database.

Create .env file for static properties like this: 

- mysql properties :
> db_type=mysql  
> db_host=localhost  
> db_port=3306  
> db_user=root  
> db_pwd=<tbd>  
> db_schema=koatypescript  

- sqlite properties :
> db_type=sqlite  
> db_schema=./koa.db  

- Authentication DB and JWT properties
> redis_host=127.0.0.1  
> redis_port=6379  
> JWT_secret=secret  
> JWT_expiration_delay=20s  

- HTTP server properties
> node_env=prod  
> http_port=8080  
> https_port=8443  

ts-node-dev is used in development lifecycle. Use "npm run dev" command to start the application.

tsc --build and ts-node are usde for production

project is live at http://nodejs.koa-typescript-restfull-api.pfouque.fr:8080/swagger
login with user and store Bearer for user Authorization header: 
> { "email": "sam.va@gmail.com", "password": "secret" }  
> { "email": "jean.pile@gmail.com", "password": "secret" }  

note: command lines to build up this project :

##### check if npm is installed

> $ npm --version

##### init project with default properties
> $ mkdir <project_dir>; cd <project_dir>  
> $ npm init -y

##### init git and add remote repository if any (pfouque06/koa-typescript-restfull-api in my case)
> $ git init  
> $ git remote origin git@github.com:pfouque06/koa-typescript-restfull-api.git

##### install typescript and associated dependancies
> $ npm i -D typescript ts-node ts-node-dev @types/node  

##### install tooling
> $ npm i dotenv  @types/dotenv colors moment  
> $ npm i -D @types/colors @types/moment  

##### install ORM tools
> $ npm i mysql  sqlite3 typeorm reflect-metadata class-validator class-transformer  
> $ npm i -D @types/colors @types/moment  

##### install Dependancy Injection tools
> $ npm i typedi  

##### install koa module and associated dependancies
> $ npm i koa koa-bodyparser koa-router routing-controllers bcrypt jsonwebtoken  
> $ npm i -D @types/koa @types/koa-bodyparser @types/koa-router @types/bcrypt @types/jsonwebtoken  

##### add following  in script section of package.json file and use npm command :
> "scripts": {  
>   "dev": "ts-node-dev src/app.ts"  
>   "build": "tsc --build",  
>   "prod": "ts-node dist/app.js",  
> }  

##### make tsconfig.json similar to 
> {  
>     "compilerOptions": {  
>         "target": "es6",  
>         "module": "commonjs",  
>         "experimentalDecorators": true,  
>         "emitDecoratorMetadata": true,  
>         "outDir": "./dist",  
>         // "strict": true,  
>         // "esModuleInterop": true,  
>     },  
>     "include": ["./src/**/*"],  
>     "exclude": ["node_modules", "__tests__/**/*"]  
> }  

##### use npm command to run application in dev mode:
> $ npm run dev

##### use npm command to build application for prod mode:
> $ npm run build

##### use npm command to run application in prod mode:
> $ npm run prod

## next version of authorisation handle: jwt-redis (jswonwebtoken with redis for token destroy enablement)

##### install redis and jwt-redis
> $ npm i redis jwt-redis  
> $ npm i -D @types/redis  

##### install redis on Debian
> sudo apt install redis  
> $ redis-cli

##### install redis on Synology Nas : select redis on packagecenter with SynoComunnity package Source :
> Syno Community : http://packages.synocommunity.com  
> $ cd /var/packages/redis/target/bin  
> $ ./redis-cli

##### check server via redis-cli
> 127.0.0.1:6379> ping  
> PONG  
> 127.0.0.1:6379> info  
> (..)  
> redis_version:5.0.7  
> process_id:1855  
> tcp_port:6379  
> 127.0.0.1:6379> exit  


## next version : the API is fully dockyfied with a redis container along!!!

### once the api is cloned from github, create .env file with the redis_host changed to :
> ####### Authentication DB properties #######
> #redis_host=127.0.0.1
> redis_host=db_auth

##### prod :
> $ sudo docker-compose -f docker-compose.prod.yml up

##### dev :
> $ sudo docker-compose up

