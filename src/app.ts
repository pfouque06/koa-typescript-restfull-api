import 'colors';
import { DBconnection } from './factories/DataBaseFactory';
import { restfullFactory } from './factories/RestfullFactory';
import { httpServerFactory } from './factories/HttpServerFactory';

const startApp = async () => {
    
    // DB Factory
    await DBconnection();
    
    // RESTFULL Factory
    await restfullFactory();
    
    // HTTP Server Factory
    await httpServerFactory();
}

startApp();