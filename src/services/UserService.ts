import { genSalt, hash } from 'bcrypt';
import { ValidationError, validate, ValidatorOptions } from 'class-validator';
import { Service } from 'typedi';
import { Connection, DeepPartial, ObjectLiteral } from "typeorm";
import { CREATE, UPDATE } from '../entities/customValidators';
import { User } from "../entities/User";
import { UserRepository } from '../repositories/UserRepository';
import { BaseService } from './BaseService';

@Service()
export class UserService extends BaseService<User> {
    
    public userRepository: UserRepository;
    
    constructor(db: Connection) {
        super(); // do nothing yet despite provide generic type for service uniqueness validation
        this.userRepository = new UserRepository(db);
        console.log('Start UserService'.underline);
    }
    
    async getData():  Promise<Array<User>> {
        console.log(`-> UserService.getAll()`.bgYellow);
        return await this.userRepository.getData();
    }
    
    async getById(id: number, where?: ObjectLiteral): Promise<User> {
        console.log(`-> UserService.getById(id: ${id})`.bgYellow);
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

    async validatedUser(user: DeepPartial<User>, validatorOptions?: ValidatorOptions): Promise<DeepPartial<User>> {
        console.log(`--> UserService.validatedUser(email: ${user.email})`.bgYellow);
        console.log(`User: `, user);

        // create new User instance
        const instance: DeepPartial<User> = this.userRepository.getInstance(user);
        
        // validation steps
        const validationResult: Array<ValidationError> = await validate(instance, validatorOptions);
        if (validationResult.length > 0) throw validationResult;
        
        // check email unicity
        if ( user.email && ! await this.isUnique(user.email)) throw `email ${user.email} is not unique`;

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
        const instance: DeepPartial<User> = await this.validatedUser(user, { groups: [CREATE] });
        return await this.userRepository.create(user, instance);
    }
    
    async update(id: number, user: DeepPartial<User>): Promise<User> {
        console.log(`-> UserService.update(id: ${id})`.bgYellow);
        const instance: DeepPartial<User> = await this.validatedUser(user, { groups: [UPDATE] });
        return await this.userRepository.update(id, instance);
    }
    
    async del(id: number): Promise<User> {
        console.log(`-> UserService.del(id: ${id})`.bgYellow);
        return this.userRepository.del(id);
    }
    
}