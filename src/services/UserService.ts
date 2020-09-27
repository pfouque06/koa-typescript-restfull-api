import { genSalt, hash } from 'bcrypt';
import { ValidationError, validate } from 'class-validator';
import { Service } from "typedi/decorators/Service";
import { Connection, DeepPartial, ObjectLiteral } from "typeorm";
import { User } from "../entities/User";
import { UserRepository } from '../repositories/UserRepository';

@Service()
export class UserService {
    
    public userRepository: UserRepository;
    
    constructor(db: Connection) {
        this.userRepository = new UserRepository(db);
        console.log('Start UserService'.underline);
    }
    
    async getData():  Promise<Array<User>> {
        console.log(`-> UserService.getAll()`.bgYellow);
        return await this.userRepository.getData();
    }
    
    async getById(id: number, where?: ObjectLiteral): Promise<User> {
        console.log(`-> UserService.getById(${id})`.bgYellow);
        return await this.userRepository.getById(id);
    }
    
    async create(user: DeepPartial<User>, entityAlreadyCreated?: DeepPartial<User>): Promise<User> {
        console.log(`-> UserService.create(${user.email})`.bgYellow);
        // create new User instance
        const instance: DeepPartial<User> = this.userRepository.getInstance(user);
        
        // validattion steps
        const validationResult: Array<ValidationError> = await validate(instance);
        if (validationResult.length > 0) throw validationResult;
        
        // reset birthDate since date format issue between mysql and validation constraint type for now
        if (user.birthDate) { instance.birthDate = null}
        
        // generate salt & hash password with salt
        instance.salt = await genSalt();
        instance.password = await hash(user.password || "", instance.salt);
        console.log(`Instance: `, instance);
        return await this.userRepository.create(user, instance);
    }
    
    async update(id: number, user: DeepPartial<User>): Promise<User> {
        console.log(`-> UserService.update(${id})`.bgYellow);
        // handle password change request if any
        if (user.password) {
            // generate salt & hash password with salt
            user.salt = await genSalt();
            user.password = await hash(user.password || "", user.salt);
        }
        console.log(`User: `, user);
        return await this.userRepository.update(id, user);
    }
    
    async del(id: number): Promise<User> {
        console.log(`-> UserService.del(${id})`.bgYellow);
        return this.userRepository.del(id);
    }
    
}