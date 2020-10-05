import { config } from 'dotenv';
import * as Koa from 'koa';
import { Action, createKoaServer } from "routing-controllers";
import { getConnection } from "typeorm";
import { controllers } from '../controllers';
import Router = require('koa-router');
import Container from 'typedi';
import { AuthService } from '../services/AuthService';
import { koaSwagger } from 'koa2-swagger-ui';
import * as swaggeSpec from './swagger.json';

// load .env data
config(); const {node_env, server_port } = process.env;

export const httpServerFactory = async (): Promise<void> => {

    const authService: AuthService = Container.get<AuthService>(AuthService);

    // Koa Server init
    const app: Koa = createKoaServer({ // or const app: Koa<DefaultState, DefaultContext> = new Koa();llers module
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
        }
    })
    // assign DBconnection reference to Koa
    app.context.db = getConnection();
    
    // swagger init
    app.use(
        koaSwagger({
            title: 'swagger', // page title
            routePrefix: '/swagger', // host at /swagger instead of default /docs
            swaggerOptions: {
                spec: swaggeSpec,
                // url: 'http://petstore.swagger.io/v2/swagger.json', // example path to json
            },
        })
    );


    //////////////////////////////////////////////////////
    // demo for koa_router
    const router: Router = new Router();

    // Cascading process with next() method
    router.get('/', async (ctx, next) => { // or router.get('/', async (ctx: ParameterizedContext<DefaultState, DefaultContext>, next) => {
        console.log(`--------------------------------------------------`.bgCyan);
        console.log(`${new Date().toISOString()} HELLO service`.bgCyan);
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
    // start listener
    app.listen(server_port).on('listening', () => console.log(`Server started on port = ${server_port} [${String(node_env).toUpperCase()}], test on http://localhost:${server_port}`.bgGreen.bold))
    //////////////////////////////////////////////////////
}