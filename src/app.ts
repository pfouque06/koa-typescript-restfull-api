import 'colors';
import { DataBaseFactory, RestfullFactory, HttpServerFactory } from './factories';

const startApp = async () => {
    console.log(`--------------------------------------------------`);
    console.log(`${new Date().toISOString()} startApp()`.bgBlack.white);
    
    // DB Factory
    await DataBaseFactory.init();
    
    // RESTFULL Factory
    await RestfullFactory.init();
    
    // HTTP Server Factory
    await HttpServerFactory.init();
}

startApp();