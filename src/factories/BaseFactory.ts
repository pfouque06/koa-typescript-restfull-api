export abstract class BaseFactory {

    constructor() {}
    
    async abstract init():  Promise<void>;
}