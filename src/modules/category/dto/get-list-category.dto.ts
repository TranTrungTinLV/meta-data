import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";

export class GetListCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  page: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  limit: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  offset: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;
}
