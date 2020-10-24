import { KoaMiddlewareInterface, Middleware } from "routing-controllers";

@Middleware({ type: "before" })
export class LogMiddleware implements KoaMiddlewareInterface {

    use(context: any, next: (err?: any) => Promise<any>): Promise<any> {
        // console.log('host: ', context.request.host.split(':')[0]);
        
        switch ( context.request.host.split(':')[0]) {
            case "localhost":
            case "minas01": 
            case "nodejs.koa-typescript-restfull-api.pfouque.fr": { 
                this.useLog(context); 
                return next().then(() => {
                    console.log();
                }).catch(error => {
                    console.log();
                });
            }
            default: {
                return next();
            }
        }
    }

    private useLog(context: any) {
        console.log(`--------------------------------------------------`.bgCyan);
        let log: string = LogMiddleware.isoDate();
        // log += ' [IP src: ' + context.ip.replace(/^.*:/, '') + ']';
        const ipArray = context.ip.split(':')
        const ipSrc = ipArray[ipArray.length - 1]
        log += ' [IP src: ' + ipSrc + ']';
        log += ' ' + context.request.method + '/' + context.request.host + context.request.url;
        console.log(log.bgCyan);
    }

    public static isoDate(): string {
        const date=new Date();
        // const myDate: string  = 
        // date.toLocaleString( 'fr', {  year: 'numeric' }) + "/" +
        // date.toLocaleString( 'fr', {  month: '2-digit' }) + "/" +
        // date.toLocaleString( 'fr', {  day: '2-digit' }) + " " +
        // date.toLocaleString( 'fr', {  hour: '2-digit' }) + ":" +
        // date.toLocaleString( 'fr', {  minute: '2-digit' }) + ":" +
        // date.toLocaleString( 'fr', {  second: '2-digit' }) + "." +
        // date.toLocaleString( 'fr', {  second: '2-digit' }) ;
        // const isoDate=new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const isoDate=new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace(/T/, ' ').replace(/Z$/, '');
        return isoDate;
    }
}