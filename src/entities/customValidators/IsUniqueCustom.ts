import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import Container from "typedi";
import { BaseService } from "../../services/BaseService";

export function IsUniqueCustom(
    serviceClass: Function,
    validationOptions?: ValidationOptions
) {
    console.log(`-> IsUniqueCustom(${serviceClass})`.bgBlue);
    return (object: Object, propertyName: string) => {
        registerDecorator({
            name: "IsUniqueCustom",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            async: true,
            validator: {
                async validate(isUniqueValue: any, args: ValidationArguments): Promise<boolean> {
                    console.log(`-> IsUniqueCustom.validate(${serviceClass})`.bgBlue);
                    const svc = Container.get(serviceClass) as BaseService<any>;
                    // const svc = Container.get(serviceClass);
                    // try {                  
                    //     // return await svc.checkService(isUniqueValue);
                    //     // return await svc.isUnique( { [args.property]: isUniqueValue });
                    //     await svc.getById(null, { [args.property]: isUniqueValue })
                    // } catch (error) {
                    //     return true;
                    // }
                    // return false
                    return true
                },
                defaultMessage(args: ValidationArguments): string { // here you can provide default error message if validation failed
                    const { property } = args;
                    return `${property} already exists in this entity - not unique`;
                }
            }
        });
    }

}