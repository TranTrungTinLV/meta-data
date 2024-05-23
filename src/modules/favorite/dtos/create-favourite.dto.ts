import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateFavouriteDto {
  @ApiProperty({ required: true, example: "" })
  @IsString()
  product_id: string;
}
