import { services } from "../services"
import Container from "typedi"
import { useContainer } from "routing-controllers"

//////////////////////////////////////////////////////
// RESTFULL factory : Controllers, Services & Repository

export const restfullFactory = async (): Promise<void> => {
    
    // declare Services & Repository with typedi module
    services.forEach( (service) => {
        Container.set(service, new service())
    })
    
    // declare services to controllers with routing-controllers module
    useContainer(Container)
}