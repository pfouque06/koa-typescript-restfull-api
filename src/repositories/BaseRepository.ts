import { Repository, ObjectLiteral, DeepPartial } from "typeorm"

export class BaseRepository<T> {
    public readonly repo: Repository<T>;
    
    constructor(repo: Repository<T>) {
        this.repo = repo;
    }
    
    async getData(): Promise<Array<T>> {
        return await this.repo.find();
    }
    
    async getById(id: number, where?: ObjectLiteral): Promise<T> {
        if (where) {
            return await this.repo.findOneOrFail(id, { where });
        } else {
            return await this.repo.findOneOrFail(id);
        }
    }
    
    async create(data: DeepPartial<T>, entityAlreadyCreated?: DeepPartial<T>): Promise<T> {
        const entity: DeepPartial<T> = entityAlreadyCreated || this.getInstance(data);
        return await this.repo.save(entity);
    }
    
    getInstance(data: DeepPartial<T>): DeepPartial<T> {
        return this.repo.create(data);
    }
    
    async update(id: number, body: DeepPartial<T>): Promise<T> {
        await this.repo.update(id, body);
        return this.getById(id);
    }
    
    async del(id: number): Promise<T> {
        const entity = await this.getById(id);
        await this.repo.delete(id);
        return entity;
    }
}