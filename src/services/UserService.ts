import { ValidationError, validate, ValidatorOptions } from 'class-validator';
import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import Container, { Service } from 'typedi';
import { DeepPartial, ObjectLiteral } from "typeorm";
import { CREATE, UPDATE } from '../entities/customDecorators';
import { userDataSet } from '../entities/dataSet/userDataSet';
import { LoginForm } from '../entities/forms/LoginForm';
import { User } from "../entities/models/User";
import { UserRepository } from '../repositories/UserRepository';
import { BaseService } from './BaseService';
import { AuthService } from './AuthService';

@Service()
export class UserService extends BaseService<User> {
    
    public userRepository: UserRepository;
    public authService: AuthService;
    
    constructor() {
        console.log('Start UserService'.underline);
        super(new User()); // do nothing yet despite provide generic type for service uniqueness validation
        this.userRepository = new UserRepository();
        this.authService = Container.get<AuthService>(AuthService);
        this.resetData(true);
    }
    
    async login(userCredentials: LoginForm): Promise<User> {
        console.log(`-> UserService.login(email: ${userCredentials.email})`.bgYellow);
        
        // user Credentials validation
        // --> NOT NEEDED ANYMORE, processed in controller @Body({ validate: true }) userCredentials: LoginFor
        // const validationRes: Array<ValidationError> = await validate(userCredentials)
        // if (validationRes.length > 0) throw validationRes
        
        // get required properties from validted user Credentials
        const { email, password } = userCredentials
        
        // find user by its email
        let user: Exclude<User, { accessToken: string }>
        try {
            user = await this.userRepository.getById(undefined, { email })
        } catch {
            throw new NotFoundError(`Error: user ${email} not found`)
        }
        
        // authenticate user with password from credentials
        return await this.authService.authenticateUser(password, user);
    }
    
    async logout(currentUser: DeepPartial<User>): Promise<boolean> {
        console.log(`-> UserService.logout(email: ${currentUser.email})`.bgYellow);
        
        // get required properties
        const { email, accessToken } = currentUser

        // find user by its email without accessToken
        try {
            // let user: Exclude<User, { accessToken: string }>
            // user = await this.userRepository.getById(null, { email })
            await this.userRepository.getById(undefined, { email })
        } catch {
            throw new NotFoundError(`Error: user ${email} not found`)
        }

        // destroy token
        return await this.authService.destroyJWT(accessToken as string);
    }
    
    async register(userCredentials: LoginForm): Promise<User> {
        console.log(`-> UserService.register(email: ${userCredentials.email})`.bgYellow);
        
        // get instance from user Credentials validation
        const instance: DeepPartial<User> = await this.getValidatedUser({...userCredentials}, { groups: [CREATE] });
        
        // save instance
        return await this.userRepository.save(instance);
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
            await this.userRepository.getById(undefined, { email });
        } catch (error) {
            return true;
        }
        return false;
    }
    
    async getValidatedUser(user: DeepPartial<User>, validatorOptions?: ValidatorOptions): Promise<DeepPartial<User>> {
        console.log(`--> UserService.getValidatedUser(email: ${user.email})`.bgYellow);
        
        // create new User instance
        let instance: DeepPartial<User> = this.userRepository.getInstance(user);
        
        // validation steps
        const validationResult: Array<ValidationError> = await validate(instance, validatorOptions);
        if (validationResult.length > 0) throw validationResult.map(constraints => constraints);
        
        // salt and hash user instance
        instance = await this.authService.saltAndHashUser(instance);
        
        // reset birthDate since date format issue between mysql and validation constraint type for now
        if (user.birthDate) { instance.birthDate = undefined}
        
        return instance
    }
    
    async create(user: DeepPartial<User>): Promise<User> {
        console.log(`-> UserService.create(email: ${user.email})`.bgYellow);
        // create validated instance
        const instance: DeepPartial<User> = await this.getValidatedUser(user, { groups: [CREATE] });
        //save instance
        return await this.userRepository.save(instance);
    }
    
    async update(id: number, user: DeepPartial<User>, currentUser: DeepPartial<User>): Promise<User> {
        console.log(`-> UserService.update(id: ${id})`.bgYellow);
        
        // check id versus own id if current is user profile
        if (currentUser.profile == 'user' && id != currentUser.id)
        throw new UnauthorizedError(`Operation not allowed on other users than yourself`);

        // validate id
        try {
            await this.userRepository.existsById(id);
        } catch {
            throw new NotFoundError(`Error: user with id ${id} not found`);
        }
        
        const instance: DeepPartial<User> = await this.getValidatedUser(user, { groups: [UPDATE] });
        return await this.userRepository.update(id, instance);
    }
    
    async del(id: number): Promise<User> {
        console.log(`-> UserService.del(id: ${id})`.bgYellow);

        // validate id
        try {
            await this.userRepository.existsById(id);
        } catch {
            throw new NotFoundError(`Error: user with id ${id} not found`);
        }

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
        console.log(`pushing userDataSet`.underline);
        // userDataSet.forEach( async userData => {
        for await (const userData of userDataSet) {
            // get validated instance
            const instance: DeepPartial<User> = await this.getValidatedUser({...userData}, { groups: [CREATE] });
            // save instance
            if ( await this.userRepository.save(instance) == null) return false;
        }

        // reset redis db also
        console.log(`flushing redis DB`.underline);
        this.authService.flushDB();
        return true;
    }
}