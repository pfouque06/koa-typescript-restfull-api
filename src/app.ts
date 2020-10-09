import 'colors';
import { restfullFactories } from './factories';
import { LogMiddleware } from './middleware';

const startApp = async () => {
    console.log(`--------------------------------------------------`);
    console.log(`${LogMiddleware.isoDate()} startApp()`.bgBlack.white);
    
    // declare Services, related Repositories with typedi module for dependancy injection :
    for await (const factory of restfullFactories) {
        await new factory().init();
    }
}

startApp();