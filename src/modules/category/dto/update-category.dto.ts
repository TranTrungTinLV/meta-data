import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "category 1" })
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category_parent_id?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  icon_name?: string;
}
