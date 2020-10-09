import { KoaMiddlewareInterface, Middleware } from "routing-controllers";

@Middleware({ type: "before" })
export class LogMiddleware implements KoaMiddlewareInterface {

    use(context: any, next: (err?: any) => Promise<any>): Promise<any> {
        // console.log(context);
        console.log(`--------------------------------------------------`.bgCyan);
        let log: string = LogMiddleware.isoDate();
        log += ' [IP src: ' + context.ip.replace(/^.*:/, '') + ']';
        log += ' ' + context.request.method + '/' + context.request.host + context.request.url;
        console.log(log.bgCyan);
        return next().then(() => {
            console.log();
        }).catch(error => {
            console.log();
        });
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