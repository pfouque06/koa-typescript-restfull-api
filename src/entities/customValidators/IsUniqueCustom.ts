import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import Container from "typedi";
import { BaseService } from "../../services/BaseService";

export function IsUniqueCustom(
    service: Function,
    validationOptions?: ValidationOptions
) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            name: "IsUniqueCustom",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            async: true,
            validator: {
                async validate(isUniqueValue: any, args: ValidationArguments): Promise<boolean> {
                    const svc = Container.get(service) as BaseService<any>;
                    try {                  
                        // return await svc.checkService(isUniqueValue)
                        return await svc.isUnique( { [args.property]: isUniqueValue })
                    } catch (error) {
                        return true;
                    }
                    // return false
                },
                defaultMessage(args: ValidationArguments): string { // here you can provide default error message if validation failed
                    const { property } = args;
                    return `${property} already exists in this entity - not unique`;
                }
            }
        });
    }

}