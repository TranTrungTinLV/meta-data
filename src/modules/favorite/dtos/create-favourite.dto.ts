import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateFavouriteDto {
  @ApiProperty({ required: true, example: "" })
  @IsString()
  metadata_id: string;
}
