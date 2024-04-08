import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCategoryDto{
    @ApiProperty({
        description: 'tên danh mục',
        required: true
    })
    @IsString()
    readonly name: string;

}