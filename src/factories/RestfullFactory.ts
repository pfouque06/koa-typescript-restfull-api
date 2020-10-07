import { services } from "../services"
import Container from "typedi"
import { UserService } from "../services/UserService"

//////////////////////////////////////////////////////
// RESTFULL factory : Controllers, Services & Repository

export class RestfullFactory {

    public static async init(): Promise<void> {
        console.log(`${new Date().toISOString()} RestfullFactory.init()`.bgBlack.white);

        // declare Services & Repository with typedi module
        services.forEach( (service) => {
            Container.set(service, new service());
        })

        // inject user Data
        await Container.get<UserService>(UserService).resetData(true);
    }
}