import 'colors';
import { config} from 'dotenv';
import * as Koa from 'koa';
import { DefaultState, DefaultContext, ParameterizedContext} from 'koa';
import * as Router from 'koa-router';
import { DBconnection } from './entities';
import { Post } from './entities/post';
import { User } from './entities/user';

// load .env data
config(); const {server_port} = process.env;
// console.log(server_port);

//test 
const toto: User = new User();
const postA: Post = new Post();

const startApp = async () => {
    
    // const app: Koa<DefaultState, DefaultContext> = new Koa();
    const app: Koa = new Koa();
    const router: Router = new Router();
    
    await DBconnection(app);
    
    // Cascading process with next() method
    // router.get('/', async (ctx: ParameterizedContext<DefaultState, DefaultContext>, next) => {
    router.get('/', async (ctx, next) => {
        await next();
        ctx.body= 'Hello buddies';
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
        ctx.body= 'Hi there, buddies';
    })
    
    app.use(router.routes()).use(router.allowedMethods);
    app.listen(server_port).on('listening', () => console.log(`Server started on port = ${server_port}, test on http://localhost:${server_port}`.blue.bold))
}

startApp();