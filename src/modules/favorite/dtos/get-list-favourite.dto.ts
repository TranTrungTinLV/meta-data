import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";

export class GetListFavouriteDto {
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
  @IsString()
  @IsOptional()
  search: string;

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  sort: string;
}
