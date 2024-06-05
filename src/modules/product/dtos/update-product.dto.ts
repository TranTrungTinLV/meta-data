/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class UpdateProductDto {
  @ApiProperty({ example: "" })
  @IsOptional()
  @IsString()
  metadata_id: string;

  @ApiProperty({ example: 12 })
  @IsOptional()
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 92000 })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({ example: "Customer" })
  @IsOptional()
  @IsString()
  position: string;

  @ApiProperty({ example: "2024-05-10T18:58:41.550+00:00" })
  @IsOptional()
  @IsDateString()
  date_of_manufacture: string;

  @ApiProperty({ example: "2024-05-10T18:58:41.550+00:00" })
  @IsOptional()
  @IsDateString()
  expired_date: string;

  @ApiProperty({ example: "Note here" })
  @IsOptional()
  @IsString()
  note: string;
}
