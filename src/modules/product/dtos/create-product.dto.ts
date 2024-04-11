import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductDto {
  
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Mã sản phẩm', required: false })
  readonly code: string;

  // @IsString()
  // @IsNotEmpty()
  // @ApiProperty({description: 'danh mục',required: false})
  // readonly category_id?: string;


  // @ApiProperty({ description: 'Mảng ID của danh mục', type: 'array', items: { type: 'string' }, required: false })
  // @IsNotEmpty()
  // @IsArray()
  // @IsMongoId({ each: true })
  // category_id: string[];

  @ApiProperty({ description: 'Tên danh mục', type: 'string' })
  @IsOptional()
  @IsMongoId()
  // @IsString({ each: true })
  readonly categoryName: string;


  // @ApiProperty({ description: 'Tên danh mục', type: 'array', items: { type: 'string' }, required: false })
  // @IsString({ each: true })
  // readonly categoryName: string[];

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
  @ApiProperty({type:'string', format:'binary',required:false})
   images?: string[];

  @IsString()
  @IsOptional()
  readonly note?: string;

  // @IsOptional()
  // @IsMongoId()
  // readonly categoryId?: string;
}
