import * as redis from 'redis';
import * as JWTR from 'jwt-redis';
import { DeepPartial, getConnection } from 'typeorm';
import { User } from '../entities/models/User';
import { config } from 'dotenv';
import { Action, NotFoundError, UnauthorizedError } from 'routing-controllers';
import { genSalt, hash } from 'bcryptjs';

config()
const { redis_host, redis_port, JWT_secret, JWT_expiration_delay } = process.env

export class AuthService {

    public redisClient: redis.RedisClient;
    public jwtr: JWTR.default;
    
    constructor() {
        console.log(`Start AuthService(expiration delay: ${JWT_expiration_delay})`.underline);

        // reddis db init
        this.redisClient = redis.createClient({
            host: redis_host, // default: "127.0.0.1",
            port: Number(redis_port) // default: 6379
        });
        console.log(`Synchronize with DB: Redis://${redis_host}:${redis_port}`.bgGreen.bold);

        // JWTR init
        this.jwtr = new JWTR.default(this.redisClient);
    }

    async authenticateUser(password: string, user: DeepPartial<User>): Promise<User> {
        console.log(`-> AuthService.authenticateUser(password, user)`.bgYellow);
        // validate hash from password and user's salt
        try {
            const hashedPass = await hash(password, user.salt as string)
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
            throw new UnauthorizedError(`Error: wrong password for ${user.email}`)
        }
    }

    async generateJWT(user: DeepPartial<User>): Promise<string> {
        console.log(`--> AuthService.generateJWT(user)`.bgYellow);
        console.log(`JST_expiration_delay=${JWT_expiration_delay}`);
        return await this.jwtr.sign({ ...user }, JWT_secret as string, { expiresIn: JWT_expiration_delay });
    }

    async destroyJWT(token: string): Promise<boolean> {
        console.log(`-> AuthService.destroyJWT(token)`.bgYellow);
        if (! token) throw new NotFoundError(`Error: token session is not provided`);
        // retrieve generated tojen identifier
        const {jti} =  this.jwtr.decode(token) as {jti: string};
        // console.log(`jti: ${jti}`);
        if (! await this.jwtr.destroy(jti)) throw new NotFoundError(`Error: unknown token`);
        return true;
    }

    async flushDB(): Promise<void> {
        console.log(`-> AuthService.flushDB()`.bgYellow);
        this.redisClient.flushdb();
    }  

    async authorizationChecker(action: Action, profiles: string[]): Promise<boolean> {
        // console.log(`-> AuthService.authorizationChecker(action, profiles)`.bgYellow);
        let token: string; 
        try {
            token = this.parseJWT(action.request.headers);
            await this.jwtr.verify(token, JWT_secret as string);
        // } catch { throw new UnauthorizedError("Unauthorized access"); }
        } catch (error) { 
            // console.log(error);
            switch (error.name) {
                case "TypeError":
                    throw new UnauthorizedError("Error: session JWT not provided");
                case "TokenExpiredError":
                    throw new UnauthorizedError("Error: Expired session");
                default:
                    throw new UnauthorizedError("Error: Unauthorized access");
            }
        }
        const decodedUser: DeepPartial<User> = this.decodeJWT(token);
        // console.log(`provided user email: ${decodedUser.email}`)
        const user = await getConnection().getRepository(User).findOneOrFail(decodedUser.id);
        if (!user) throw new NotFoundError(`Error: user not found`);
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
        } catch { throw new NotFoundError(`Error: user not found`); }
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