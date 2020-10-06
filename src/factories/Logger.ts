export class Logger {

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