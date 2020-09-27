import 'colors';
import { ObjectLiteral } from 'typeorm';

export abstract class BaseService<T> {

    // public repository: BaseRepository<T>;

    async abstract getById(id: number, where?: ObjectLiteral): Promise<T>;

    async abstract isUnique(password: string): Promise<boolean>;

    async checkService(): Promise<boolean> {
        return true;
        // todo : identify how to check T type !!!!
        // return typeof object === T
        // if (object as T) {
        //     return true;
        // }
        // return false;
    }
}