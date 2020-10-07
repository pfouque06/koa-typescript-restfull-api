import { services } from "../services"
import Container from "typedi"
import { UserService } from "../services/UserService"
import { Logger } from "./Logger";

//////////////////////////////////////////////////////
// RESTFULL factory : Controllers, Services & Repository

export class RestfullFactory {

    public static async init(): Promise<void> {
        console.log(`${Logger.isoDate()} RestfullFactory.init()`.bgBlack.white);

        // declare Services & Repository with typedi module
        services.forEach( (service) => {
            Container.set(service, new service());
        })

        // inject user Data
        await Container.get<UserService>(UserService).resetData(true);
    }
}