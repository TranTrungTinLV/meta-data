import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Mã sản phẩm', required: false })
  readonly code: string;

  @ApiProperty({ description: 'Tên danh mục', type: 'string', required: false })
  @IsString()
  // @IsString({ each: true })
  readonly category_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Tên sản phẩm', required: false })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'chi tiết sản phẩm', required: false })
  readonly detail: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Quy cách sản phẩm', required: false })
  readonly specification: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Tiêu chuẩn sản phẩm', required: false })
  readonly standard: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'đơn vị sản phẩm', required: false })
  readonly unit: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Số lượng sản phẩm', required: false })
  readonly quantity?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  images?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Ghi chú sản phẩm', required: false })
  readonly note?: string;
}
