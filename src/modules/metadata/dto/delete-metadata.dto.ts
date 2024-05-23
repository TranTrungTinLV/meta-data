import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray } from "class-validator";

export class BulkDeleteMetadataDto {
  @ApiProperty({ required: true, isArray: true, example: [] })
  @IsArray()
  @ArrayMinSize(1)
  listMetadataId: string[];
}
