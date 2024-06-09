import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray } from "class-validator";

export class BulkDeleteBillDto {
  @ApiProperty({ required: true, example: [] })
  @IsArray()
  @ArrayMinSize(1)
  list_bill_id: string[];
}
