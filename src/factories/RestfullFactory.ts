import { services } from "../services"
import Container from "typedi"
import { UserService } from "../services/UserService"

//////////////////////////////////////////////////////
// RESTFULL factory : Controllers, Services & Repository

export const restfullFactory = async (): Promise<void> => {
    
    // declare Services & Repository with typedi module
    services.forEach( (service) => {
        Container.set(service, new service());
    })

    // inject user Data
    await Container.get<UserService>(UserService).resetData(true);
}