import { IsArray, IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto { 
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsMongoId({each:true})
    parent: string;
}