import 'colors';
import { Service } from "typedi";
import { ObjectLiteral } from 'typeorm';
import { BaseRepository } from '../repositories/BaseRepository';

@Service()
export class BaseService<T> {

    // public repository: BaseRepository<T>;

    async isUnique(where: ObjectLiteral): Promise<boolean> {
        return true;
        // if (where) {
            // return await this.repository.getById(id, { where });
        // } else {
        //     return await this.repository.getById(id);
        // }
    }

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