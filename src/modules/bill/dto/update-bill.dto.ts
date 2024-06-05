import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CreateMetadataBillDto } from "src/modules/metadata-bill/dto";

export class UpdateBillDto {
  @ApiProperty({ required: true, example: "CODE_001" })
  @IsString()
  @IsOptional()
  bill_code: string;

  @ApiProperty({ required: true, example: "SGOD" })
  @IsString()
  @IsOptional()
  organization: string;

  @ApiProperty({ required: true, example: "Bill 001" })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ required: true, example: 1 })
  @IsNumber()
  @IsOptional()
  bill_number: number;

  @ApiProperty({ required: true, example: "NX2510" })
  @IsString()
  @IsOptional()
  product: string;

  @ApiProperty({ required: true, example: "Điện tử" })
  @IsString()
  @IsOptional()
  department: string;

  @ApiProperty({ required: true, example: "X51" })
  @IsString()
  @IsOptional()
  factory: string;

  @ApiProperty({ required: true, example: "Tổ D" })
  @IsString()
  @IsOptional()
  part: string;

  @ApiProperty({ required: true, example: "Sửa chữa ngành điện" })
  @IsString()
  @IsOptional()
  bill_content: string;

  @ApiProperty({ required: true, example: "2024-05-31T02:48:53.981+00:00" })
  @IsString()
  @IsOptional()
  date_begin: string;

  @ApiProperty({ required: true, example: "2024-06-03T02:48:53.981+00:00" })
  @IsString()
  @IsOptional()
  date_end: string;

  @ApiProperty({
    required: true,
    example: [
      {
        metadata_id: "",
        quantity_estimates: 12,
        quantity_offer: 10,
        quantity_real: 10,
        note: "Note content",
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateMetadataBillDto)
  @IsOptional()
  metadatas: CreateMetadataBillDto[];

  @ApiProperty({ required: true, example: "2024-06-03T03:14:36.397+00:00" })
  @IsString()
  @IsOptional()
  date_export: string;

  @ApiProperty({ required: true, example: "Nguyễn Đức Đức" })
  @IsString()
  @IsOptional()
  technician: string;

  @ApiProperty({ required: true, example: "Nguyễn Đức Nam" })
  @IsString()
  @IsOptional()
  manager: string;

  @ApiProperty({ required: true, example: "Nguyễn Đức Anh" })
  @IsString()
  @IsOptional()
  vice_director: string;
}
