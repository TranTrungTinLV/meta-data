import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto { 
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: 'string',
        required: true
    })
    name: string;

    @IsArray()
    
    @IsMongoId({each:true})
    parent: string;
}