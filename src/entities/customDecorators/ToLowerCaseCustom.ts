import { Transform } from "class-transformer";

export function ToLowerCaseCustom() {
    return Transform((stringToLower: string) => stringToLower.toLowerCase())
}
