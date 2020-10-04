import * as redis from 'redis';
import * as JWTR from 'jwt-redis';
import { DeepPartial, getConnection } from 'typeorm';
import { User } from '../entities/models/User';
import { config } from 'dotenv';
import { Action, NotFoundError, UnauthorizedError } from 'routing-controllers';
import { HttpError } from 'koa';
import { genSalt, hash } from 'bcryptjs';

config()
const { JWT_SECRET } = process.env

export class AuthService {

    public redisClient: redis.RedisClient;
    public jwtr: JWTR.default;
    
    constructor() {
        console.log('Start AuthService'.underline);
        this.redisClient = redis.createClient({
            host: "127.0.0.1",
            port: 6379
        });
        this.jwtr = new JWTR.default(this.redisClient);
    }

    async authenticateUser(password: string, user: DeepPartial<User>): Promise<User> {
        console.log(`-> AuthService.authenticateUser(password, user)`.bgYellow);
        // validate hash from password and user's salt
        try {
            const hashedPass = await hash(password, user.salt)
            if (hashedPass === user.password) {
                delete user.password // unsafe to keep 
                delete user.salt // unsafe to keep 
                // const jwt = sign(JSON.parse(JSON.stringify(user)), JWT_SECRET)
                const jwt: string = await this.generateJWT({...user});
                // console.log(jwt);
                // return { ...user, accessToken: jwt };   
                return { ...user, accessToken: jwt } as User;   
            } else throw Error()
        } catch {
            throw new UnauthorizedError(`wrong password for ${user.email}`)
        }
    }

    async generateJWT(user: DeepPartial<User>): Promise<string> {
        console.log(`--> AuthService.generateJWT(user)`.bgYellow);
        return await this.jwtr.sign({...user}, JWT_SECRET);
    }

    async destroyJWT(token: string): Promise<boolean> {
        console.log(`-> AuthService.destroyJWT(token)`.bgYellow);
        if (! token) throw new NotFoundError(`token session is not provided`);
        // retrieve generated tojen identifier
        const {jti} =  this.jwtr.decode(token) as {jti};
        // console.log(`jti: ${jti}`);
        if (! await this.jwtr.destroy(jti)) throw new NotFoundError(`unknown token`);
        return true;
    }

    async flushDB(): Promise<void> {
        console.log(`-> AuthService.flushDB()`.bgYellow);
        this.redisClient.flushdb();
    }  

    async authorizationChecker(action: Action, profiles: string[]): Promise<boolean> {
        // console.log(`-> AuthService.authorizationChecker(action, profiles)`.bgYellow);
        const token = this.parseJWT(action.request.headers);
        try {
            await this.jwtr.verify(token, JWT_SECRET);
        } catch { throw new UnauthorizedError("Unauthorized access"); }
        const decodedUser: DeepPartial<User> = this.decodeJWT(token);
        // console.log(`provided user email: ${decodedUser.email}`)
        const user = await getConnection().getRepository(User).findOneOrFail(decodedUser.id);
        if (!user) throw new NotFoundError(`user not found`);
        if (!profiles.length || (profiles.length && profiles.find(profile => user.profile == profile))) return true;
        return false;
    }
    
    async currentUserChecker(action: Action) {
        // console.log(`-> AuthService.currentUserChecker(actopn)`.bgYellow);
        const token = this.parseJWT(action.request.headers);
        const decodedUser: DeepPartial<User> = this.decodeJWT(token);
        // console.log(`provided user email: ${decodedUser.email}`)
        try { 
            return { ...await getConnection().getRepository(User).findOneOrFail(decodedUser.id), accessToken: token }; 
        } catch { throw new NotFoundError(`user not found`); }
    }

    async saltAndHashUser(user: DeepPartial<User>): Promise<DeepPartial<User>> {
        if (user.password) {
            user.salt = await genSalt();
            user.password = await hash(user.password || "", user.salt);
        }
        return user;
    }
    
    parseJWT({ authorization }: any) : string { //Authorization: Bearer TOKEN_STRING
        // const token: string = authorization.split(' ')[1];
        const [, token]: string = authorization.split(' ')
        // console.log(`-> Authorization: ${authorization}-> token: ${token}`.cyan);
        return token;
    }

    decodeJWT(token: string): DeepPartial<User> {
        return this.jwtr.decode(token) as DeepPartial<User>;
    }
}