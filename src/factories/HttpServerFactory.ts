import { config } from 'dotenv';
import { BaseFactory } from './BaseFactory';
import * as swaggerSpec from './swagger.json';
import { AuthService } from '../services/AuthService';
import Container from 'typedi';
import * as Koa from 'koa';
import { Action, createKoaServer, useContainer } from "routing-controllers";
import { getConnection } from "typeorm";
import { controllers } from '../controllers';
import Router = require('koa-router');
import { koaSwagger } from 'koa2-swagger-ui';
import https from 'https';
import fs from 'fs';
import { LogMiddleware, middlewares } from '../middleware';

// load .env data
config(); const {node_env, http_port, https_port } = process.env;

export class HttpServerFactory extends BaseFactory {

    async init(): Promise<void> {
        console.log(`${LogMiddleware.isoDate()} HttpServerFactory.init()`.bgBlack.white);

        const authService: AuthService = Container.get<AuthService>(AuthService);
    
        // declare services to controllers with routing-controllers module
        useContainer(Container);
    
        // Koa Server init
        const app: Koa = createKoaServer({ // or const app: Koa<DefaultState, DefaultContext> = new Koa();llers module
            middlewares: middlewares,
            controllers: controllers,
            development: (String(node_env).toLowerCase() != "prod"),
            // errorOverridingMap: { name: "name", message: "message", stack: "" }, // attemp to remove stack (name, message, stack)
            // authorizationChecker: async (): Promise<boolean> => {
            async authorizationChecker(action: Action, profiles: string[]): Promise<boolean> {
                // console.log(`@startApp.authorizationChecker(profiles: ${profiles})`.cyan);
                return await authService.authorizationChecker(action, profiles);
            },
            async currentUserChecker(action: Action) {
                // console.log(`@startApp.currentUserChecker()`.cyan);
                return await authService.currentUserChecker(action);
            }, 
        })
        // assign DBconnection reference to Koa
        app.context.db = getConnection();
        
        // swagger init
        app.use(
            koaSwagger({
                title: 'swagger', // page title
                routePrefix: '/swagger', // host at /swagger instead of default /docs
                swaggerOptions: {
                    spec: swaggerSpec,
                    // url: 'http://petstore.swagger.io/v2/swagger.json', // example path to json
                },
            })
        );
    
    
        //////////////////////////////////////////////////////
        // demo for koa_router
        const router: Router = new Router();
    
        // Cascading process with next() method
        router.get('/', async (ctx, next) => { // or router.get('/', async (ctx: ParameterizedContext<DefaultState, DefaultContext>, next) => {
            // console.log(`--------------------------------------------------`.bgCyan);
            console.log(`${LogMiddleware.isoDate()} HELLO service`.bgCyan);
            await next();
            ctx.body= 'Hello buddy';
            console.log('finally ', ctx.body);
            const rt = ctx.response.get('X-Response-Time');
            console.log(`${ctx.method} ${ctx.url} - ${rt}`);
        })
        
        router.get('/', async (ctx, next) => {
            const start = Date.now();
            console.log('before ', ctx.body);
            await next();
            console.log('after ', ctx.body);
            const ms = Date.now() - start;
            // console.log('X-Response-Time', `${ms}ms`);
            ctx.set('X-Response-Time', `${ms}ms`);
        })
        
        router.get('/', async (ctx) => {
            ctx.body= 'Hi there, buddy';
        })
        app.use(router.routes()).use(router.allowedMethods);
        //////////////////////////////////////////////////////
        
        //////////////////////////////////////////////////////
        // http: start listener
        // Shorthand for: http.createServer(app.callback()).listen(...)
        app.listen(http_port).on('listening', () => console.log(`Server started on port = ${http_port} [${String(node_env).toUpperCase()}], test on http://localhost:${http_port}`.bgGreen.bold))
        //////////////////////////////////////////////////////

        //////////////////////////////////////////////////////
        // https: start listener
        const options = {
            // Local certificates, if you don;t have them generate from mkcert or letsEncrypt
            key: fs.readFileSync("./ssl/key.pem"),
            cert: fs.readFileSync("./ssl/cert.pem")
        };
        
        function listeningReporter() {
            // `this` refers to the http server here
            // const { address, port } = this.address();
            // const protocol = this.addContext ? 'https' : 'http';
            // console.log(`Listening on ${protocol}://${address}:${port}...`);
            console.log(`Server started on port = ${https_port} [${String(node_env).toUpperCase()}], test on https://localhost:${https_port}`.bgGreen.bold);
        }

        const httpsServer = https.createServer(options, app.callback())
            .listen(Number(https_port)).on('listening', ()  => listeningReporter());
        //////////////////////////////////////////////////////
    }
}