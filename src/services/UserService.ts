import { genSalt, hash } from 'bcrypt';
import { ValidationError, validate, ValidatorOptions } from 'class-validator';
import { config } from 'dotenv';
import { sign } from 'jsonwebtoken';
import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { Service } from 'typedi';
import { DeepPartial, ObjectLiteral } from "typeorm";
import { CREATE, UPDATE } from '../entities/customDecorators';
import { userDataSet } from '../entities/dataSet/userDataSet';
import { LoginForm } from '../entities/forms/LoginForm';
import { User } from "../entities/models/User";
import { UserRepository } from '../repositories/UserRepository';
import { BaseService } from './BaseService';

config()
const { JWT_SECRET } = process.env

@Service()
export class UserService extends BaseService<User> {
    
    public userRepository: UserRepository;
    
    constructor() {
        console.log('Start UserService'.underline);
        super(new User()); // do nothing yet despite provide generic type for service uniqueness validation
        this.userRepository = new UserRepository();
        this.resetData(true);
    }
    
    async login(userCredentials: LoginForm): Promise<User> {
        console.log(`-> UserService.login(email: ${userCredentials.email})`.bgYellow);
        
        // user Credentials validation
        const validationRes: Array<ValidationError> = await validate(userCredentials)
        if (validationRes.length > 0) throw validationRes
        
        // get required properties
        const { email, password } = userCredentials
        
        // find user by its email
        let user: Exclude<User, { accessToken: string }>
        try {
            user = await this.userRepository.getById(null, { email })
        } catch {
            throw new NotFoundError(`user ${userCredentials.email} not found`)
        }
        
        // validate hash from password and user's salt
        try {
            const hashedPass = await hash(password, user.salt)
            if (hashedPass === user.password) {
                delete user.password // unsafe to keep 
                delete user.salt // unsafe to keep 
                // const jwt = sign(JSON.parse(JSON.stringify(user)), JWT_SECRET)
                const jwt = sign({...user}, JWT_SECRET) // similar syntax
                return { ...user, accessToken: jwt }
            } else throw Error()
        } catch {
            throw new UnauthorizedError(`wrong password for ${userCredentials.email}`)
        }
    }
    
    async logout(currentUser: DeepPartial<User>): Promise<boolean> {
        console.log(`-> UserService.logout(email: ${currentUser.email})`.bgYellow);
        
        // get required properties
        const { email } = currentUser

        // find user by its email without accessToken
        let user: Exclude<User, { accessToken: string }>
        try {
            user = await this.userRepository.getById(null, { email })
        } catch {
            throw new NotFoundError(`user ${email} not found`)
        }

        // save user
        await this.userRepository.create(null, { ...user, accessToken: "" });
        return true;
    }
    
    async register(userCredentials: LoginForm): Promise<User> {
        console.log(`-> UserService.register(email: ${userCredentials.email})`.bgYellow);
        
        // get instance from user Credentials validation
        const instance: DeepPartial<User> = await this.getValidatedUser({...userCredentials}, { groups: [CREATE] });
        
        // save instance
        return await this.userRepository.create(null, instance);
    }
    
    async getAll():  Promise<Array<User>> {
        console.log(`-> UserService.getAll()`.bgYellow);
        return await this.userRepository.getAll();
    }
    
    async getById(id: number, where?: ObjectLiteral): Promise<User> {
        console.log(`-> UserService.getById(id: ${id}, where: ${JSON.stringify(where)})`.bgYellow);
        return await this.userRepository.getById(id, where);
    }
    
    async isUnique(email: string): Promise<boolean> {
        console.log(`--> UserService.isUnique(email: ${email})`.bgYellow);
        try {
            await this.userRepository.getById(null, { email });
        } catch (error) {
            return true;
        }
        return false;
    }
    
    async getValidatedUser(user: DeepPartial<User>, validatorOptions?: ValidatorOptions): Promise<DeepPartial<User>> {
        console.log(`--> UserService.getValidatedUser(email: ${user.email})`.bgYellow);
        // console.log(`User: `, user);
        
        // create new User instance
        const instance: DeepPartial<User> = this.userRepository.getInstance(user);
        
        // validation steps
        const validationResult: Array<ValidationError> = await validate(instance, validatorOptions);
        if (validationResult.length > 0) throw validationResult.map(constraints => constraints);
        
        // check email unicity already done in custom validator decorator : IsUniqueCustom
        // if ( user.email && ! await this.isUnique(user.email)) throw `email ${user.email} is not unique`;
        
        // generate salt & hash password with salt if any
        if (instance.password) {
            instance.salt = await genSalt();
            instance.password = await hash(user.password || "", instance.salt);
        }
        
        // reset birthDate since date format issue between mysql and validation constraint type for now
        if (user.birthDate) { instance.birthDate = null}
        
        console.log(`Instance: `, instance);
        return instance
    }
    
    async create(user: DeepPartial<User>): Promise<User> {
        console.log(`-> UserService.create(email: ${user.email})`.bgYellow);
        const instance: DeepPartial<User> = await this.getValidatedUser(user, { groups: [CREATE] });
        return await this.userRepository.create(user, instance);
    }
    
    async update(id: number, user: DeepPartial<User>, currentUser: DeepPartial<User>): Promise<User> {
        console.log(`-> UserService.update(id: ${id})`.bgYellow);
        // check id versus own id if current is user profile
        if (currentUser.profile == 'user' && id != currentUser.id)
        throw new UnauthorizedError(`Operation not allowed on other users than yourself`);
        
        const instance: DeepPartial<User> = await this.getValidatedUser(user, { groups: [UPDATE] });
        return await this.userRepository.update(id, instance);
    }
    
    async del(id: number): Promise<User> {
        console.log(`-> UserService.del(id: ${id})`.bgYellow);
        return this.userRepository.del(id);
    }
    
    // Flush repository and inject user data Set
    async resetData(skipFlush?: boolean): Promise<boolean> {
        console.log(`-> UserService.resetData(${skipFlush?`skipFlush: ${skipFlush}`:""})`.bgYellow);
        
        // flush Repository if needed
        if ( ! skipFlush && (await this.userRepository.getAll()).length > 0) {
            console.log('UserRepository is not empty -> flushing ...');
            if (! await this.userRepository.flush()) return false;
        }
        
        // push data set
        console.log(`-> push userDataSet`.bold);
        // userDataSet.forEach( async userData => {
        for await (const userData of userDataSet) {
            // get validated instance
            const instance: DeepPartial<User> = await this.getValidatedUser({...userData}, { groups: [CREATE] });
            // save instance
            if ( await this.userRepository.create(null, instance) == null) return false;
        }
        // })
    }
}