import 'colors';
import { Logger, restfullFactories } from './factories';

const startApp = async () => {
    console.log(`--------------------------------------------------`);
    console.log(`${Logger.isoDate()} startApp()`.bgBlack.white);
    
    // declare Services, related Repositories with typedi module for dependancy injection :
    for await (const factory of restfullFactories) {
        await new factory().init();
    }
}

startApp();