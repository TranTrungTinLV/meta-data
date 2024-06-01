/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";

export class GetListProductDto {
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
  @IsNumberString()
  @IsOptional()
  sort: string;

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  search: string;
}
