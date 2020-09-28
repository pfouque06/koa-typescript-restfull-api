import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import { getConnection } from "typeorm";

export function IsUniqueCustom(entityClass: Function, validationOptions?: ValidationOptions) {
    console.log(`@IsUniqueCustom(${entityClass.name}) initialized`.underline);
    return (object: Object, propertyName: string) => {
        registerDecorator({
            name: "IsUniqueCustom",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            async: true,
            validator: {
                async validate(isUniqueValue: any, args: ValidationArguments): Promise<boolean> {
                    console.log(`--> IsUniqueCustom.validate(${entityClass.name}, { [${args.property}]: ${isUniqueValue} })`.bgBlue);
                    try {                  
                        // console.log(await getConnection().getRepository(entityClass).findOneOrFail(null, { where: { [args.property]: isUniqueValue }}));
                        await getConnection().getRepository(entityClass).findOneOrFail(null, { where: { [args.property]: isUniqueValue }});
                    } catch (error) {
                        console.log(`\t${entityClass.name}.${args.property}: ${isUniqueValue} is unique`.green);
                        return true;
                    }
                    console.log(`\t${entityClass.name}.${args.property}: ${isUniqueValue} is NOT unique`.red);
                    return false;
                },
                defaultMessage(args: ValidationArguments): string { // here you can provide default error message if validation failed
                    const { property } = args;
                    return `${property} already exists in this entity - not unique`;
                }
            }
        });
    }
    
}