import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray } from "class-validator";

export class BulkDeleteProductDto {
  @ApiProperty({ required: true, isArray: true, example: [] })
  @IsArray()
  @ArrayMinSize(1)
  listProductId: string[];
}
