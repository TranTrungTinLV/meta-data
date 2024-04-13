import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateProductDto {

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Tên danh mục', type: 'string',required: false })

  readonly category_id?: string;

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
  @IsOptional()
  @ApiProperty({ description: 'Ghi chú sản phẩm', required: false })
  readonly note?: string;

  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsArray()
  @IsOptional()
  newImages?: string[];

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ type: 'array', items: { type: 'string' } })
  deleteImages?: string[];

}
