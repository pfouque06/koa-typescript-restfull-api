import {registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import * as moment from "moment";


@ValidatorConstraint({ async: true })
export class IsDateStringConstraints implements ValidatorConstraintInterface {
    
    private readonly isValid: (input: string, format: string) => boolean

    constructor() {
        this.isValid = (inp: string, format: string) => moment(inp, format).isValid();
    }

    validate(inputDate: string, args: ValidationArguments): boolean { // for async validations you must return a Promise<boolean> here
        return (
            this.isValid(inputDate, 'DD/MM/YYYY') ||
            this.isValid(inputDate, 'MM/DD/YYYY') ||
            inputDate === null
        )
    }
    
    defaultMessage(args: ValidationArguments): string { // here you can provide default error message if validation failed
        const { property } = args;
        return `${property} should be in date format DD/MM/YYYY or MM/DD/YYYY`;
    }
}

export function IsDateStringCustom(validationOptions?: ValidationOptions) {
    // return function (object: Object, propertyName: string) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            name: "IsDateStringCustom",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            async: false,
            // validator: {
            //     validate(value: any, args: ValidationArguments) {
            //         const [relatedPropertyName] = args.constraints;
            //         const relatedValue = (args.object as any)[relatedPropertyName];
            //         return  typeof value === "string" &&
            //         typeof relatedValue === "string" &&
            //         value.length > relatedValue.length; // you can return a Promise<boolean> here as well, if you want to make async validation
            //     }
            // }
            validator: IsDateStringConstraints,
        });
    };
}