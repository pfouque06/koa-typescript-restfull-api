import { config } from 'dotenv';
import * as Koa from 'koa';
import { Action, createKoaServer } from "routing-controllers";
import { getConnection } from "typeorm";
import { controllers } from '../controllers';
import Router = require('koa-router');
import Container from 'typedi';
import { AuthService } from '../services/AuthService';

// load .env data
config(); const {server_port } = process.env;

export const httpServerFactor = async (): Promise<void> => {

    const authService: AuthService = Container.get<AuthService>(AuthService);

    // Koa Server init
    const app: Koa = createKoaServer({ // or const app: Koa<DefaultState, DefaultContext> = new Koa();llers module
        controllers: controllers,
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
    
    //////////////////////////////////////////////////////
    // demo for koa_router
    const router: Router = new Router();

    // Cascading process with next() method
    router.get('/', async (ctx, next) => { // or router.get('/', async (ctx: ParameterizedContext<DefaultState, DefaultContext>, next) => {
        console.log(`-------------------------`);
        console.log(`------- HELLO -----------`);
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
    app.listen(server_port).on('listening', () => console.log(`Server started on port = ${server_port}, test on http://localhost:${server_port}`.bgGreen.bold))
    //////////////////////////////////////////////////////
}