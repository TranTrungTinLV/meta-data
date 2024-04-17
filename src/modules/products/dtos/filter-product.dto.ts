import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterProductDto {

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Tên sản phẩm', required: false })

  readonly name: string;

  @ApiPropertyOptional({ description: 'ID của danh mục để lọc sản phẩm theo danh mục' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'số trang sản phẩm', required: false })

  readonly page: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'giới hạn trang sản phẩm', required: false })
  readonly limit: number;

}
