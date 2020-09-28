import 'colors';
import { ObjectLiteral } from 'typeorm';

export abstract class BaseService<T> {

    // public repository: BaseRepository<T>;

    // constructor(repo: Repository<T>, type: T) {
    //     // this.repository = new BaseRepository<T>(repo, type);
    //     console.log(`Start BaseService<${typeof type}>`.underline);
    // }
    
    constructor(type: T) {
        // console.log(`Start BaseService<${typeof type}>`.underline);
    }

    async abstract getById(id: number, where?: ObjectLiteral): Promise<T>;

    async abstract isUnique(password: string): Promise<boolean>;
}