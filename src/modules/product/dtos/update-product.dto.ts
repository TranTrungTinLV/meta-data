import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateProductDto {

  @IsString()
  @IsNotEmpty()
  readonly category_id?: string;

  @IsString()
  @IsNotEmpty()
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
  @IsOptional()
  readonly note?: string;
}
