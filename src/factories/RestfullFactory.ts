import { Logger } from ".";
import { BaseFactory } from './BaseFactory';
import Container from "typedi"
import { services, UserService } from "../services"

//////////////////////////////////////////////////////
// RESTFULL factory : Controllers, Services & Repository

export class RestfullFactory extends BaseFactory {

    async init(): Promise<void> {
        console.log(`${Logger.isoDate()} RestfullFactory.init()`.bgBlack.white);

        // declare Services & Repository with typedi module
        services.forEach( (service) => {
            Container.set(service, new service());
        })

        // inject user Data
        await Container.get<UserService>(UserService).resetData(true);
    }
}