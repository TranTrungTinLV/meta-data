import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class FavoriteDto{

    @ApiProperty({ description: 'Tên sản phẩm lưu trữ', type: 'string',required: true })
    @IsString()
    // @IsString({ each: true })
    readonly product_id: string;
}