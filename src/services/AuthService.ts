import * as redis from 'redis';
import * as JWTR from 'jwt-redis';
import { DeepPartial, getConnection } from 'typeorm';
import { User } from '../entities/models/User';
import { config } from 'dotenv';
import { Action, NotFoundError, UnauthorizedError } from 'routing-controllers';
import { hash } from 'bcryptjs';
import { UserService } from './UserService';
import { Container } from 'typedi';
import { LoginForm } from '../entities/forms/LoginForm';

config()
const { redis_host, redis_port, JWT_secret, JWT_expiration_delay } = process.env

export class AuthService {
    
    public redisClient: redis.RedisClient;
    public jwtr: JWTR.default;
    public userService: UserService;
    
    constructor() {
        console.log(`Start AuthService(expiration delay: ${JWT_expiration_delay})`.underline);
        
        // reddis db init
        this.redisClient = redis.createClient({
            host: redis_host, // default: "127.0.0.1",
            port: Number(redis_port) // default: 6379
        });
        console.log(`Synchronize with DB: Redis://${redis_host}:${redis_port}`.bgGreen.bold);
        this.resetData();
        
        // JWTR init
        this.jwtr = new JWTR.default(this.redisClient);
        
        // userService loookup
        this.userService = Container.get<UserService>(UserService);
    }
    
    ping(): Promise<Boolean> {
        console.log(`-> AuthService.ping()`.bgYellow);
        return new Promise<Boolean>(resolve => resolve(true));
    }

    test(currentUser: DeepPartial<User>): Promise<String> {
        console.log(`-> AuthService.test(currentUser: ${currentUser.email})`.bgCyan);
        const result: string =`TEST: access validated for ${currentUser.email} as ${currentUser.profile} `;
        return new Promise<String>(resolve => resolve(result));
    }

    async register(userCredentials: LoginForm): Promise<User> {
        console.log(`-> AuthService.register(email: ${userCredentials.email})`.bgYellow);
        return await this.userService.create({...userCredentials});
    }

    async login(userCredentials: LoginForm): Promise<User> {
        console.log(`-> AuthService.login(email: ${userCredentials.email})`.bgYellow);
        
        // const validationRes: Array<ValidationError> = await validate(userCredentials)
        // if (validationRes.length > 0) throw validationRes
        // get required properties from already validated user Credentials
        const { email, password } = userCredentials
        
        // find user by its email
        let user: Exclude<User, { accessToken: string }>
        try {
            user = await this.userService. getByMail(email);
        } catch {
            throw new NotFoundError(`Error: user ${email} not found`)
        }
        
        // authenticate user with password from credentials
        return await this.authenticateUser(password, user);
    }
    
    async logout(currentUser: DeepPartial<User>): Promise<boolean> {
        console.log(`-> AuthService.logout(email: ${currentUser.email})`.bgYellow);
        
        // get required properties
        const { email, accessToken } = currentUser

        // find user by its email without accessToken
        try {
            // let user: Exclude<User, { accessToken: string }>
            // user = await this.userRepository.getById(null, { email })
            await this.userService. getByMail(email as string);
        } catch {
            throw new NotFoundError(`Error: user ${email} not found`)
        }

        // destroy token
        return await this.destroyJWT(accessToken as string);
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
                return { ...user, accessToken: jwt } as User;   
            } else throw Error()
        } catch {
            throw new UnauthorizedError(`Error: wrong password for ${user.email}`)
        }
    }

    async generateJWT(user: DeepPartial<User>): Promise<string> {
        console.log(`--> AuthService.generateJWT(user)`.bgYellow);
        return await this.jwtr.sign({ ...user }, JWT_secret as string, { expiresIn: JWT_expiration_delay });
    }

    async destroyJWT(token: string): Promise<boolean> {
        console.log(`-> AuthService.destroyJWT(token)`.bgYellow);
        if (! token) throw new NotFoundError(`Error: token session is not provided`);
        // retrieve generated tojen identifier
        const {jti} =  this.jwtr.decode(token) as {jti: string};
        if (! await this.jwtr.destroy(jti)) throw new NotFoundError(`Error: unknown token`);
        return true;
    }

    // Flush repository 
    async resetData(skipFlush?: boolean): Promise<boolean> {
        console.log(`-> AuthService.resetData(${skipFlush?`skipFlush: ${skipFlush}`:""})`.bgYellow);

        // reset redis db also if required
        if ( ! skipFlush ) {
            console.log(`flushing redis DB`.underline);
            this.flushDB();
        }

        // // Flush userRepository and inject user data Set
        // if (! this.userService.resetData(skipFlush)) return false;
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