import { Repository, ObjectLiteral, DeepPartial, Connection } from "typeorm"

export class BaseRepository<T> {
    public readonly db: Connection;
    public readonly repo: Repository<T>;
    
    constructor(db: Connection, repo: Repository<T>, type: T) {
        console.log(`Start BaseRepository<${typeof type}>`.underline );
        this.db = db;
        this.repo = repo;
    }
    
    async getAll(): Promise<Array<T>> {
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
    
    // repositor flush function
    async flush(): Promise<boolean> {
        console.log(`-> BaseRepository.flush()`.bold);
        
        console.log(`dropping all tables`.underline);
        // await this.repo.clear() --> mySQL error with TRUNCATE mode --> flush db via Connection method
        await this.db.synchronize(true) // true will drop tables after initial connection
        .then(() => console.log(`synchronized with DB!`.bgGreen.bold))
        .catch(() => { console.log('Failed to sync with DB!'.bgRed.bold); return false});

        // !!!!! make better sql query to drop exact table and cascaded tables
        // DROP TABLE `koatypescript`.`users`;

        return true;
    }

    // push data set function 
    async pushDataSet(users: Array<DeepPartial<T>>): Promise<boolean> {
        console.log(`-> BaseRepository.pushDataSet()`.bold);
        users.forEach( async user => await this.create(null, user));
        return true;
    }
}