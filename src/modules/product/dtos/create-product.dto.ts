import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @IsString()
  @IsNotEmpty()
  readonly category_id?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Tên sản phẩm', required: false })

  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly detail: string;

  @IsString()
  @IsNotEmpty()
  readonly specification: string;

  @IsString()
  @IsNotEmpty()
  readonly standard: string;

  @IsString()
  @IsNotEmpty()
  readonly unit: string;

  @IsNumber()
  @IsNotEmpty()
  readonly quantity?: number;

  @IsString()
  @IsNotEmpty()
   images?: string[];

  @IsString()
  @IsOptional()
  readonly note?: string;
}
