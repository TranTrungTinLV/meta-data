/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { EUnitProduct } from "src/common/enums";

export class CreateMetadataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Mã sản phẩm", required: true })
  code: string;

  @ApiProperty({ description: "Id category", required: true })
  @IsString()
  category_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Tên sản phẩm", required: true })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "chi tiết sản phẩm", required: true })
  detail: string;

  @ApiProperty({ description: "Ghi chú", required: false })
  @IsOptional()
  @IsString()
  note: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "Quy cách sản phẩm", required: false })
  specification: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "Tiêu chuẩn sản phẩm", required: false })
  standard: string[];

  @IsNotEmpty()
  @ApiProperty({
    description: "đơn vị sản phẩm",
    required: true,
  })
  unit: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", format: "binary", required: false })
  images?: string[];

  @ApiProperty({ required: false, default: [] })
  @IsOptional()
  @IsString()
  other_names: string[];
}
