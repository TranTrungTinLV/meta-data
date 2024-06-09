import { IsNumber, IsString } from "class-validator";

export class CreateMetadataBillDto {
  @IsString()
  metadata_id: string;

  @IsNumber()
  quantity_estimates: number;

  @IsNumber()
  quantity_offer: number;

  @IsNumber()
  quantity_real: number;

  @IsString()
  note: string;
}
