import { IsNumber, IsString } from 'class-validator';

export class FilterExportDto {
  @IsString()
  code?: string;
  @IsString()
  name?: string;
  @IsNumber()
  minQuantity?: number;
  @IsNumber()
  maxQuantity?: number;
  @IsString()
  category_id?: string;
}
