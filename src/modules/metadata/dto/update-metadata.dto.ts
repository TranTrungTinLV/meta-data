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

export class UpdateMetadataDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: "Mã sản phẩm", required: false })
  code: string;

  @ApiProperty({ description: "Id category", required: false })
  @IsOptional()
  @IsString()
  category_id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "Tên sản phẩm", required: false })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "chi tiết sản phẩm", required: false })
  detail: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "Quy cách sản phẩm", required: false })
  specification: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "Tiêu chuẩn sản phẩm", required: false })
  standard: string[];

  @IsOptional()
  @ApiProperty({
    description: "đơn vị sản phẩm",
    required: true,
  })
  unit: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  old_images: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({ type: "string", format: "binary", required: false })
  images?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({ description: "Ghi chú sản phẩm", required: false })
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  other_names: string[];
}
