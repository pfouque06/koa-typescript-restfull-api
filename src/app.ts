import 'colors';
import { DataBaseFactory, RestfullFactory, HttpServerFactory } from './factories';
import { Logger } from './factories/Logger';

const startApp = async () => {
    console.log(`--------------------------------------------------`);
    console.log(`${Logger.isoDate()} startApp()`.bgBlack.white);
    
    // DB Factory
    await DataBaseFactory.init();
    
    // RESTFULL Factory
    await RestfullFactory.init();
    
    // HTTP Server Factory
    await HttpServerFactory.init();
}

startApp();