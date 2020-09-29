import 'colors';
import { DeepPartial, ObjectLiteral } from 'typeorm';

export abstract class BaseService<T> {

    // public repository: BaseRepository<T>;

    // constructor(repo: Repository<T>, type: T) {
    //     // this.repository = new BaseRepository<T>(repo, type);
    //     console.log(`Start BaseService<${typeof type}>`.underline);
    // }
    
    constructor(type: T) {
        // console.log(`Start BaseService<${typeof type}>`.underline);
    }

    // CRUD operations
    async abstract getData():  Promise<Array<T>>;
    async abstract getById(id: number, where?: ObjectLiteral): Promise<T>;
    async abstract create(user: DeepPartial<T>): Promise<T>;
    async abstract update(id: number, user: DeepPartial<T>, currentUser: DeepPartial<T>): Promise<T>;
    async abstract del(id: number): Promise<T>;
}