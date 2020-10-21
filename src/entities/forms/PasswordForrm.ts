import { IsDefined, IsString } from "class-validator";

export class PasswordForm {

    @IsDefined()
    @IsString()
    // @Length(5, 25)
    // @Exclude() // -> exclude prop from json on ouput
    password!: string;

    @IsDefined()
    @IsString()
    // @Length(5, 25)
    // @Exclude() // -> exclude prop from json on ouput
    newPassword!: string;
}
