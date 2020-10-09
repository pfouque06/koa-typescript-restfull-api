import { BaseFactory } from './BaseFactory';
import Container from "typedi"
import { services, UserService } from "../services"
import { LogMiddleware } from "../middleware";

//////////////////////////////////////////////////////
// RESTFULL factory : Controllers, Services & Repository

export class RestfullFactory extends BaseFactory {

    async init(): Promise<void> {
        console.log(`${LogMiddleware.isoDate()} RestfullFactory.init()`.bgBlack.white);

        // declare Services & Repository with typedi module
        services.forEach( (service) => {
            Container.set(service, new service());
        })

        // inject user Data
        await Container.get<UserService>(UserService).resetData(true);
    }
}