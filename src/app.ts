import 'colors';
import { config} from 'dotenv';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import { Action, createKoaServer, UnauthorizedError, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { controllers } from './controllers';
import { DBconnection } from './entities/DBConnection';
import { services } from './services';
import { decode, verify } from 'jsonwebtoken'
import { DeepPartial, getConnection } from 'typeorm';
import { User } from './entities/User';

// load .env data
config(); const {server_port, JWT_SECRET } = process.env;
// console.log(server_port);

// test 
// const toto: User = new User();
// const postA: Post = new Post();

const startApp = async () => {
    
    // JWT methods : get and decode
    const getJWT = ({ authorization }: any): string => { //Authorization: Bearer TOKEN_STRING
        // const [, token]: string = authorization.split(' ')
        const token: string = authorization.split(' ')[1];
        // console.log(`-> Authorization: ${authorization}`.cyan);  
        // console.log(`-> token: ${token}`.cyan);
        return token;
    }
    const decodeJWT = (token: string): DeepPartial<User> =>
    decode(token) as DeepPartial<User>

    // Koa Server init
    // const app: Koa<DefaultState, DefaultContext> = new Koa();
    const app: Koa = createKoaServer({
        // controllerd init with routing-controllers module
        controllers: controllers,
        // authorizationChecker: async (): Promise<boolean> => {
        async authorizationChecker(action: Action, profiles: string[]): Promise<boolean> {
            try {
                console.log(`@startApp.authorizationChecker(profiles: ${profiles})`.cyan);
                const token = getJWT(action.request.headers);
                if (!verify(token, JWT_SECRET)) throw new UnauthorizedError();
                const decodedUser: DeepPartial<User> = decodeJWT(token);
                const user = await getConnection().getRepository(User).findOneOrFail(decodedUser.id)
                if (!user) throw Error();
                if (!profiles.length || (profiles.length && profiles.find(profile => user.profile == profile))) return true;
                return false
            } catch {
                throw new UnauthorizedError();
            }
        },
        async currentUserChecker(action: Action) {
            try {
                console.log(`@startApp.currentUserChecker()`.cyan);
                const token = getJWT(action.request.headers);
                const decodedUser: DeepPartial<User> = decodeJWT(token);
                return await getConnection().getRepository(User).findOneOrFail(decodedUser.id);
            } catch {
                throw new UnauthorizedError();
            }
        }
    })
    
    // DB connection & entities init with typeorm module
    await DBconnection(app);
    
    // Services & Repository init with typedi module
    services.forEach( (service) => {
        Container.set(service, new service(app.context.db))
    })
    useContainer(Container)

    // default routing option with koa_router module
    const router: Router = new Router();
    
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

    // start listener
    app.listen(server_port).on('listening', () => console.log(`Server started on port = ${server_port}, test on http://localhost:${server_port}`.bgGreen.bold))
}

startApp();