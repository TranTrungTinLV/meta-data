import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class SearchCategoryFilter {
    @ApiProperty({
        description: 'tên danh mục',
        required: false
    })
    @IsString()
    readonly name: string;

}